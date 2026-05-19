import { TemplateModule } from './types';
import { templateMap, getAvailableTemplateKeys as getGeneratedKeys } from './_generated';

export function getAvailableTemplateKeys(): string[] {
  return getGeneratedKeys();
}

/**
 * Load a template module by key.
 *
 * Backward-compat shim (post-#6 β): if the supplied key is a bare legacy theme
 * key like 'cafe' (pre-β), try '<key>-default' as a fallback. This keeps existing
 * `user_sites.site_json.templateKey` values rendering until migration 015 is
 * applied to realign them with the new `<category>-<leaf>` concat slugs.
 */
export async function loadTemplate(templateKey: string): Promise<TemplateModule | null> {
  let loader = templateMap[templateKey];
  if (!loader) {
    const fallbackKey = `${templateKey}-default`;
    loader = templateMap[fallbackKey];
  }
  if (!loader) return null;
  return loader();
}
