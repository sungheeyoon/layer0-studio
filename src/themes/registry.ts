import { TemplateModule } from './types';
import { templateMap, getAvailableTemplateKeys as getGeneratedKeys } from './_generated';

export function getAvailableTemplateKeys(): string[] {
  return getGeneratedKeys();
}

export async function loadTemplate(templateKey: string): Promise<TemplateModule | null> {
  const loader = templateMap[templateKey];
  if (!loader) return null;
  return loader();
}
