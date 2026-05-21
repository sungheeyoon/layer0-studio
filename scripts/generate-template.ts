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
import { z } from 'zod';
import { claudeJSON } from './lib/llm';

// ─── Tool result types ───────────────────────────────────────────────────────
// Stable across stub/real impls. #11-#16 keep these signatures; only the
// implementation bodies swap to LLM calls.

/** A single section role in the composition sequence. */
interface SectionRole {
  /** Canonical role name — used as componentKey (e.g. 'hero', 'menu', 'about'). */
  role: string;
  /** 1-line description of what this section conveys for this template. */
  intent: string;
}

interface ProposeCompositionResult {
  /** Normalized category — lowercase + hyphen (e.g. 'cafe', 'real-estate'). */
  category: string;
  /** 2–3 candidate leaf slugs the LLM proposes; user picks one. */
  templateLeafCandidates: string[];
  /** Section roles in render order. */
  composition: SectionRole[];
  /** Optional explanation of choices (shown to user, not persisted). */
  rationale?: string;
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
    /** Palette. `primary`/`secondary` are required — globalStyles overlay overlays them. */
    colors: Record<string, string>;
    /** Font stacks. `base` is required — globalStyles.fontFamily overlays it. */
    fonts: Record<string, string>;
    spacing?: Record<string, string>;
    radius?: Record<string, string>;
    shadows?: Record<string, string>;
  };
  /** 1-3문장 — 팔레트·폰트·spacing 선택 이유 (UX용, 저장 안 됨). */
  rationale?: string;
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

// Zod schema mirrors `ProposeCompositionResult`. The LLM is constrained to
// emit JSON matching this shape (via `output_config.format`).
const ProposeCompositionSchema = z.object({
  category: z
    .string()
    .regex(/^[a-z]+(-[a-z]+)*$/, 'lowercase letters and hyphens only'),
  templateLeafCandidates: z
    .array(z.string().regex(/^[a-z]+(-[a-z]+)*$/))
    .min(2)
    .max(4),
  composition: z
    .array(
      z.object({
        role: z.string().regex(/^[a-z]+(-[a-z]+)*$/),
        intent: z.string().min(1),
      }),
    )
    .min(1)
    .max(12),
  rationale: z.string().optional(),
});

const PROPOSE_COMPOSITION_SYSTEM_PROMPT = `당신은 정적 마케팅 사이트 generator의 첫 단계 plan-maker. 자유 텍스트 brief를 받아 (category, leaf slug 후보, section 시퀀스)를 추출.

OUTPUT (JSON only, no prose, no markdown):
{
  "category": "<lowercase + hyphen-only slug — 단일 단어 권장, 필요시 hyphen으로 합성>",
  "templateLeafCandidates": ["<slug-1>", "<slug-2>", "<slug-3>"],
  "composition": [
    { "role": "<lowercase+hyphen role name>", "intent": "<1줄 — 이 섹션이 brief의 어떤 메시지를 전달하는지>" },
    ...
  ],
  "rationale": "<선택 이유 1-2문장>"
}

RULES — category:
- 영소문자 + hyphen만 (예: cafe, real-estate, medical, fitness, legal, interior).
- 이미 잘 알려진 비즈니스 카테고리 1개 선택. 복수 카테고리에 걸치면 가장 지배적인 것 1개.
- 새 카테고리는 신중히 — brief가 정말 기존 카테고리에 안 들어맞을 때만.

RULES — templateLeafCandidates:
- 영소문자 + hyphen만. 1-3개 단어, 12자 내외 권장.
- brief의 분위기·컨셉을 압축하는 슬러그 (예: cozy-bookstore, modern-minimal, dark-vibe).
- 정확히 2-3개 후보 — 다른 톤/방향성을 제시 (안전한 선택 + 더 대담한 선택).
- "default" 또는 일반 명사 단독은 피함 (이미 base template로 점유됨).

RULES — composition (섹션 역할 시퀀스):
- 영소문자 + hyphen으로 role name. role은 generic하게: hero, nav, footer, about, services, menu, gallery, testimonials, contact, team, faq, pricing, story, process, stats, marquee, space, visit, etc.
- 보통 5-9개 섹션. 카테고리별 가이드:
  - cafe/restaurant: nav → hero → marquee? → menu → story → space? → testimonials? → visit (영업시간/지도) → footer
  - corporate: nav → hero → services → about → team? → contact → footer
  - medical/legal: nav → hero → services → about/team → process → testimonials → contact/booking → footer
  - portfolio/interior: nav → hero → portfolio → about → process → contact → footer
  - fitness: nav → hero → programs → trainers → marquee? → join (CTA) → footer
  - wedding: nav → hero → services → philosophy → portfolio → pricing → testimonials → contact → footer
- 첫 섹션은 보통 nav(있다면) 혹은 hero. 마지막은 footer.
- intent는 brief의 구체 어휘를 활용 (예: brief가 "강남 강의 바이브"면 about의 intent는 "강남 지역성과 독서 분위기를 풀어내는 소개").

RULES — 일반:
- brief가 한국어/영어/기타 — 다국어 OK. 응답 JSON은 항상 ASCII-only role/category/leaf slug.
- intent와 rationale은 brief 언어 따라가도 됨.
- 절대 prose나 markdown 외부 텍스트 출력 금지. JSON 한 개만.`;

async function propose_composition(brief: string): Promise<ProposeCompositionResult> {
  return claudeJSON({
    systemPrompt: PROPOSE_COMPOSITION_SYSTEM_PROMPT,
    userMessage: `Brief:\n${brief}`,
    schema: ProposeCompositionSchema,
  });
}

// Zod schema mirrors `ProposeDesignTokensResult`. Required overlay points
// (primary/secondary/base) are enforced so the thin globalStyles overlay
// (Issue #9) always has a target token.
const HEX_COLOR = z
  .string()
  .regex(/^#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})$/, 'must be #rgb/#rrggbb/#rgba/#rrggbbaa');

const ProposeDesignTokensSchema = z.object({
  defaultGlobalStyles: z.object({
    primaryColor:   HEX_COLOR,
    secondaryColor: HEX_COLOR,
    fontFamily:     z.string().min(1),
    fontSize:       z.string().regex(/^\d+(\.\d+)?(px|rem|em)$/, 'CSS length only (px / rem / em)'),
    layout:         z.enum(['wide', 'narrow', 'default']),
  }),
  designTokens: z.object({
    colors: z
      .object({ primary: HEX_COLOR, secondary: HEX_COLOR })
      .catchall(HEX_COLOR),
    fonts: z
      .object({ base: z.string().min(1) })
      .catchall(z.string().min(1)),
    spacing: z.record(z.string(), z.string()).optional(),
    radius:  z.record(z.string(), z.string()).optional(),
    shadows: z.record(z.string(), z.string()).optional(),
  }),
  rationale: z.string().optional(),
});

const PROPOSE_DESIGN_TOKENS_SYSTEM_PROMPT = `당신은 정적 마케팅 사이트 generator의 두 번째 단계 디자인 디렉터. brief + 이미 확정된 composition을 받아 풍부한 designTokens와 얇은 defaultGlobalStyles를 한 번에 결정.

OUTPUT (JSON only, no prose, no markdown):
{
  "defaultGlobalStyles": {
    "primaryColor":   "#RRGGBB",
    "secondaryColor": "#RRGGBB",
    "fontFamily":     "'<Font>', system-ui, sans-serif",
    "fontSize":       "16px",
    "layout":         "wide" | "narrow" | "default"
  },
  "designTokens": {
    "colors":  { "primary": "#…", "secondary": "#…", "<semantic-name>": "#…", … },
    "fonts":   { "base": "'<Font>', …, sans-serif", "serif"?: "'<Font>', serif", "display"?: "'<Font>', …", … },
    "spacing"?: { "xs": "0.5rem", "sm": "0.75rem", "md": "1rem", "lg": "1.5rem", "xl": "2.5rem" },
    "radius"?:  { "sm": "0.25rem", "md": "0.5rem", "lg": "1rem", "pill": "9999px" },
    "shadows"?: { "card": "0 1px 3px rgba(0,0,0,0.1)", "lift": "0 8px 24px rgba(0,0,0,0.12)" }
  },
  "rationale": "<1-3문장 — 팔레트·폰트·spacing 선택 이유>"
}

CORE 모델 (Issue #9):
- **defaultGlobalStyles**: 사용자가 어드민/에디터에서 *편집 가능한* 5필드만. 이 값은 designTokens의 특정 토큰을 overlay함:
  - primaryColor   → --color-primary
  - secondaryColor → --color-secondary
  - fontFamily     → --font-base
  - fontSize       → --font-size
- **designTokens**: 코드 고정. 컴포넌트가 var(--color-*) / var(--font-*) / var(--spacing-*) / var(--radius-*) / var(--shadow-*)로 참조. 위 4개 overlay key (primary/secondary/base/font-size)는 designTokens에 반드시 정의.

RULES — 색:
- 모두 hex (#rgb/#rrggbb/#rgba/#rrggbbaa). 'rgb()'/'hsl()'/named color 금지.
- colors.primary/secondary는 필수. 그 외 brand에 어울리는 의미 있는 이름: surface, surface-dark, accent, muted, on-dark, cream, ink 등. 보통 6-10개.
- WCAG AA 대비 고려: 본문 텍스트색-배경 대비비 4.5:1 이상 (감각으로 OK, 검증은 안 함).
- 비대비 조합 금지 (저채도 회색 위 저채도 베이지 등). 카테고리 mood에 충돌하는 색 금지 (medical에 네온 핑크 등).

RULES — 폰트:
- fonts.base는 필수 (전체 사이트 기본 폰트, 사용자 편집 가능).
- 'serif', 'display', 'mono' 등 추가 가능.
- 항상 fallback 포함: "'Pretendard', 'Apple SD Gothic Neo', sans-serif" 같은 식. 한글 카테고리는 Pretendard 권장, 영문 위주는 Inter/system-ui.

RULES — spacing/radius/shadows (선택 사항이지만 권장):
- spacing: T-shirt size (xs/sm/md/lg/xl). 값은 rem 단위.
- radius: 카테고리 톤에 맞게 — 모던/미니멀이면 작은 값 + pill 변형. 클래식이면 거의 0.
- shadows: 보수 색 + 낮은 opacity (rgba). 1-3개면 충분.

RULES — 일관성:
- composition의 sections와 brief의 분위기를 반영. 예: "어두운 바이브의 책방"이면 dark surface + warm gold accent + serif heading.
- 카테고리 mood 가이드:
  - cafe: warm earth + cream + serif accent
  - corporate: cool neutral + bold accent + sans-serif
  - medical/legal: muted + 1 strong accent + serif heading 권장
  - portfolio/interior: monochrome + warm/cool 양극화
  - fitness: high contrast + electric accent
  - wedding: blush/cream + gold/blush accent + script-feel serif

RULES — 형식:
- 모든 var name은 영소문자+hyphen만. 한국어 또는 ASCII가 아닌 키 금지.
- rationale은 brief 언어 따라가도 됨.
- 절대 prose나 markdown 외부 텍스트 금지. JSON 한 개만.`;

async function propose_design_tokens(
  brief: string,
  comp: ProposeCompositionResult,
): Promise<ProposeDesignTokensResult> {
  // Compact summary of the composition — saves tokens vs sending full intents.
  const compositionSummary = comp.composition.map(s => s.role).join(' → ');
  return claudeJSON({
    systemPrompt: PROPOSE_DESIGN_TOKENS_SYSTEM_PROMPT,
    userMessage: `Brief:
${brief}

Category: ${comp.category}
Composition (in render order): ${compositionSummary}

Section intents:
${comp.composition.map(s => `  - ${s.role}: ${s.intent}`).join('\n')}`,
    schema: ProposeDesignTokensSchema,
  });
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

/** A composition entry resolved from a SectionRole — has stable id + componentKey. */
interface ResolvedSection {
  id: string;
  componentKey: string;
  role: string;
  intent: string;
}

interface PlannedTemplate {
  templateRoot: string;                            // absolute path to template dir
  category: string;
  leaf: string;
  templateKey: string;                             // `${category}-${leaf}`
  composition: ResolvedSection[];
  tokens: ProposeDesignTokensResult;
  sections: GenerateSectionResult[];
}

/** Map LLM SectionRole list → ResolvedSection with stable IDs and componentKey. */
function resolveComposition(roles: SectionRole[]): ResolvedSection[] {
  const used = new Map<string, number>();
  return roles.map(r => {
    const n = (used.get(r.role) ?? 0) + 1;
    used.set(r.role, n);
    return { id: `${r.role}-${n}`, componentKey: r.role, role: r.role, intent: r.intent };
  });
}

function renderTokensFile(t: PlannedTemplate): string {
  const dt = t.tokens.designTokens;
  // Format each dimension as nested JSON, re-indented to sit inside the `designTokens` object.
  const fmt = (obj: Record<string, string>) =>
    JSON.stringify(obj, null, 2).replace(/\n/g, '\n  ');
  const lines: string[] = [`colors: ${fmt(dt.colors)}`, `fonts: ${fmt(dt.fonts)}`];
  if (dt.spacing) lines.push(`spacing: ${fmt(dt.spacing)}`);
  if (dt.radius)  lines.push(`radius: ${fmt(dt.radius)}`);
  if (dt.shadows) lines.push(`shadows: ${fmt(dt.shadows)}`);
  const body = lines.map(l => `  ${l}`).join(',\n');

  return `import { TemplateGlobalStyles } from '@/domain/entities/template.entity';
import type { DesignTokens } from '@/templates/types';

// Generated by \`pnpm template:generate\`. Edit freely — this is first-class code.

export const defaultGlobalStyles: TemplateGlobalStyles = ${JSON.stringify(t.tokens.defaultGlobalStyles, null, 2)};

export const designTokens: DesignTokens = {
${body},
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
  const compEntries = t.composition.map((c, idx) => {
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

/**
 * Multi-choice prompt: show candidates, return the picked value.
 *   number 1..N    → that candidate
 *   custom string  → user-supplied leaf (must match /^[a-z]+(-[a-z]+)*$/)
 *   'r'            → return null (regenerate signal)
 *   'q' / empty    → throw (abort)
 *
 * Auto-approve picks index 0.
 */
async function pickLeaf(candidates: string[], autoApprove: boolean): Promise<string | null> {
  console.log('\nCandidate leaf slugs:');
  candidates.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));
  if (autoApprove) {
    console.log(`  → auto-pick: ${candidates[0]}`);
    return candidates[0];
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = (
    await rl.question(`Pick [1-${candidates.length}], type a custom slug, [r]egenerate, or [q]uit: `)
  ).trim();
  rl.close();
  if (!answer || answer === 'q') throw new Error('aborted at leaf selection');
  if (answer === 'r') return null;
  const idx = Number(answer);
  if (Number.isInteger(idx) && idx >= 1 && idx <= candidates.length) return candidates[idx - 1];
  if (/^[a-z]+(-[a-z]+)*$/.test(answer)) return answer;
  console.error(`Invalid input "${answer}". Must be 1-${candidates.length}, a lowercase-hyphen slug, 'r', or 'q'.`);
  return pickLeaf(candidates, autoApprove);
}

/** Approve-or-regenerate prompt. Returns 'approve' | 'regenerate' | throws on abort. */
async function approveOrRegen(label: string, payload: unknown, autoApprove: boolean): Promise<'approve' | 'regenerate'> {
  console.log(`\n──── ${label} ────`);
  console.log(JSON.stringify(payload, null, 2));
  if (autoApprove) {
    console.log('  → auto-approved');
    return 'approve';
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = (await rl.question('[y]es / [r]egenerate / [n]o: ')).trim().toLowerCase();
  rl.close();
  if (answer === 'y' || answer === 'yes') return 'approve';
  if (answer === 'r') return 'regenerate';
  throw new Error('aborted at ' + label);
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

async function run() {
  const args = process.argv.slice(2);
  const autoApprove = args.includes('--auto-approve');
  const showHelp    = args.includes('--help') || args.includes('-h');
  const brief = args.find(a => !a.startsWith('--'));

  if (showHelp || !brief) {
    console.log(`Usage: pnpm template:generate "<brief>" [--auto-approve]

AI template generation pipeline.

Flow:
  1. propose_composition    LLM — category, leaf slug candidates, section roles
  2. propose_design_tokens  LLM — defaultGlobalStyles + rich designTokens
  3. generate_section       stub (Tracer #4 will replace)
  4. validate_and_capture   stub (Tracer #7 will replace)

Each step shows the proposal and asks for approval. propose_composition
also lets the user pick from leaf candidates or regenerate. --auto-approve
takes the first candidate and skips all prompts.

Requires ANTHROPIC_API_KEY in the environment. Tip:
  pnpm tsx --env-file=.env.local scripts/generate-template.ts "<brief>"
`);
    process.exit(brief ? 0 : 1);
  }

  console.log(`🤖 template:generate — brief: "${brief}"`);

  // Step 1 — propose_composition (LLM, with leaf selection + regenerate loop)
  let comp: ProposeCompositionResult | null = null;
  let leaf: string | null = null;
  for (let attempt = 1; attempt <= 4; attempt++) {
    console.log(`\n🧠 Calling Claude for propose_composition (attempt ${attempt})…`);
    comp = await propose_composition(brief);

    const decision = await approveOrRegen(
      'propose_composition',
      {
        category: comp.category,
        templateLeafCandidates: comp.templateLeafCandidates,
        composition: comp.composition,
        rationale: comp.rationale,
      },
      autoApprove,
    );
    if (decision === 'regenerate') {
      if (autoApprove) break; // shouldn't happen but defensive
      continue;
    }

    leaf = await pickLeaf(comp.templateLeafCandidates, autoApprove);
    if (leaf === null) continue; // user asked to regenerate
    break;
  }
  if (!comp || !leaf) {
    console.error('Could not settle on a composition + leaf within 4 attempts.');
    process.exit(1);
  }

  const templateKey = `${comp.category}-${leaf}`;
  const templateRoot = join(process.cwd(), 'src', 'templates', comp.category, leaf);
  if (existsSync(templateRoot)) {
    console.error(`❌ Template dir already exists: ${templateRoot}`);
    console.error('   Delete it first or regenerate to get a different leaf.');
    process.exit(1);
  }

  // Step 2 — propose_design_tokens (LLM, with regenerate loop)
  let tokens: ProposeDesignTokensResult | null = null;
  let tokensApproved = false;
  for (let attempt = 1; attempt <= 4; attempt++) {
    console.log(`\n🧠 Calling Claude for propose_design_tokens (attempt ${attempt})…`);
    tokens = await propose_design_tokens(brief, comp);
    const decision = await approveOrRegen('propose_design_tokens', tokens, autoApprove);
    if (decision === 'approve') {
      tokensApproved = true;
      break;
    }
    // decision === 'regenerate' → loop
  }
  if (!tokens || !tokensApproved) {
    console.error('Could not settle on design tokens within 4 attempts.');
    process.exit(1);
  }

  // Step 3 — generate_section per resolved section (stub)
  const resolvedComposition = resolveComposition(comp.composition);
  const sections: GenerateSectionResult[] = [];
  for (const s of resolvedComposition) {
    const section = stub_generate_section(brief, s.componentKey, tokens);
    if (!(await approve(`generate_section[${s.componentKey}]`,
        { componentKey: section.componentKey, sourceLines: section.tsxSource.split('\n').length }, autoApprove))) {
      console.log(`Aborted at generate_section[${s.componentKey}].`); process.exit(1);
    }
    sections.push(section);
  }

  // Write files
  const planned: PlannedTemplate = { templateRoot, category: comp.category, leaf, templateKey, composition: resolvedComposition, tokens, sections };
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
