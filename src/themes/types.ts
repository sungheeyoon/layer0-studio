import { TemplateJson, TemplateSection, TemplateFieldType, TemplateField, TemplateGlobalStyles } from '@/domain/entities/template.entity';
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
export type SectionComponent = ComponentType<ThemeSectionProps> & {
  meta?: SectionComponentMeta;
};

/**
 * One entry in a theme's library: the component plus its server-resolved metadata.
 */
export interface ThemeLibraryEntry {
  Component: SectionComponent;
  meta: SectionComponentMeta;
}

/**
 * Library of components exported by a theme module, keyed by componentKey.
 */
export interface ThemeLibrary {
  [componentKey: string]: ThemeLibraryEntry;
}

/**
 * Helper for library/index.ts files. For server components, meta is read from
 * `Component.meta` (set inside the .tsx). For client components, pass meta
 * explicitly from a sibling `<Component>.meta.ts` file.
 */
export function libEntry(
  Component: SectionComponent,
  metaOverride?: SectionComponentMeta,
): ThemeLibraryEntry {
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
 * A section entry within a preset or page
 */
export interface PresetSection {
  id: string;                       // Stable ID preserved in user sites
  componentKey: string;             // Must exist in theme.library
  visible?: boolean;
  data: Record<string, TemplateField>;
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
   * The composition of sections. If provided, templateJson is derived from this.
   * If not provided, templateJson must be present.
   */
  composition?: PresetSection[];

  /** Theme key (e.g. 'cafe', 'corporate'). Required if composition is used. */
  themeKey?: string;

  /** Global style overrides. Optional, merged with theme defaults if composition is used. */
  globalStyles?: Partial<TemplateGlobalStyles>;

  /** 
   * The full template JSON seeded into the DB. 
   * If composition is present, this is ignored/derived during sync.
   */
  templateJson?: TemplateJson;

  /** Relative path from project root, e.g. 'public/thumbnails/template-cafe.jpg' */
  thumbnailPath: string;
  /** Semver — sync only overwrites templateJson when this exceeds the DB version. */
  version: string;

  /** Initial values only. Ignored by sync when the DB row already has a value. */
  defaults: {
    name: string;
    description: string;
    category: string;
  };
}

/** Theme overall page renderer Props */
export interface ThemeRendererProps {
  siteJson: TemplateJson;
  selectedSectionId: string | null;
  onSectionClick?: (sectionId: string) => void;
  activePageId?: string; // ID of the page to render
}

/** Theme individual section renderer Props (for components within slots) */
export interface ThemeSectionProps {
  section: TemplateSection;
  isSelected?: boolean;
  onClick?: () => void;
}

export interface ThemeModule {
  default: ComponentType<ThemeRendererProps>;
  defaultTemplateJson: TemplateJson;
  library: ThemeLibrary;
}
