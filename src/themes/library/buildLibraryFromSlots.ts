import { ComponentType } from 'react';
import { 
  ThemeSlotDefinition, 
  ThemeSectionProps, 
  ThemeLibrary, 
  SectionComponent, 
  SectionDataSchema 
} from '../types';
import { TemplateJson } from '@/domain/entities/template.entity';

/**
 * Adapter to bridge Phase 1-5 'slots' model to Phase 6 'composition' model.
 * 
 * It wraps each component with a .meta tag.
 * dataSchema is inferred from the defaultTemplateJson as a temporary measure.
 */
export function buildLibraryFromSlots(
  slots: ThemeSlotDefinition[],
  componentMap: Record<string, ComponentType<ThemeSectionProps>>,
  defaultTemplateJson: TemplateJson
): ThemeLibrary {
  const library: ThemeLibrary = {};

  // Find the first page to use for schema inference
  const sections = defaultTemplateJson.pages[0]?.sections || [];

  slots.forEach((slot) => {
    const Component = componentMap[slot.type];
    if (!Component) return;

    // Infer schema from default data
    const sectionData = sections.find(s => s.type === slot.type)?.data || {};
    const dataSchema: SectionDataSchema = {};
    
    Object.entries(sectionData).forEach(([key, field]) => {
      dataSchema[key] = {
        type: field.type,
        label: field.label,
        required: true, // Legacy fields are generally treated as required for simplicity
      };
    });

    const SectionWithMeta = Component as SectionComponent;
    SectionWithMeta.meta = {
      componentKey: slot.type,
      category: slot.type, // Map 1:1 for now
      label: slot.label,
      dataSchema,
    };

    library[slot.type] = SectionWithMeta;
  });

  return library;
}
