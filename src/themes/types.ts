import { TemplateJson, TemplateSection } from '@/domain/entities/template.entity';
import { ComponentType } from 'react';

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
