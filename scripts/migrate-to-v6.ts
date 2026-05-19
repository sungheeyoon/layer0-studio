#!/usr/bin/env tsx
// One-shot migration: src/themes/<theme>/presets/* → src/templates/<category>/<leaf>/
//
// Issue #6 (β model). After this runs, src/themes/ can be deleted.
// Run:  pnpm tsx scripts/migrate-to-v6.ts

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC_THEMES = path.join(ROOT, 'src/themes');
const SRC_TEMPLATES = path.join(ROOT, 'src/templates');

interface PresetMeta {
  slug: string;
  version: string;
  thumbnailPath: string;
  componentKeys: string[];
  globalStylesOverride: Record<string, string>;
  defaultsName: string;
  defaultsDescription: string;
  defaultsCategory: string;
  rawText: string;
}

function parsePresetFile(filePath: string): PresetMeta {
  const text = fs.readFileSync(filePath, 'utf-8');
  const slug = /slug:\s*['"]([^'"]+)['"]/.exec(text)?.[1] ?? '';
  const version = /version:\s*['"]([^'"]+)['"]/.exec(text)?.[1] ?? '1.0.0';
  const thumbnailPath = /thumbnailPath:\s*['"]([^'"]+)['"]/.exec(text)?.[1] ?? '';
  const componentKeys = [...text.matchAll(/componentKey:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);

  // defaults block
  const defaultsMatch = /defaults:\s*\{([\s\S]*?)\n\s*\}/.exec(text);
  let defaultsName = '', defaultsDescription = '', defaultsCategory = '';
  if (defaultsMatch) {
    const block = defaultsMatch[1];
    defaultsName = /name:\s*['"]([^'"]*)['"]/.exec(block)?.[1] ?? '';
    defaultsDescription = /description:\s*['"]([^'"]*)['"]/.exec(block)?.[1] ?? '';
    defaultsCategory = /category:\s*['"]([^'"]*)['"]/.exec(block)?.[1] ?? '';
  }

  // globalStyles override (only top-level — composition uses 'globalStyles' too, so be careful)
  // Match the preset-level globalStyles block (one indented one line after slug or templateKey).
  const globalStylesOverride: Record<string, string> = {};
  // The preset's globalStyles is at the top level. composition items use 'data' not globalStyles.
  // Match: globalStyles: { ... } at single-indent level
  const gsMatch = /^\s{2}globalStyles:\s*\{([\s\S]*?)\n\s{2}\},?$/m.exec(text);
  if (gsMatch) {
    const block = gsMatch[1];
    const entries = [...block.matchAll(/(\w+):\s*['"]([^'"]+)['"]/g)];
    for (const e of entries) globalStylesOverride[e[1]] = e[2];
  }

  return {
    slug, version, thumbnailPath, componentKeys, globalStylesOverride,
    defaultsName, defaultsDescription, defaultsCategory, rawText: text,
  };
}

interface LibraryEntry {
  componentName: string;
  componentFile: string;        // basename without .tsx
  metaImportName: string | null; // null = use Component.meta
  metaFile: string | null;       // basename without .ts
}

function parseLibraryIndex(filePath: string): Record<string, LibraryEntry> {
  const text = fs.readFileSync(filePath, 'utf-8');
  // Map name → file (basename)
  const defaultImports = [...text.matchAll(/import\s+(\w+)\s+from\s+['"]\.\/(\w+)['"]/g)];
  const namedImports = [...text.matchAll(/import\s+\{\s*(\w+)\s*\}\s+from\s+['"]\.\/(\w+)['"]/g)];
  const fileByName: Record<string, string> = {};
  for (const m of defaultImports) fileByName[m[1]] = m[2];
  for (const m of namedImports) fileByName[m[1]] = m[2];

  // Parse libEntry calls: <key>: libEntry(<Component>) OR <key>: libEntry(<Component>, <metaName>)
  // key may be quoted or bare
  const out: Record<string, LibraryEntry> = {};
  const re = /['"]?([\w-]+)['"]?\s*:\s*libEntry\(\s*(\w+)\s*(?:,\s*(\w+))?\s*\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const key = m[1];
    const compName = m[2];
    const metaName = m[3] ?? null;
    out[key] = {
      componentName: compName,
      componentFile: fileByName[compName] ?? compName,
      metaImportName: metaName,
      metaFile: metaName ? (fileByName[metaName] ?? `${compName}.meta`) : null,
    };
  }
  return out;
}

function adjustImports(text: string): string {
  // From src/themes/<theme>/library/X.tsx, types is at '../../types'.
  // From src/templates/<cat>/<leaf>/library/X.tsx, types is at '../../../types'.
  // Same for renderComposition.
  return text
    .replace(/from\s+['"]\.\.\/\.\.\/types['"]/g, "from '../../../types'")
    .replace(/from\s+['"]\.\.\/\.\.\/renderComposition['"]/g, "from '../../../renderComposition'");
}

function adjustIndexImports(text: string): string {
  // index.tsx uses '../types' and '../renderComposition' — one dir up from theme.
  // New: index.tsx is at src/templates/<cat>/<leaf>/, so '../../types' and '../../renderComposition'.
  return text
    .replace(/from\s+['"]\.\.\/types['"]/g, "from '../../types'")
    .replace(/from\s+['"]\.\.\/renderComposition['"]/g, "from '../../renderComposition'");
}

function generateLibraryIndex(
  templateName: string,
  usedKeys: string[],
  libraryMap: Record<string, LibraryEntry>,
): string {
  const seenImports = new Set<string>();
  const importLines: string[] = [];
  importLines.push(`import { TemplateLibrary, libEntry } from '../../../types';`);
  for (const key of usedKeys) {
    const entry = libraryMap[key];
    if (!entry) continue;
    if (!seenImports.has(entry.componentName)) {
      importLines.push(`import ${entry.componentName} from './${entry.componentFile}';`);
      seenImports.add(entry.componentName);
    }
    if (entry.metaImportName && !seenImports.has(entry.metaImportName)) {
      importLines.push(`import { ${entry.metaImportName} } from './${entry.metaFile}';`);
      seenImports.add(entry.metaImportName);
    }
  }
  const entryLines: string[] = [];
  for (const key of usedKeys) {
    const entry = libraryMap[key];
    if (!entry) continue;
    const args = entry.metaImportName ? `${entry.componentName}, ${entry.metaImportName}` : entry.componentName;
    const keyLiteral = /^[a-zA-Z_$][\w$]*$/.test(key) ? key : `'${key}'`;
    entryLines.push(`  ${keyLiteral}: libEntry(${args}),`);
  }
  return [
    importLines.join('\n'),
    ``,
    `export const ${templateName}Library: TemplateLibrary = {`,
    entryLines.join('\n'),
    `};`,
    ``,
  ].join('\n');
}

function generateTemplateTs(preset: PresetMeta): string {
  // Re-emit the preset, but drop templateKey field (dir gives it) and rename type alias.
  // Approach: take rawText, remove the `templateKey:` line, change variable name.
  let text = preset.rawText;
  // Drop templateKey line
  text = text.replace(/^\s*templateKey:\s*['"][^'"]+['"],?\n/m, '');
  // Update slug if missing prefix — actually leave as-is (slug = `<cat>-<leaf>`)
  // Rename file imports (preset.ts → template.ts is just file rename; imports inside stay same)
  // The import path '../../types' refers to src/themes/types.ts (one above). In new location
  // src/templates/<cat>/<leaf>/template.ts, types is at '../../types'. SAME path. ✓
  // But the original preset is at src/themes/<theme>/presets/foo.preset.ts → '../../types'. Same.
  // Wait — let me count:
  // Original: src/themes/cafe/presets/default.preset.ts → '../../types' = src/themes/types.ts ✓
  // New:     src/templates/cafe/default/template.ts → '../../types' = src/templates/types.ts ✓
  // Same path. Good.
  return text;
}

function generateIndexTsx(
  templateName: string,
  cssFileName: string,
  themeIndexText: string,
  templateKey: string,
): string {
  // Adapt theme's index.tsx for the new location.
  // - Change library import name (cafeLibrary → cafeDefaultLibrary)
  // - Change relative imports (../types → ../../types, ../renderComposition → ../../renderComposition)
  // - Change templateKey string ('cafe' → 'cafe-default')
  // - Change exported function name
  let text = themeIndexText;
  text = adjustIndexImports(text);
  // Rename library import — find pattern 'import { <oldName>Library } from ./library'
  text = text.replace(/import\s+\{\s*(\w+)Library\s*\}\s+from\s+['"]\.\/library['"]/, `import { ${templateName}Library } from './library'`);
  text = text.replace(/=\s*\w+Library;/, `= ${templateName}Library;`);
  // Update templateKey value
  text = text.replace(/templateKey:\s*['"][^'"]+['"]/, `templateKey: '${templateKey}'`);
  // Rename function name (CafeTheme → CafeDefaultTemplate)
  // Function name PascalCase from templateName
  const pascal = templateName.split(/[-_]/).map(s => s[0].toUpperCase() + s.slice(1)).join('');
  text = text.replace(/export\s+default\s+function\s+\w+Theme/, `export default function ${pascal}Template`);
  // CSS import path uses './<file>.module.css' — file name stays since we copy it. OK.
  // Just confirm cssFileName is referenced (no adjustment needed if we keep same name).
  void cssFileName; // unused: we keep same CSS file name
  return text;
}

function generateTokensTs(themeTokensText: string, overrides: Record<string, string>): string {
  // Strategy: take source verbatim, then for each override key, replace just the value on its line.
  // This avoids re-parsing complex values like `'Playfair Display', 'Pretendard', sans-serif`.
  let text = themeTokensText;
  for (const [k, v] of Object.entries(overrides)) {
    // Replace `<k>: <anything>,` with `<k>: '<v>',`
    const re = new RegExp(`(^\\s*${k}:\\s*)[^,\\n]+(,?)\\s*(?://[^\\n]*)?$`, 'm');
    text = text.replace(re, `$1'${v}'$2`);
  }
  return text;
}

function generateThumbnailConfig(themeThumbText: string, templateKey: string): string {
  // Adapt: output path becomes template-<templateKey>.webp
  let text = themeThumbText;
  text = text.replace(/output:\s*['"][^'"]+['"]/, `output: 'public/thumbnails/template-${templateKey}.webp'`);
  return text;
}

function camelLeaf(category: string, leaf: string): string {
  return (category + '-' + leaf).split('-').map((s, i) => i === 0 ? s : s[0].toUpperCase() + s.slice(1)).join('');
}

// MAIN ─────────────────────────────────────────────────────────────────

const themeDirs = fs.readdirSync(SRC_THEMES).filter(d => {
  const full = path.join(SRC_THEMES, d);
  return fs.statSync(full).isDirectory() && fs.existsSync(path.join(full, 'presets'));
});

let templatesCreated = 0;

for (const theme of themeDirs) {
  const themeDir = path.join(SRC_THEMES, theme);
  const presetsDir = path.join(themeDir, 'presets');
  const libraryIndexPath = path.join(themeDir, 'library/index.ts');
  if (!fs.existsSync(libraryIndexPath)) {
    console.warn(`[skip] ${theme}: no library/index.ts`);
    continue;
  }

  const libraryMap = parseLibraryIndex(libraryIndexPath);
  const themeTokensPath = path.join(themeDir, 'tokens.ts');
  const themeTokensText = fs.existsSync(themeTokensPath) ? fs.readFileSync(themeTokensPath, 'utf-8') : '';
  const themeIndexPath = path.join(themeDir, 'index.tsx');
  const themeIndexText = fs.existsSync(themeIndexPath) ? fs.readFileSync(themeIndexPath, 'utf-8') : '';
  const themeThumbPath = path.join(themeDir, 'thumbnail.config.ts');
  const themeThumbText = fs.existsSync(themeThumbPath) ? fs.readFileSync(themeThumbPath, 'utf-8') : '';
  const sectionsDir = path.join(themeDir, 'sections');
  const hasSections = fs.existsSync(sectionsDir);
  const cssFiles = fs.readdirSync(themeDir).filter(f => f.endsWith('.module.css'));

  const presetFiles = fs.readdirSync(presetsDir).filter(f => f.endsWith('.preset.ts'));
  for (const presetFile of presetFiles) {
    const presetPath = path.join(presetsDir, presetFile);
    const preset = parsePresetFile(presetPath);
    const category = theme;
    const leaf = preset.slug.startsWith(category + '-') ? preset.slug.slice(category.length + 1) : preset.slug;
    const templateDir = path.join(SRC_TEMPLATES, category, leaf);
    const usedKeys = [...new Set(preset.componentKeys)];
    const templateName = camelLeaf(category, leaf);

    console.log(`[${preset.slug}] → src/templates/${category}/${leaf}/ (uses ${usedKeys.length} components)`);

    // Create dirs
    fs.mkdirSync(path.join(templateDir, 'library'), { recursive: true });
    if (hasSections) fs.mkdirSync(path.join(templateDir, 'sections'), { recursive: true });

    // 1. Copy used library components (and their meta siblings)
    for (const key of usedKeys) {
      const entry = libraryMap[key];
      if (!entry) {
        console.warn(`    ! no library entry for '${key}'`);
        continue;
      }
      const compTsx = `${entry.componentFile}.tsx`;
      const srcComp = path.join(themeDir, 'library', compTsx);
      if (fs.existsSync(srcComp)) {
        const compText = adjustImports(fs.readFileSync(srcComp, 'utf-8'));
        fs.writeFileSync(path.join(templateDir, 'library', compTsx), compText, 'utf-8');
      }
      if (entry.metaFile) {
        const metaTs = `${entry.metaFile}.ts`;
        const srcMeta = path.join(themeDir, 'library', metaTs);
        if (fs.existsSync(srcMeta)) {
          const metaText = adjustImports(fs.readFileSync(srcMeta, 'utf-8'));
          fs.writeFileSync(path.join(templateDir, 'library', metaTs), metaText, 'utf-8');
        }
      }
    }

    // 2. Copy sections/ (if used by any copied component)
    if (hasSections) {
      const sectionFiles = fs.readdirSync(sectionsDir);
      for (const sf of sectionFiles) {
        const srcSec = path.join(sectionsDir, sf);
        const dstSec = path.join(templateDir, 'sections', sf);
        if (fs.statSync(srcSec).isFile()) {
          const t = fs.readFileSync(srcSec, 'utf-8');
          // sections imports are usually self-contained; no path adjustments needed
          fs.writeFileSync(dstSec, t, 'utf-8');
        }
      }
    }

    // 3. Copy CSS modules
    for (const cssFile of cssFiles) {
      const srcCss = path.join(themeDir, cssFile);
      const dstCss = path.join(templateDir, cssFile);
      fs.copyFileSync(srcCss, dstCss);
    }

    // 4. Generate tokens.ts (with overrides applied)
    fs.writeFileSync(path.join(templateDir, 'tokens.ts'), generateTokensTs(themeTokensText, preset.globalStylesOverride), 'utf-8');

    // 5. Generate library/index.ts
    fs.writeFileSync(path.join(templateDir, 'library/index.ts'), generateLibraryIndex(templateName, usedKeys, libraryMap), 'utf-8');

    // 6. Generate index.tsx
    fs.writeFileSync(path.join(templateDir, 'index.tsx'), generateIndexTsx(templateName, cssFiles[0] ?? '', themeIndexText, preset.slug), 'utf-8');

    // 7. Generate template.ts (renamed preset, templateKey field dropped)
    fs.writeFileSync(path.join(templateDir, 'template.ts'), generateTemplateTs(preset), 'utf-8');

    // 8. Generate thumbnail.config.ts
    fs.writeFileSync(path.join(templateDir, 'thumbnail.config.ts'), generateThumbnailConfig(themeThumbText, preset.slug), 'utf-8');

    templatesCreated++;
  }
}

console.log(`\n✓ Created ${templatesCreated} template directories in src/templates/`);
console.log(`  Next: review generated files, run pnpm tsc, then delete src/themes/.`);
