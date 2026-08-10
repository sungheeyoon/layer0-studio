/**
 * Pure Value-mutation core for the Editor (ADR-0016 §4).
 *
 * Before ADR-0016 this file wrote *into* `Field` objects — `field.value = x`,
 * `field.items = xs` — which is why it needed a `writeField` primitive to
 * narrow "array → items / scalar → value / image → assetId". A Value carries no
 * `type`, so there is nothing left to narrow: the editor already knows which
 * shape it is writing, because it got the shape from the schema
 * (`library[block.type].meta.fieldsSchema[key]`) rather than from the data.
 * Writing is now a plain assignment and `writeField` is gone.
 *
 * Two tiers, mirroring `ordered-nav-list.ts`:
 *   1. A generic pure core over an array field's items
 *      (`setItemFieldAt` / `addItem` / `removeItemAt` / `moveItemAt`) — used by
 *      the recursive `ArrayFieldEditor`, which only ever holds a local items
 *      array (never the whole `ContentModel`), so these are index-scoped and
 *      return a new array (feeding React `onChange`).
 *   2. A mode-agnostic `setFieldValue(json, …)` that mutates the passed draft
 *      in place — consistent with the nav dispatchers, called inside the
 *      Editor's `updateContent` (which hands over a `structuredClone`d draft).
 *
 * Contract (mirrors `ordered-nav-list`): invalid input is a silent no-op — the
 * item ops return the *same* array reference on an out-of-range index.
 */
import {
  ContentModel,
  ImageValue,
  allBlocks,
} from './template.entity';

/**
 * One repeating item as the editor holds it — the runtime twin of
 * `ArrayItem<S>` (ADR-0016 §4-3), loose in exactly the way `Block.fields` is
 * loose (§4-2): the editor dispatches on a descriptor at render time and never
 * knows a Block's Content type statically.
 *
 * `id` is a sibling of `fields`, never a key inside it. It is generated with
 * `crypto.randomUUID()` and **carried through every reorder unchanged** — it is
 * both the React key and the asset `slot_key` segment (§4-4), so an id that
 * moved with the position would silently repoint an asset usage.
 */
export interface EditableItem {
  id: string;
  fields: Record<string, unknown>;
}

/** The Value written into a single field — one per `FieldDescriptor` type. */
export type FieldValue = string | number | ImageValue | EditableItem[];

export type MoveDirection = 'up' | 'down';

/**
 * Set a field on the section identified by `sectionId`, in place, regardless of
 * Site Type (resolves via `allBlocks`). No-op on an unknown section.
 * Mutates the passed `json` — call inside the Editor's `updateContent` draft.
 *
 * Unlike its pre-ADR-0016 self this *creates* an absent key rather than
 * skipping it. It has to: a Value-shaped `fields` holds no placeholder for an
 * optional field nobody has filled in yet, so the first edit of one is always a
 * write to a key that does not exist. The editor only ever offers keys the
 * schema declares, so this cannot invent a field the component has no
 * descriptor for.
 */
export function setFieldValue(
  json: ContentModel,
  sectionId: string,
  fieldKey: string,
  value: FieldValue,
): void {
  const section = allBlocks(json).find((s) => s.id === sectionId);
  if (section) section.fields[fieldKey] = value;
}

/**
 * Set a field on the item at `index` within an array field's items. Pure:
 * returns a new array (deep-cloned so nested items stay isolated), or the same
 * reference when `index` is out of range. `id` is untouched.
 */
export function setItemFieldAt(
  items: EditableItem[],
  index: number,
  fieldKey: string,
  value: FieldValue,
): EditableItem[] {
  if (index < 0 || index >= items.length) return items;
  const next = structuredClone(items);
  next[index].fields[fieldKey] = value;
  return next;
}

/** Append an item. Pure. */
export function addItem(items: EditableItem[], item: EditableItem): EditableItem[] {
  return [...items, item];
}

/** Remove the item at `index`. Pure; same reference on an out-of-range index. */
export function removeItemAt(items: EditableItem[], index: number): EditableItem[] {
  if (index < 0 || index >= items.length) return items;
  const next = items.slice();
  next.splice(index, 1);
  return next;
}

/**
 * Move the item at `index` one step up/down. Pure; same reference when `index`
 * is out of range or the move would cross a list boundary. Swaps the item
 * objects, so each item keeps its own `id` (ADR-0016 §4-4 invariant 1).
 */
export function moveItemAt(
  items: EditableItem[],
  index: number,
  direction: MoveDirection,
): EditableItem[] {
  if (index < 0 || index >= items.length) return items;
  const target = direction === 'up' ? index - 1 : index + 1;
  if (target < 0 || target >= items.length) return items;
  const next = items.slice();
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/** Whether another item may be added (respects an optional max). Pure. */
export function canAddItem(items: EditableItem[], max?: number): boolean {
  return max === undefined || items.length < max;
}

/** Whether an item may be removed (respects an optional min). Pure. */
export function canRemoveItem(items: EditableItem[], min?: number): boolean {
  return min === undefined || items.length > min;
}

/**
 * Coerce what a `type="number"` input holds into the Value the renderer will
 * read. The parse happens **once, here at the editor boundary** (ADR-0016 §4-3):
 * an emptied or unparseable input becomes the descriptor's `default`, so no
 * `NaN`/`null` ever reaches `Block.fields` and every renderer can treat a
 * `number` Value as finite without checking.
 *
 * This is why `FieldDescriptor` makes `default` mandatory on `number` — without
 * one there is no defined answer to "what does an empty input mean".
 */
export function coerceNumberInput(raw: string, fallback: number): number {
  if (raw.trim() === '') return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}
