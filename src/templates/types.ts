import { TemplateJson, TemplateSection, TemplateFieldType } from '@/domain/entities/template.entity';
import { ComponentType } from 'react';

/**
 * Metadata for a section component
 */
export interface SectionComponentMeta {
  componentKey: string;            // Unique key in the library ('hero-video', 'menu-grid', etc.)
  category: string;                 // 'hero' | 'menu' | 'story' | 'footer' | ...
  label: string;                    // Display name in admin catalog
  dataSchema: SectionDataSchema;   // Field type/required definitions
  previewImage?: string;            // Admin catalog thumbnail (optional)
}

export interface SectionDataSchema {
  [fieldKey: string]: {
    type: TemplateFieldType;
    label: string;
    required?: boolean;
    options?: string[]; // (select용, 이미 사실상 사용 중)
    itemSchema?: SectionDataSchema; // ★ type: 'array'일 때 필수
    minItems?: number; // ★ optional 제약
    maxItems?: number; // ★ optional 제약
  };
}

/**
 * A section component. Meta is optional here because client components
 * (`'use client'`) cannot expose static metadata to the server — server-side
 * imports of client modules are wrapped as client references and the module
 * body never runs server-side. For those, meta is supplied via libEntry().
 */
export type SectionComponent = ComponentType<TemplateSectionProps> & {
  meta?: SectionComponentMeta;
};

/**
 * One entry in a template's library: the component plus its server-resolved metadata.
 */
export interface TemplateLibraryEntry {
  Component: SectionComponent;
  meta: SectionComponentMeta;
}

/**
 * Library of components exported by a template module, keyed by componentKey.
 */
export interface TemplateLibrary {
  [componentKey: string]: TemplateLibraryEntry;
}

/**
 * Helper for library/index.ts files. For server components, meta is read from
 * `Component.meta` (set inside the .tsx). For client components, pass meta
 * explicitly from a sibling `<Component>.meta.ts` file.
 */
export function libEntry(
  Component: SectionComponent,
  metaOverride?: SectionComponentMeta,
): TemplateLibraryEntry {
  const meta = metaOverride ?? Component.meta;
  if (!meta) {
    throw new Error(
      `libEntry: component "${Component.displayName ?? Component.name}" is missing meta. ` +
      `Server components: assign Component.meta = {...} inside the .tsx. ` +
      `Client components ('use client'): pass meta from a sibling <Component>.meta.ts.`,
    );
  }
  return { Component, meta };
}

/**
 * A seed template stored in code.
 * templateJson / thumbnailPath / version — code is source of truth (sync always overwrites).
 * defaults.* — seed-only; DB value is preserved if the row already exists.
 */
export interface TemplatePreset {
  /** DB row slug — upsert key. Never change after first publish. */
  slug: string;

  /**
   * The full template JSON seeded into the DB. A `mode`-discriminated union
   * (Single / Multi) — the Preset is the source of truth, carried verbatim
   * (the legacy `composition` short-hand was removed, see ADR-0007).
   */
  templateJson: TemplateJson;

  /** Relative path from project root, e.g. 'public/thumbnails/template-cafe.jpg' */
  thumbnailPath: string;
  /**
   * Semver, displayed + audited. NOT a monotonic gate: sync applies whenever
   * `templateJson` / `version` / `thumbnail` differs from the DB — in EITHER
   * direction. This is deliberate (ADR-0012 §6): it's what makes `git revert`
   * of a bad template work as a rollback (the reverted, lower version re-applies
   * the previous JSON). Do NOT "fix" sync into a forward-only `>` comparison —
   * that would silently break revert-as-rollback.
   */
  version: string;

  /** Initial values only. Ignored by sync when the DB row already has a value. */
  defaults: {
    name: string;
    description: string;
    category: string;
  };
}

/** Template overall page renderer Props */
export interface TemplateRendererProps {
  siteJson: TemplateJson;
  selectedSectionId: string | null;
  onSectionClick?: (sectionId: string) => void;
  activePageId?: string; // ID of the page to render
  /**
   * URL prefix for Multi page-link nav (e.g. `/site/acme` or `/preview/<id>`).
   * `deriveNav` builds `${basePath}/${page.slug}` (home → `basePath`). Ignored
   * by Single (anchor scroll). Defaults to '' — see renderMultiSite.
   */
  basePath?: string;
}

/** Template individual section renderer Props (for components within slots) */
export interface TemplateSectionProps {
  section: TemplateSection;
  isSelected?: boolean;
  onClick?: () => void;
}

/** A single derived nav entry. `href` = anchor (Single) or slug (Multi). */
export interface NavItem {
  label: string;
  href: string;
}

/**
 * Props for a nav section component. The nav can't see its siblings through
 * `TemplateSectionProps` (which only carries its own `section`), so the site
 * renderer projects the menu (`deriveNav`) and injects it directly into the
 * `type === 'nav'` section. `navItems` is supplied by the renderer (always
 * present — possibly empty). See ADR-0007 / PLAN_multipage §3.3.
 */
export interface NavSectionProps extends TemplateSectionProps {
  navItems: NavItem[];
}

export interface TemplateModule {
  default: ComponentType<TemplateRendererProps>;
  defaultTemplateJson: TemplateJson;
  library: TemplateLibrary;
}

/**
 * A template's rich design tokens — the *code-fixed* visual identity.
 * The user-editable thin layer is `TemplateGlobalStyles` (primaryColor,
 * secondaryColor, fontFamily, fontSize) which overlays specific keys here
 * via `tokensToCssVars()` (`src/lib/template/design-tokens.ts`).
 *
 * Convention: each dimension's entries become `--{dimension-singular}-{key}`
 * CSS custom properties on the template root, e.g. `colors.primary` →
 * `--color-primary`. Section components reference these via `var(--color-primary)`.
 *
 * AI generation pipeline (issues #11+) emits this shape directly so visual
 * identity is captured as data, not as ad-hoc CSS strings.
 */
export interface DesignTokens {
  /** Palette. globalStyles.primaryColor overlays `primary`, secondaryColor overlays `secondary`. */
  colors?: Record<string, string>;
  /** Font stacks. globalStyles.fontFamily overlays `base`. */
  fonts?: Record<string, string>;
  /** Spacing scale (e.g. `sm`, `md`, `lg`). */
  spacing?: Record<string, string>;
  /** Border radii. */
  radius?: Record<string, string>;
  /** Box shadows. */
  shadows?: Record<string, string>;
  /** Typography (font-size, line-height, letter-spacing presets). */
  typography?: Record<string, string>;
}
