import { TemplateJson, TemplateSection } from '@/domain/entities/template.entity';
import { ComponentType } from 'react';

/**
 * A seed template stored in code.
 * templateJson / thumbnailPath / version — code is source of truth (sync always overwrites).
 * defaults.* — seed-only; DB value is preserved if the row already exists.
 */
export interface TemplatePreset {
  /** DB row slug — upsert key. Never change after first publish. */
  slug: string;

  /** The full template JSON seeded into the DB. Code is always authoritative. */
  templateJson: TemplateJson;
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

/** Definition of a slot supported by a theme */
export interface ThemeSlotDefinition {
  type: string;       // Matches section.type (e.g. 'hero')
  label: string;      // For display in editor (e.g. 'Hero Section')
  required: boolean;  // Whether it's a required slot
}

export interface ThemeModule {
  default: ComponentType<ThemeRendererProps>;
  slots: ThemeSlotDefinition[];
  defaultTemplateJson: TemplateJson;
}
