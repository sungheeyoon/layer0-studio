/**
 * `pnpm template:scaffold <category>/<leaf>` — writes an empty but *working*
 * Template directory: the six files of §3, already in the shapes the gates
 * enforce (schema-first fields, Value-shaped preset, rich design tokens, no
 * `.module.css`). The output is meant to render and pass `template:verify`
 * before a single word of it is edited, so the first thing an author changes
 * is the design — not the wiring.
 *
 * This is the "new concept / new category" entry point. For a variant of an
 * existing Template, cloning that directory is still the faster path (see
 * `docs/TEMPLATE_SYSTEM.md` §9-A).
 */
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TEMPLATES_DIR = join(ROOT, 'src', 'templates');

/** Same rule the category gate applies (`scripts/lib/category-gate.ts`). */
const SLUG_RE = /^[a-z][a-z0-9-]{0,39}$/;

function usage(message?: string): never {
  if (message) console.error(`✖ ${message}\n`);
  console.error('Usage: pnpm template:scaffold <category>/<leaf>');
  console.error('   or: pnpm template:scaffold <category> <leaf>');
  console.error('');
  console.error('  <category>  lowercase directory name — the catalog shows it Capitalized');
  console.error('  <leaf>      the design within that category (`default` for the first one)');
  console.error('');
  console.error('  e.g. pnpm template:scaffold bakery/default   → templateKey "bakery-default"');
  process.exit(1);
}

const args = process.argv.slice(2).filter((a) => !a.startsWith('-'));
if (args.length === 0) usage();

const [category, leaf] =
  args[0].includes('/') ? args[0].split('/') : [args[0], args[1]];

if (!category || !leaf) usage('both a category and a leaf are required');
if (!SLUG_RE.test(category)) usage(`category "${category}" must match ${SLUG_RE}`);
if (!SLUG_RE.test(leaf)) usage(`leaf "${leaf}" must match ${SLUG_RE}`);

const templateKey = `${category}-${leaf}`;
const templateDir = join(TEMPLATES_DIR, category, leaf);

if (existsSync(templateDir)) {
  console.error(`✖ ${templateDir} already exists — scaffolding would overwrite an existing Template.`);
  process.exit(1);
}

const isNewCategory = !existsSync(join(TEMPLATES_DIR, category));

/** `bakery-default` → `BakeryDefaultTemplate` */
const pascal = templateKey
  .split('-')
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join('');
/** `bakery-default` → `bakeryDefaultLibrary` */
const camel = pascal.charAt(0).toLowerCase() + pascal.slice(1);

// ─────────────────────────────────────────────────────────────────────────────
// File bodies
// ─────────────────────────────────────────────────────────────────────────────

const tokensTs = `import { GlobalStyles } from '@/domain/entities/template.entity';
import type { DesignTokens } from '@/templates/types';

/**
 * Thin layer — **the user's copy.** Deep-copied into a Site's \`content\` at
 * creation, so editing a value here never reaches a Site that already exists.
 *
 * Overlays specific \`designTokens\` entries (src/lib/template/design-tokens.ts):
 *   primaryColor → --color-primary   secondaryColor → --color-secondary
 *   backgroundColor → --color-surface   fontFamily → --font-base   fontSize → --font-size
 */
export const defaultGlobalStyles: GlobalStyles = {
  primaryColor: '#1F6F5C',
  secondaryColor: '#14231F',
  backgroundColor: '#F6F4EF',
  fontFamily: "'Pretendard Variable', 'Pretendard', 'Apple SD Gothic Neo', sans-serif",
  fontSize: '16px',
  layout: 'wide',
};

/**
 * Rich layer — this Template's visual identity, **code-owned.** Not copied per
 * Site: the renderer imports this module at serve time, so changing a value
 * here restyles *every* existing Site on this Template. That is the intended
 * channel for a fleet-wide repair (bad contrast, dead font) — for a redesign,
 * fork to a new leaf directory instead. See ADR-0005.
 *
 * Each entry becomes \`--{dimension-singular}-{key}\`: \`colors.primary\` →
 * \`var(--color-primary)\`. Components reference these and never a literal.
 */
export const designTokens: DesignTokens = {
  colors: {
    primary: '#1F6F5C',        // themable via globalStyles.primaryColor
    secondary: '#14231F',      // themable via globalStyles.secondaryColor
    surface: '#F6F4EF',        // themable via globalStyles.backgroundColor

    // Tonal siblings of \`surface\`. Derived, not fixed — the user picks the
    // background and these have to keep their relationship to it, or the
    // surfaces invert. Light template → mix toward black; dark → toward #fff.
    'surface-soft': 'color-mix(in srgb, var(--color-surface) 97%, #000)',
    'surface-dark': 'color-mix(in srgb, var(--color-surface) 92%, #000)',

    // Text tones: code-owned, tuned to this template's default background.
    // Deliberately NOT derived — see the BACKGROUND_POLARITY_FLIPPED warning.
    ink: '#14231F',
    muted: '#4C5B56',
    dust: '#8A968F',
  },
  fonts: {
    base: "'Pretendard Variable', 'Pretendard', 'Apple SD Gothic Neo', sans-serif", // themable
    display: "'Pretendard Variable', 'Pretendard', sans-serif",
  },
  radius: {
    sm: '4px',
    md: '10px',
    lg: '20px',
  },
};
`;

const heroTsx = `import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';
import { TemplateSectionProps, SectionComponent } from '../../../types';

/**
 * Schema-first (ADR-0016 §4): the schema is the single source of truth and the
 * Content type is *derived* from it — there is no hand-written interface that
 * can drift. \`as const\` is load-bearing: it preserves \`required: true\` and any
 * \`options\` literals so \`ValuesOf\` can read them.
 */
const heroSchema = {
  eyebrow: { type: 'text', label: '상단 라벨' },
  title: { type: 'textarea', label: '메인 타이틀', required: true },
  description: { type: 'textarea', label: '설명' },
  image: { type: 'image', label: '배경 이미지' },
  ctaText: { type: 'text', label: 'CTA 텍스트' },
} as const satisfies FieldsSchema;

type HeroContent = ValuesOf<typeof heroSchema>;

const Hero: SectionComponent = function Hero({ section }: TemplateSectionProps) {
  // The one place loose domain data becomes a typed Value (ADR-0016 §4-2).
  // No re-validation: the save path already ran the library-aware validator.
  const content = section.fields as HeroContent;

  // Every optional Value needs a fallback — \`getFieldValue\`'s \`?? ''\` safety
  // net is gone, and an older Site may simply not carry the key (ADR-0016 §6).
  const eyebrow = content.eyebrow ?? '';
  const description = content.description ?? '';
  const imageUrl = content.image?.url;
  const ctaText = content.ctaText ?? '';

  return (
    <section
      // Only the first section (the hero) fills the viewport — see §2.7.
      className="relative min-h-[100dvh] flex items-center px-6 lg:px-10 bg-[var(--color-surface)]"
      id="hero"
    >
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
      )}
      <div className="relative max-w-7xl mx-auto w-full py-24">
        {eyebrow && (
          <p className="text-[13px] tracking-[0.2em] uppercase text-[var(--color-primary)] mb-6">
            {eyebrow}
          </p>
        )}
        <h1
          className="text-[var(--color-secondary)] leading-[1.1] max-w-3xl"
          style={{ fontSize: 'clamp(2.6rem, 6vw, 5rem)', fontFamily: 'var(--font-display)' }}
        >
          {content.title}
        </h1>
        {description && (
          <p className="mt-8 max-w-xl text-[var(--color-muted)] leading-relaxed whitespace-pre-line">
            {description}
          </p>
        )}
        {ctaText && (
          <span className="inline-block mt-10 px-7 py-3 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-[var(--color-surface)] text-[15px]">
            {ctaText}
          </span>
        )}
      </div>
    </section>
  );
};

Hero.meta = {
  componentKey: 'hero',   // permanent — renaming it blanks the section on every live Site
  category: 'hero',
  label: 'Hero',
  fieldsSchema: heroSchema,
};

export default Hero;
`;

const featuresTsx = `import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';
import { TemplateSectionProps, SectionComponent } from '../../../types';

const featuresSchema = {
  title: { type: 'text', label: '섹션 타이틀' },
  items: {
    type: 'array',
    label: '항목',
    minItems: 1,
    maxItems: 6,
    itemSchema: {
      title: { type: 'text', label: '제목', required: true },
      description: { type: 'textarea', label: '설명' },
    },
  },
} as const satisfies FieldsSchema;

type FeaturesContent = ValuesOf<typeof featuresSchema>;

const Features: SectionComponent = function Features({ section }: TemplateSectionProps) {
  const content = section.fields as FeaturesContent;

  // An \`array\` Value can be absent on a Site created before the field existed.
  const items = content.items ?? [];

  return (
    <section className="py-24 lg:py-32 px-6 lg:px-10 bg-[var(--color-surface-soft)]" id="features">
      <div className="max-w-7xl mx-auto">
        {content.title && (
          <h2
            className="text-[var(--color-secondary)] mb-14"
            style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontFamily: 'var(--font-display)' }}
          >
            {content.title}
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item) => (
            // The item's own permanent id, never the array index — an index
            // points at a different item after a reorder (ADR-0016 §4-4).
            <article
              key={item.id}
              className="p-8 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-surface-dark)]"
            >
              <h3 className="text-[var(--color-ink)] text-[18px] mb-3">{item.fields.title}</h3>
              <p className="text-[var(--color-muted)] text-[15px] leading-relaxed whitespace-pre-line">
                {item.fields.description ?? ''}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

Features.meta = {
  componentKey: 'features',
  category: 'features',
  label: 'Features',
  fieldsSchema: featuresSchema,
};

export default Features;
`;

const footerTsx = `import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';
import { TemplateSectionProps, SectionComponent } from '../../../types';

const footerSchema = {
  brandName: { type: 'text', label: '브랜드 이름', required: true },
  address: { type: 'textarea', label: '주소' },
  copyright: { type: 'text', label: '카피라이트' },
} as const satisfies FieldsSchema;

type FooterContent = ValuesOf<typeof footerSchema>;

const Footer: SectionComponent = function Footer({ section }: TemplateSectionProps) {
  const content = section.fields as FooterContent;

  return (
    <footer className="py-20 px-6 lg:px-10 bg-[var(--color-secondary)] text-[var(--color-surface)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <p className="text-[22px]" style={{ fontFamily: 'var(--font-display)' }}>
            {content.brandName}
          </p>
          <p className="mt-4 text-[14px] opacity-70 whitespace-pre-line">
            {content.address ?? ''}
          </p>
        </div>
        <p className="text-[13px] opacity-50">{content.copyright ?? ''}</p>
      </div>
    </footer>
  );
};

Footer.meta = {
  componentKey: 'footer',
  category: 'footer',
  label: 'Footer',
  fieldsSchema: footerSchema,
};

export default Footer;
`;

const libraryIndexTs = `import { TemplateLibrary, libEntry } from '../../../types';
import Hero from './Hero';
import Features from './Features';
import Footer from './Footer';

/**
 * componentKey → { Component, meta }. These keys are permanent: a live Site
 * stores \`section.type\` as a string, so renaming one blanks that section.
 *
 * Server components carry \`Component.meta\` and need only \`libEntry(C)\`. A
 * \`'use client'\` component's module body never runs on the server, so its meta
 * must live in a sibling \`<Name>.meta.ts\` and be passed: \`libEntry(C, cMeta)\`.
 */
export const ${camel}Library: TemplateLibrary = {
  hero: libEntry(Hero),
  features: libEntry(Features),
  footer: libEntry(Footer),
};
`;

const indexTsx = `import React from 'react';
import { TemplateRendererProps, TemplateLibrary } from '../../types';
import { ${camel}Library } from './library';
import { RenderSingleSite } from '../../renderSingleSite';
import { defaultGlobalStyles, designTokens } from './tokens';
import { ContentModel } from '@/domain/entities/template.entity';

export const library: TemplateLibrary = ${camel}Library;

export const defaultContent: ContentModel = {
  mode: 'single',
  templateKey: '${templateKey}',
  globalStyles: defaultGlobalStyles,
  sections: [], // Empty skeleton; the preset provides the sections
};

export default function ${pascal}Template(props: TemplateRendererProps) {
  return (
    <RenderSingleSite
      {...props}
      library={library}
      // \`designTokens\` becomes inline CSS vars on the root element, so every
      // \`var(--color-*)\` below resolves — with the user's globalStyles on top.
      // Declaring the same vars in a .module.css would be dead code (inline wins).
      designTokens={designTokens}
      itemClassName={(id) =>
        props.selectedSectionId === id ? 'outline outline-2 outline-[var(--color-primary)]' : ''
      }
    />
  );
}
`;

const templateTs = `import { TemplatePreset } from '../../types';
import { defaultGlobalStyles } from './tokens';

/**
 * The Preset — code is source of truth (ADR-0002); sync writes this verbatim
 * into \`templates.content\`. Each \`fields\` object holds **Values**, not
 * \`{ type, label, value }\` wrappers: the component's \`fieldsSchema\` is what
 * says a key is text or an image (ADR-0016 §4).
 */
const preset: TemplatePreset = {
  slug: '${templateKey}',
  content: {
    mode: 'single',
    templateKey: '${templateKey}',
    globalStyles: defaultGlobalStyles,
    sections: [
      {
        id: 'hero-001',
        type: 'hero',
        visible: true,
        nav: { visible: true, label: '홈' },
        fields: {
          eyebrow: 'TODO — 상단 라벨',
          title: 'TODO — 메인 타이틀',
          description: 'TODO — 한두 문장으로 이 사이트가 무엇인지.',
          // An image Value is an object: { url, assetId? }. Fill \`url\` with
          // \`pnpm template:image ${templateKey} "<query>" wide\`.
          image: { url: 'https://picsum.photos/seed/${templateKey}-hero/1600/900' },
          ctaText: 'TODO — CTA',
        },
      },
      {
        id: 'features-001',
        type: 'features',
        visible: true,
        nav: { visible: true, label: '소개' },
        fields: {
          title: 'TODO — 섹션 타이틀',
          // Every array item carries its own permanent \`id\` beside \`fields\`.
          // Ids only need to be unique within this array (ADR-0016 §4-4).
          items: [
            { id: 'feature-1', fields: { title: 'TODO 1', description: 'TODO' } },
            { id: 'feature-2', fields: { title: 'TODO 2', description: 'TODO' } },
            { id: 'feature-3', fields: { title: 'TODO 3', description: 'TODO' } },
          ],
        },
      },
      {
        id: 'footer-001',
        type: 'footer',
        visible: true,
        nav: { visible: false, label: '푸터' },
        fields: {
          brandName: 'TODO — 브랜드',
          address: 'TODO — 주소',
          copyright: '© ${new Date().getFullYear()} TODO. All rights reserved.',
        },
      },
    ],
  },
  thumbnailPath: 'public/thumbnails/template-${templateKey}.webp',
  version: '1.0.0',
  defaults: {
    name: 'TODO — 카탈로그 표시명',
    description: 'TODO — 한 문장 소개.',
    category: '${category}',
  },
};

export default preset;
`;

const thumbnailConfigTs = `/**
 * The canonical desktop viewport (1600×900) is the screen this Template is
 * designed against — the capture *is* the design check. Leave it alone unless
 * there is a reason. See docs/TEMPLATE_SYSTEM.md §2.7.
 */
const config = {
  source: 'preview://${templateKey}',
  viewport: { width: 1600, height: 900 },
  capture: 'hero',
  output: 'public/thumbnails/template-${templateKey}.webp',
  resize: { width: 800, height: 450 },
  waitFor: { fonts: true, networkIdle: true, minDelay: 500 },
};

export default config;
`;

// ─────────────────────────────────────────────────────────────────────────────
// Write
// ─────────────────────────────────────────────────────────────────────────────

const files: Array<[string, string]> = [
  ['tokens.ts', tokensTs],
  ['index.tsx', indexTsx],
  ['template.ts', templateTs],
  ['thumbnail.config.ts', thumbnailConfigTs],
  [join('library', 'index.ts'), libraryIndexTs],
  [join('library', 'Hero.tsx'), heroTsx],
  [join('library', 'Features.tsx'), featuresTsx],
  [join('library', 'Footer.tsx'), footerTsx],
];

mkdirSync(join(templateDir, 'library'), { recursive: true });
for (const [relative, body] of files) {
  writeFileSync(join(templateDir, relative), body);
  console.log(`  ✅ src/templates/${category}/${leaf}/${relative.replace(/\\/g, '/')}`);
}

console.log(`\n✨ Scaffolded "${templateKey}" (Single).`);

if (isNewCategory) {
  console.log(
    `\n⚠️  "${category}" is a new Category. Add a lowercase label key to BOTH\n` +
    `   src/lib/i18n/messages/ko.ts and en.ts under templatesCatalog.categoryLabels\n` +
    `   (\`${category}: '…'\`) — without it the catalog shows the raw slug. A new\n` +
    `   top-level Category is a structural change: get explicit sign-off first.`,
  );
}

console.log(`
Next:
  1. Edit tokens.ts (palette/fonts) and the three library components.
     Replace every TODO in template.ts.
  2. pnpm template:image ${templateKey} "<query>" wide     # real hero image → paste the URL
  3. pnpm generate:templates                                # register it
  4. pnpm template:verify ${templateKey}                    # tsc · eslint · validate · schema↔jsx · capture
  5. open /preview/preset/${templateKey}                    # look at it

  For a Multi (routable pages) Template instead, clone src/templates/outdoor/default —
  its preset is the \`{ mode:'multi', shared:{header,footer}, pages:[…] }\` union.
`);
