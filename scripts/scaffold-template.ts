import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const args = process.argv.slice(2);
const key = args[0];
const fromIdx = args.indexOf('--from');
const htmlPath = fromIdx !== -1 ? args[fromIdx + 1] : null;

if (!key) {
  console.error('Usage: pnpm template:scaffold <key> --from <html-path>');
  process.exit(1);
}

const themeDir = join(ROOT, 'src', 'themes', key);
const presetsDir = join(themeDir, 'presets');

function ensureDir(path: string) {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
    console.log(`📁 Created directory: ${path}`);
  }
}

function extractMeta(html: string) {
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const descMatch = html.match(/<meta name="description" content="(.*?)"/i);
  return {
    title: titleMatch ? titleMatch[1] : key.charAt(0).toUpperCase() + key.slice(1),
    description: descMatch ? descMatch[1] : `${key} theme description.`
  };
}

async function run() {
  console.log(`🏗️  Scaffolding template for [${key}]...`);
  
  ensureDir(themeDir);
  ensureDir(presetsDir);
  ensureDir(join(themeDir, 'sections'));
  ensureDir(join(themeDir, 'library'));

  let meta = { title: key, description: '' };
  if (htmlPath && existsSync(join(ROOT, htmlPath))) {
    const html = readFileSync(join(ROOT, htmlPath), 'utf-8');
    meta = extractMeta(html);
    console.log(`📄 Extracted meta from ${htmlPath}`);
  }

  // 1. tokens.ts
  const tokensPath = join(themeDir, 'tokens.ts');
  if (!existsSync(tokensPath)) {
    const content = `import { TemplateGlobalStyles } from '@/domain/entities/template.entity';

export const defaultGlobalStyles: TemplateGlobalStyles = {
  primaryColor: '#000000',
  secondaryColor: '#ffffff',
  fontFamily: 'sans-serif',
  fontSize: '16px',
  layout: 'wide',
};
`;
    writeFileSync(tokensPath, content);
    console.log(`✅ Created tokens.ts`);
  }

  // 2. library/index.ts
  const libraryIndexPath = join(themeDir, 'library', 'index.ts');
  if (!existsSync(libraryIndexPath)) {
    const content = `import { ThemeLibrary } from '../../types';

export const ${key}Library: ThemeLibrary = {
  // Add components here
};
`;
    writeFileSync(libraryIndexPath, content);
    console.log(`✅ Created library/index.ts`);
  }

  // 3. index.tsx
  const indexPath = join(themeDir, 'index.tsx');
  if (!existsSync(indexPath)) {
    const content = `import React from 'react';
import { ThemeRendererProps, ThemeLibrary } from '../types';
import styles from './${key}.module.css';
import { ${key}Library } from './library';
import { RenderComposition } from '../renderComposition';
import { defaultGlobalStyles } from './tokens';
import { TemplateJson } from '@/domain/entities/template.entity';

export const library: ThemeLibrary = ${key}Library;

export const defaultTemplateJson: TemplateJson = {
  themeKey: '${key}',
  globalStyles: defaultGlobalStyles,
  pages: [
    {
      id: 'home',
      title: 'Home',
      slug: '/',
      order: 0,
      sections: [], // Filled by presets/composition
    },
  ],
};

export default function ${key.charAt(0).toUpperCase() + key.slice(1)}Theme(props: ThemeRendererProps) {
  return (
    <RenderComposition
      {...props}
      library={library}
      className={styles.themeRoot}
      itemClassName={(id) => props.selectedSectionId === id ? styles.selectedSlot : ''}
    />
  );
}
`;
    writeFileSync(indexPath, content);
    console.log(`✅ Created index.tsx`);
  }

  // 4. default.preset.ts
  const presetPath = join(presetsDir, 'default.preset.ts');
  if (!existsSync(presetPath)) {
    const content = `import { TemplatePreset } from '../../types';

const preset: TemplatePreset = {
  slug: '${key}-default',
  themeKey: '${key}',
  composition: [
    {
      id: 'hero-001',
      componentKey: 'hero',
      data: {
        title: { value: '${meta.title}', type: 'text', label: '타이틀', editable: true },
      },
    },
    {
      id: 'footer-001',
      componentKey: 'footer',
      data: {
        text: { value: '© 2026 ${meta.title}', type: 'text', label: '카피라이트', editable: true },
      },
    },
  ],
  thumbnailPath: 'public/thumbnails/template-${key}.webp',
  version: '1.0.0',
  defaults: {
    name: '${meta.title}',
    description: '${meta.description.replace(/'/g, "\\'")}',
    category: 'other',
  },
};

export default preset;
`;
    writeFileSync(presetPath, content);
    console.log(`✅ Created presets/default.preset.ts`);
  }

  // 5. thumbnail.config.ts
  const thumbPath = join(themeDir, 'thumbnail.config.ts');
  if (!existsSync(thumbPath)) {
    const content = `export default {
  source: '${htmlPath || `preview://${key}-default`}',
  viewport: { width: 1280, height: 720 },
  capture: 'hero',
  output: 'public/thumbnails/template-${key}.webp',
  resize: { width: 640, height: 360 },
  waitFor: { fonts: true, networkIdle: true, minDelay: 1000 },
};
`;
    writeFileSync(thumbPath, content);
    console.log(`✅ Created thumbnail.config.ts`);
  }

  console.log(`\n✨ Scaffolding complete!`);
  console.log(`Next steps:`);
  console.log(`1. Run 'pnpm generate:themes' to register the new theme.`);
  console.log(`2. Run 'pnpm template:capture ${key}' to generate a thumbnail.`);
  console.log(`3. Run 'pnpm template:sync' to preview DB changes.`);
}

run();
