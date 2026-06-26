import type { Messages } from './messages/ko';

type CategoryLabels = Messages['templatesCatalog']['categoryLabels'];

/**
 * Translate a raw DB category slug (e.g. `"Legal"`, `"corporate"`) into the
 * active locale's label. Categories are free-form data, so anything not in the
 * map falls back to the raw value. Shared by the public (`PublicTemplateGrid`)
 * and dashboard (`DynamicTemplateGrid`) catalogs so the two never drift.
 */
export function categoryLabel(labels: CategoryLabels, category: string): string {
  return labels[category.toLowerCase() as keyof CategoryLabels] ?? category;
}
