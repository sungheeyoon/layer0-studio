import { TemplatePreset, ThemeModule } from '@/themes/types';
import { TemplateJson } from '@/domain/entities/template.entity';

/**
 * Derives a full TemplateJson from a TemplatePreset.
 * If the preset already has templateJson, it returns it.
 * If it has composition, it constructs templateJson using the theme's default as a base.
 */
export function deriveTemplateJsonFromPreset(
  preset: TemplatePreset,
  themeModule?: ThemeModule | null
): TemplateJson {
  if (preset.templateJson && !preset.composition) {
    return preset.templateJson;
  }

  if (!preset.composition || !preset.themeKey) {
    if (preset.templateJson) return preset.templateJson;
    throw new Error(`Preset ${preset.slug} must have either templateJson or both themeKey and composition`);
  }

  if (!themeModule) {
    throw new Error(`Theme module required to derive templateJson for composition-based preset ${preset.slug}`);
  }

  return {
    themeKey: preset.themeKey,
    globalStyles: {
      ...themeModule.defaultTemplateJson.globalStyles,
      ...preset.globalStyles,
    },
    pages: [
      {
        id: 'home',
        title: 'Home',
        slug: 'home',
        order: 0,
        sections: preset.composition.map((ps, index) => ({
          id: ps.id,
          type: ps.componentKey,
          order: index,
          visible: ps.visible ?? true,
          editable: true,
          data: ps.data,
        })),
      },
    ],
  };
}
