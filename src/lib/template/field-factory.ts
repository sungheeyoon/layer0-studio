import { Field } from '@/domain/entities/template.entity';
import { FieldItem } from '@/domain/entities/field-edit';
import { SectionFieldsSchema } from '@/templates/types';
import { makeItemKey } from './keys';

/**
 * Build a fresh, editor-ready array item from an `itemSchema` — each schema
 * field becomes an empty Field of the right type (select defaults to its first
 * option; array becomes an empty list), plus the editor `_key`.
 *
 * Schema-aware, so it lives here (beside `validate.ts`) rather than in the
 * domain layer, which stays free of any `@/templates` dependency. The pure,
 * schema-free item mutations live in `@/domain/entities/field-edit`.
 */
export function makeEmptyItem(itemSchema: SectionFieldsSchema): FieldItem {
  const item: FieldItem = { _key: makeItemKey() };

  for (const [key, schema] of Object.entries(itemSchema)) {
    if (schema.type === 'array') {
      item[key] = { type: 'array', label: schema.label, items: [] };
    } else if (schema.type === 'image') {
      item[key] = { type: 'image', label: schema.label, value: '' };
    } else if (schema.type === 'select') {
      item[key] = {
        type: 'select',
        label: schema.label,
        value: schema.options[0] ?? '',
        // Copied, not aliased: the schema's `options` is a readonly literal
        // tuple (declared `as const`) and this Field is editor-mutable state.
        options: [...schema.options],
      };
    } else {
      item[key] = {
        type: schema.type as 'text' | 'textarea' | 'url' | 'color' | 'number',
        label: schema.label,
        value: '',
      } as Field;
    }
  }

  return item;
}
