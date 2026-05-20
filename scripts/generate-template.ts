#!/usr/bin/env tsx
/**
 * Tracer #1 — AI template generation pipeline skeleton.
 *
 *   pnpm template:generate "<brief>"             # interactive
 *   pnpm template:generate "<brief>" --auto-approve   # CI / smoke
 *
 * 4-step tool flow (all stubbed — issues #11-#16 replace each with a real
 * LLM call, the orchestrator stays unchanged):
 *
 *   propose_composition    → which category/leaf and which sections
 *   propose_design_tokens  → DesignTokens object for the template
 *   generate_section       → one .tsx file per section (×N)
 *   validate_and_capture   → lint/tsc gate + thumbnail (stub: skipped)
 *
 * After approval, six files are written under
 * `src/templates/<category>/<leaf>/` and `pnpm generate:templates` regenerates
 * the registry. The new template is then importable, previewable at
 * `/preview/preset/<templateKey>`, and visible to `template:sync --dry-run`.
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createInterface } from 'readline/promises';

// ─── Tool result types ───────────────────────────────────────────────────────
// Stable across stub/real impls. #11-#16 keep these signatures; only the
// implementation bodies swap to LLM calls.

interface ProposeCompositionResult {
  category: string;                                // e.g. 'cafe'
  leaf: string;                                    // e.g. 'stub-template'
  composition: Array<{
    id: string;
    componentKey: string;
    label: string;                                 // for UX in approval prompt
  }>;
  rationale: string;                               // why this composition (logged only)
}

interface ProposeDesignTokensResult {
  defaultGlobalStyles: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    fontSize: string;
    layout: 'wide' | 'narrow' | 'default';
  };
  designTokens: {
    colors: Record<string, string>;
    fonts: Record<string, string>;
  };
}

interface GenerateSectionResult {
  componentKey: string;
  componentName: string;                           // exported identifier (e.g. 'Hero')
  tsxSource: string;
  dataSchema: Record<string, { type: string; label: string; required?: boolean }>;
  defaultData: Record<string, { value: string; type: string; label: string }>;
}

interface ValidateAndCaptureResult {
  ok: boolean;
  errors: string[];
  thumbnailPath: string | null;                    // stub: null (real: capture path)
}

// ─── 4 stub tool implementations ─────────────────────────────────────────────

function stub_propose_composition(brief: string): ProposeCompositionResult {
  return {
    category: 'cafe',
    leaf: 'stub-template',
    composition: [
      { id: 'hero-1', componentKey: 'hero', label: 'Hero' },
    ],
    rationale: `[stub] hardcoded cafe/stub-template with single Hero section. Brief: "${brief}"`,
  };
}

function stub_propose_design_tokens(_brief: string, _comp: ProposeCompositionResult): ProposeDesignTokensResult {
  return {
    defaultGlobalStyles: {
      primaryColor:   '#C96A3A',
      secondaryColor: '#231509',
      fontFamily:     "'Pretendard', sans-serif",
      fontSize:       '16px',
      layout:         'wide',
    },
    designTokens: {
      colors: {
        primary:   '#C96A3A',
        secondary: '#231509',
        surface:   '#F5F0E8',
        cream:     '#F0E9DC',
      },
      fonts: {
        base:  "'Pretendard', sans-serif",
        serif: "'Playfair Display', Georgia, serif",
      },
    },
  };
}

function stub_generate_section(
  _brief: string,
  componentKey: string,
  _tokens: ProposeDesignTokensResult,
): GenerateSectionResult {
  const componentName = componentKey.charAt(0).toUpperCase() + componentKey.slice(1);
  const tsxSource = `import { TemplateSectionProps, SectionComponent } from '../../../types';
import { getFieldValue } from '@/domain/entities/template.entity';

const ${componentName}: SectionComponent = function ${componentName}({ section }: TemplateSectionProps) {
  const { data } = section;
  const title = getFieldValue(data, 'title') || 'Welcome';
  const subtitle = getFieldValue(data, 'subtitle') || '';

  return (
    <section
      style={{
        padding: '6rem 1rem',
        textAlign: 'center',
        background: 'var(--color-surface)',
        color: 'var(--color-secondary)',
        fontFamily: 'var(--font-base)',
      }}
    >
      <h1
        style={{
          fontSize: '3rem',
          color: 'var(--color-primary)',
          fontFamily: 'var(--font-serif)',
          margin: 0,
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p style={{ marginTop: '1rem', opacity: 0.75 }}>{subtitle}</p>
      )}
    </section>
  );
};

${componentName}.meta = {
  componentKey: '${componentKey}',
  category: '${componentKey}',
  label: '${componentName}',
  dataSchema: {
    title:    { type: 'text', label: '제목', required: true },
    subtitle: { type: 'text', label: '서브타이틀' },
  },
};

export default ${componentName};
`;
  return {
    componentKey,
    componentName,
    tsxSource,
    dataSchema: {
      title:    { type: 'text', label: '제목', required: true },
      subtitle: { type: 'text', label: '서브타이틀' },
    },
    defaultData: {
      title:    { value: 'Welcome',                  type: 'text', label: '제목' },
      subtitle: { value: '[stub] generated section', type: 'text', label: '서브타이틀' },
    },
  };
}

function stub_validate_and_capture(_templateDir: string): ValidateAndCaptureResult {
  return { ok: true, errors: [], thumbnailPath: null };
}

// ─── File writers ────────────────────────────────────────────────────────────

interface PlannedTemplate {
  templateRoot: string;                            // absolute path to template dir
  category: string;
  leaf: string;
  templateKey: string;                             // `${category}-${leaf}`
  comp: ProposeCompositionResult;
  tokens: ProposeDesignTokensResult;
  sections: GenerateSectionResult[];
}

function renderTokensFile(t: PlannedTemplate): string {
  const colors = JSON.stringify(t.tokens.designTokens.colors, null, 2).replace(/\n/g, '\n  ');
  const fonts  = JSON.stringify(t.tokens.designTokens.fonts,  null, 2).replace(/\n/g, '\n  ');
  return `import { TemplateGlobalStyles } from '@/domain/entities/template.entity';
import type { DesignTokens } from '@/templates/types';

// Generated by \`pnpm template:generate\` (Tracer #1 stub).
// Edit freely — this is now first-class code.

export const defaultGlobalStyles: TemplateGlobalStyles = ${JSON.stringify(t.tokens.defaultGlobalStyles, null, 2)};

export const designTokens: DesignTokens = {
  colors: ${colors},
  fonts: ${fonts},
};
`;
}

function renderLibraryIndex(t: PlannedTemplate): string {
  const imports = t.sections
    .map(s => `import ${s.componentName} from './${s.componentName}';`)
    .join('\n');
  const entries = t.sections
    .map(s => `  ${s.componentKey}: libEntry(${s.componentName}),`)
    .join('\n');
  return `import { TemplateLibrary, libEntry } from '../../../types';
${imports}

export const ${camelLeaf(t.category, t.leaf)}Library: TemplateLibrary = {
${entries}
};
`;
}

function renderTemplateSeed(t: PlannedTemplate): string {
  const compEntries = t.comp.composition.map((c, idx) => {
    const data = t.sections[idx]?.defaultData ?? {};
    return `    {
      id: '${c.id}',
      componentKey: '${c.componentKey}',
      data: ${JSON.stringify(data, null, 6).replace(/\n/g, '\n      ')},
    }`;
  }).join(',\n');
  return `import { TemplatePreset } from '../../types';

const preset: TemplatePreset = {
  slug: '${t.templateKey}',
  composition: [
${compEntries}
  ],
  globalStyles: {
    primaryColor: '${t.tokens.defaultGlobalStyles.primaryColor}',
    secondaryColor: '${t.tokens.defaultGlobalStyles.secondaryColor}',
  },
  thumbnailPath: 'public/thumbnails/template-${t.templateKey}.webp',
  version: '0.1.0',
  defaults: {
    name: '${t.leaf}',
    description: '[stub] generated by template:generate',
    category: '${t.category}',
  },
};

export default preset;
`;
}

function renderThumbnailConfig(t: PlannedTemplate): string {
  // The capture pipeline (`scripts/capture-templates.ts`) recognizes
  // `preview://<templateKey>` as a marker — it strips the scheme and hits
  // `http://localhost:3000/preview/preset/<templateKey>`.
  return `const config = {
  source: 'preview://${t.templateKey}',
  viewport: { width: 1600, height: 1000 },
  capture: 'fullpage',
  output: 'public/thumbnails/template-${t.templateKey}.webp',
  resize: { width: 800, height: 500 },
  waitFor: { fonts: true, networkIdle: true, minDelay: 500 },
};

export default config;
`;
}

function renderIndex(t: PlannedTemplate): string {
  const libVar = `${camelLeaf(t.category, t.leaf)}Library`;
  return `import React from 'react';
import { TemplateRendererProps, TemplateLibrary } from '../../types';
import { ${libVar} } from './library';
import { RenderComposition } from '../../renderComposition';
import { defaultGlobalStyles, designTokens } from './tokens';
import { TemplateJson } from '@/domain/entities/template.entity';

export const library: TemplateLibrary = ${libVar};

export const defaultTemplateJson: TemplateJson = {
  templateKey: '${t.templateKey}',
  globalStyles: defaultGlobalStyles,
  pages: [
    {
      id: 'home',
      title: 'Home',
      slug: '/',
      order: 0,
      sections: [],
    },
  ],
};

export default function ${pascal(t.category)}${pascal(t.leaf)}Template(props: TemplateRendererProps) {
  return (
    <RenderComposition
      {...props}
      library={library}
      designTokens={designTokens}
    />
  );
}
`;
}

function camelLeaf(category: string, leaf: string): string {
  const join = `${category}-${leaf}`;
  return join.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}
function pascal(s: string): string {
  return s.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
}

function writeTemplateFiles(t: PlannedTemplate): string[] {
  const written: string[] = [];
  if (!existsSync(t.templateRoot)) mkdirSync(t.templateRoot, { recursive: true });
  const libDir = join(t.templateRoot, 'library');
  if (!existsSync(libDir)) mkdirSync(libDir);

  const fileWrites: Array<[string, string]> = [
    [join(t.templateRoot, 'tokens.ts'),           renderTokensFile(t)],
    [join(t.templateRoot, 'template.ts'),         renderTemplateSeed(t)],
    [join(t.templateRoot, 'thumbnail.config.ts'), renderThumbnailConfig(t)],
    [join(t.templateRoot, 'index.tsx'),           renderIndex(t)],
    [join(libDir, 'index.ts'),                    renderLibraryIndex(t)],
    ...t.sections.map(s => [join(libDir, `${s.componentName}.tsx`), s.tsxSource] as [string, string]),
  ];

  for (const [path, content] of fileWrites) {
    writeFileSync(path, content, 'utf-8');
    written.push(path);
  }
  return written;
}

// ─── Approval prompt ─────────────────────────────────────────────────────────

async function approve(label: string, payload: unknown, autoApprove: boolean): Promise<boolean> {
  console.log(`\n──── ${label} ────`);
  console.log(JSON.stringify(payload, null, 2));
  if (autoApprove) {
    console.log('  → auto-approved');
    return true;
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = (await rl.question('Approve this step? [y/N] ')).trim().toLowerCase();
  rl.close();
  return answer === 'y' || answer === 'yes';
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

async function run() {
  const args = process.argv.slice(2);
  const autoApprove = args.includes('--auto-approve');
  const showHelp    = args.includes('--help') || args.includes('-h');
  const brief = args.find(a => !a.startsWith('--'));

  if (showHelp || !brief) {
    console.log(`Usage: pnpm template:generate "<brief>" [--auto-approve]

Tracer #1 — AI template generation pipeline (stubbed).

Flow:
  1. propose_composition    decides category/leaf and section list
  2. propose_design_tokens  decides DesignTokens (colors/fonts)
  3. generate_section       generates one TSX file per section
  4. validate_and_capture   gate (stub: skipped)

Each step shows the proposal and asks for approval (unless --auto-approve).
On approval, files are written to src/templates/<category>/<leaf>/ and
'pnpm generate:templates' is run to register the new template.

Stub note: outputs are hardcoded. Issues #11-#16 swap each tool to a real
LLM call without changing this orchestrator.
`);
    process.exit(brief ? 0 : 1);
  }

  console.log(`🤖 template:generate (Tracer #1, stub) — brief: "${brief}"`);

  // Step 1
  const comp = stub_propose_composition(brief);
  if (!(await approve('propose_composition', comp, autoApprove))) {
    console.log('Aborted at propose_composition.'); process.exit(1);
  }

  const templateKey = `${comp.category}-${comp.leaf}`;
  const templateRoot = join(process.cwd(), 'src', 'templates', comp.category, comp.leaf);
  if (existsSync(templateRoot)) {
    console.error(`❌ Template dir already exists: ${templateRoot}`);
    console.error('   Delete it first or generate with a different leaf name.');
    process.exit(1);
  }

  // Step 2
  const tokens = stub_propose_design_tokens(brief, comp);
  if (!(await approve('propose_design_tokens', tokens, autoApprove))) {
    console.log('Aborted at propose_design_tokens.'); process.exit(1);
  }

  // Step 3 (one call per section)
  const sections: GenerateSectionResult[] = [];
  for (const s of comp.composition) {
    const section = stub_generate_section(brief, s.componentKey, tokens);
    if (!(await approve(`generate_section[${s.componentKey}]`,
        { componentKey: section.componentKey, sourceLines: section.tsxSource.split('\n').length }, autoApprove))) {
      console.log(`Aborted at generate_section[${s.componentKey}].`); process.exit(1);
    }
    sections.push(section);
  }

  // Write files
  const planned: PlannedTemplate = { templateRoot, category: comp.category, leaf: comp.leaf, templateKey, comp, tokens, sections };
  const written = writeTemplateFiles(planned);
  console.log(`\n✏️  Wrote ${written.length} files:`);
  for (const p of written) console.log(`   ${p}`);

  // Regenerate registry so the new template is importable
  console.log('\n🔁 Regenerating template registry…');
  execSync('pnpm generate:templates', { stdio: 'inherit' });

  // Step 4 (stub no-op)
  const validation = stub_validate_and_capture(templateRoot);
  if (!(await approve('validate_and_capture', validation, autoApprove))) {
    console.log('Aborted at validate_and_capture.'); process.exit(1);
  }

  console.log(`\n✅ Generated template "${templateKey}". Next steps:`);
  console.log(`   pnpm tsc --noEmit                                # type-check`);
  console.log(`   pnpm dev → /preview/preset/${templateKey}       # visual preview`);
  console.log(`   pnpm template:sync                               # see it as a 'CREATE' candidate`);
}

run().catch(err => { console.error(err); process.exit(1); });
