import { PresetSection } from '../types';
import { TemplateSection } from '@/domain/entities/template.entity';

/**
 * Helper to convert a list of PresetSection to TemplateSection array.
 * Automatically manages 'order' based on array index.
 */
export function createComposition(sections: PresetSection[]): TemplateSection[] {
  return sections.map((s, index) => ({
    id: s.id,
    type: s.componentKey,
    order: index, // Composition index is the truth for order
    visible: s.visible ?? true,
    editable: true,
    data: s.data,
  }));
}

/**
 * Helper for legacy presets to extract sections from defaultTemplateJson.
 */
export function extractCompositionFromLegacy(sections: TemplateSection[]): PresetSection[] {
  return sections.map(s => ({
    id: s.id,
    componentKey: s.type,
    visible: s.visible,
    data: s.data,
  }));
}
