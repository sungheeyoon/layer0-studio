import { TemplatePreset, TemplateModule } from '@/templates/types';
import { TemplateJson } from '@/domain/entities/template.entity';

/**
 * Derives a full TemplateJson from a TemplatePreset.
 * If the preset already has templateJson, it returns it.
 * If it has composition, it constructs templateJson using the template's default as a base.
 *
 * Post-β: templateKey == preset.slug (1:1, directory layout derives both).
 */
export function deriveTemplateJsonFromPreset(
  preset: TemplatePreset,
  templateModule?: TemplateModule | null
): TemplateJson {
  if (preset.templateJson && !preset.composition) {
    return preset.templateJson;
  }

  if (!preset.composition) {
    if (preset.templateJson) return preset.templateJson;
    throw new Error(`Preset ${preset.slug} must have either templateJson or composition`);
  }

  if (!templateModule) {
    throw new Error(`Template module required to derive templateJson for composition-based preset ${preset.slug}`);
  }

  return {
    templateKey: preset.slug,
    globalStyles: {
      ...templateModule.defaultTemplateJson.globalStyles,
      ...preset.globalStyles,
    },
    pages: [
      {
        id: 'home',
        title: 'Home',
        slug: 'home',
        order: 0,
        sections: preset.composition.map((ps) => ({
          id: ps.id,
          type: ps.componentKey,
          visible: ps.visible ?? true,
          editable: true,
          data: ps.data,
        })),
      },
    ],
  };
}
