/**
 * Pure Field-mutation core for the Editor — the write-side companion to
 * `getFieldValue` (reads, in `template.entity.ts`).
 *
 * Two tiers, mirroring `ordered-nav-list.ts`:
 *   1. A generic pure core over an array Field's `items`
 *      (`setItemFieldAt` / `addItem` / `removeItemAt` / `moveItemAt`) — used by
 *      the recursive `ArrayFieldEditor`, which only ever holds a local `items`
 *      array (never the whole `ContentModel`), so these are index-scoped and
 *      return a new array (feeding React `onChange`).
 *   2. A mode-agnostic `setFieldValue(json, …)` that mutates the passed draft
 *      in place — consistent with the nav dispatchers, called inside the
 *      Editor's `updateContent` (which hands over a `structuredClone`d draft).
 *
 * Both tiers funnel through one primitive, `writeField`, which is the single
 * home of the "array → items / scalar → value / image → assetId" narrowing that
 * was previously copy-pasted across the Editor's two field-write handlers.
 *
 * Contract (mirrors `ordered-nav-list`): invalid input is a silent no-op — the
 * item ops return the *same* array reference on an out-of-range index, and
 * `writeField` leaves the field untouched on a type/value mismatch.
 */
import {
  ContentModel,
  Field,
  ArrayField,
  allSections,
} from './template.entity';

/** One repeating item inside an array Field — a dictionary of Fields. */
export type FieldItem = Record<string, Field>;

/** The value written into a single Field: a scalar string, or array items. */
export type FieldValue = string | ArrayField['items'];

export type MoveDirection = 'up' | 'down';

/**
 * Write a value into a single Field, in place. The one home of the field-write
 * narrowing: an array value replaces `items`; a string value sets `value` (and
 * stamps `assetId` when the field is an image). A type/value mismatch (e.g. a
 * string aimed at an array Field) is a silent no-op.
 */
export function writeField(field: Field, value: FieldValue, assetId?: string): void {
  if (field.type === 'array' && Array.isArray(value)) {
    field.items = value;
  } else if (field.type !== 'array' && typeof value === 'string') {
    field.value = value;
    if (assetId !== undefined && field.type === 'image') {
      field.assetId = assetId;
    }
  }
}

/**
 * Set a Field on the section identified by `sectionId`, in place, regardless of
 * Site Type (resolves via `allSections`). No-op on an unknown section/field.
 * Mutates the passed `json` — call inside the Editor's `updateContent` draft.
 */
export function setFieldValue(
  json: ContentModel,
  sectionId: string,
  fieldKey: string,
  value: FieldValue,
  assetId?: string,
): void {
  const section = allSections(json).find((s) => s.id === sectionId);
  const field = section?.fields[fieldKey];
  if (field) writeField(field, value, assetId);
}

/**
 * Set a Field on the item at `index` within an array Field's `items`. Pure:
 * returns a new array (deep-cloned so nested items stay isolated), or the same
 * reference when `index` is out of range.
 */
export function setItemFieldAt(
  items: FieldItem[],
  index: number,
  fieldKey: string,
  value: FieldValue,
  assetId?: string,
): FieldItem[] {
  if (index < 0 || index >= items.length) return items;
  const next = structuredClone(items);
  const field = next[index][fieldKey];
  if (field) writeField(field, value, assetId);
  return next;
}

/** Append an item. Pure. */
export function addItem(items: FieldItem[], item: FieldItem): FieldItem[] {
  return [...items, item];
}

/** Remove the item at `index`. Pure; same reference on an out-of-range index. */
export function removeItemAt(items: FieldItem[], index: number): FieldItem[] {
  if (index < 0 || index >= items.length) return items;
  const next = items.slice();
  next.splice(index, 1);
  return next;
}

/**
 * Move the item at `index` one step up/down. Pure; same reference when `index`
 * is out of range or the move would cross a list boundary.
 */
export function moveItemAt(
  items: FieldItem[],
  index: number,
  direction: MoveDirection,
): FieldItem[] {
  if (index < 0 || index >= items.length) return items;
  const target = direction === 'up' ? index - 1 : index + 1;
  if (target < 0 || target >= items.length) return items;
  const next = items.slice();
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/** Whether another item may be added (respects an optional max). Pure. */
export function canAddItem(items: FieldItem[], max?: number): boolean {
  return max === undefined || items.length < max;
}

/** Whether an item may be removed (respects an optional min). Pure. */
export function canRemoveItem(items: FieldItem[], min?: number): boolean {
  return min === undefined || items.length > min;
}
