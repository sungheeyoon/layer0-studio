import { ContentModel, Field, allSections } from '@/domain/entities/template.entity';

/**
 * The editor-only `_key` Field stamped on every array item for stable React
 * keys. Single source, shared by `injectKeys` (on load) and `makeEmptyItem`
 * (on add). Stripped before persisting — see `stripKeys`.
 */
export function makeItemKey(): Field {
  return {
    type: 'text',
    value: Math.random().toString(36).slice(2),
    label: '_key',
    editable: false,
  };
}

/**
 * Injects temporary stable keys for array items in the editor.
 * These keys are used for React rendering and are stripped before saving to the database.
 */
export function injectKeys(json: ContentModel): ContentModel {
  const updated = structuredClone(json);
  allSections(updated).forEach((section) => {
    // `Block.fields` is loose after ADR-0016 §4-2. This whole file is the `_key`
    // workaround that §4-4 replaces with a real `item.id`, so it is read back as
    // the legacy `Field` shape it was written against rather than modernised.
    (Object.values(section.fields) as Field[]).forEach((field) => {
      if (field.type === 'array' && field.items) {
        field.items.forEach((item) => {
          if (!item._key) {
            item._key = makeItemKey();
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
    (Object.values(section.fields) as Field[]).forEach((field) => {
      if (field.type === 'array' && field.items) {
        field.items.forEach((item) => {
          delete item._key;
        });
      }
    });
  });
  return updated;
}
