import { FieldDescriptor, FieldsSchema } from '@/domain/entities/template.entity';
import { EditableItem, FieldValue } from '@/domain/entities/field-edit';

/**
 * The empty Value one descriptor implies (ADR-0016 §4). The schema is the only
 * thing that knows what "empty" means for a field — a `select` starts on its
 * first option, a `number` on its mandatory `default`, an `image` on an
 * `ImageValue` with no url — so this dispatches on the descriptor, never on the
 * data (which after ADR-0016 carries no `type` to dispatch on).
 *
 * Also the editor's placeholder for an *absent* optional key: an unfilled
 * optional field has no Value stored, and its input still has to render
 * something.
 */
export function emptyValue(descriptor: FieldDescriptor): FieldValue {
  switch (descriptor.type) {
    case 'array':
      return [];
    case 'image':
      return { url: '' };
    case 'select':
      // `?? ''` because `options: []` is a valid (if useless) schema — the
      // discriminated union only demands that `options` be present.
      return descriptor.options[0] ?? '';
    case 'number':
      return descriptor.default;
    default:
      return '';
  }
}

/**
 * Build a fresh array item from an `itemSchema` — an `id` plus one empty Value
 * per declared field.
 *
 * The id is a `crypto.randomUUID()` (ADR-0016 §4-4 invariant 1). It replaces the
 * old `_key` fake Field that `injectKeys`/`stripKeys` stamped on and off the
 * content: array items now carry a real, persisted identifier, which is what
 * both the React key and the asset `slot_key` hang off.
 *
 * Schema-aware, so it lives here (beside `validate.ts`) rather than in the
 * domain layer, which stays free of any `@/templates` dependency. The pure,
 * schema-free item mutations live in `@/domain/entities/field-edit`.
 */
export function makeEmptyItem(itemSchema: FieldsSchema): EditableItem {
  const fields: Record<string, unknown> = {};
  for (const [key, descriptor] of Object.entries(itemSchema)) {
    fields[key] = emptyValue(descriptor);
  }
  return { id: crypto.randomUUID(), fields };
}
