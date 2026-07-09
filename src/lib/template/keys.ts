import { ContentModel, allSections } from '@/domain/entities/template.entity';

/**
 * Injects temporary stable keys for array items in the editor.
 * These keys are used for React rendering and are stripped before saving to the database.
 */
export function injectKeys(json: ContentModel): ContentModel {
  const updated = structuredClone(json);
  allSections(updated).forEach((section) => {
    Object.values(section.data).forEach((field) => {
      if (field.type === 'array' && field.items) {
        field.items.forEach((item) => {
          if (!item._key) {
            item._key = {
              type: 'text',
              value: Math.random().toString(36).slice(2),
              label: '_key',
              editable: false,
            };
          }
        });
      }
    });
  });
  return updated;
}

/**
 * Strips temporary keys from the site JSON before persisting it to the database.
 */
export function stripKeys(json: ContentModel): ContentModel {
  const updated = structuredClone(json);
  allSections(updated).forEach((section) => {
    Object.values(section.data).forEach((field) => {
      if (field.type === 'array' && field.items) {
        field.items.forEach((item) => {
          delete item._key;
        });
      }
    });
  });
  return updated;
}
