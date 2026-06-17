/**
 * The write-side mirror of `deriveNav` (see `template.entity.ts`).
 *
 * ADR-0007 collapsed the Single/Multi union for nav *reads* into one generic
 * path. The Editor's nav *mutations* (reorder / toggle `visible` / toggle
 * `nav.visible` / relabel) were still duplicated per Site Type. This module is
 * that collapse for writes: a pure generic core over "an ordered list of
 * nav-bearing items" (a Single Site's `SingleSection[]` or a Multi Site's
 * `TemplatePage[]` — both satisfy `{ id, visible, nav }`), plus thin
 * mode-agnostic dispatchers the Editor calls regardless of Site Type.
 *
 * The Single-only pin rule (nav pinned top, footer pinned bottom) lives here
 * (`isSinglePinned`), enforced inside `moveItem`.
 */
import {
  NavMeta,
  TemplateJson,
  SingleSection,
  isSingleTemplate,
} from './template.entity';

export type MoveDirection = 'up' | 'down';

interface IdItem {
  id: string;
}
interface VisibleItem extends IdItem {
  visible: boolean;
}
interface NavItem extends IdItem {
  nav: NavMeta;
}

/**
 * Move the item one step up/down within its ordered list. Never crosses a
 * pinned item (so Single keeps nav top / footer bottom). Pure: returns a new
 * array on success, or the *same* reference (no-op) when the id is unknown, the
 * move hits a boundary, or a pin blocks it.
 */
export function moveItem<T extends IdItem>(
  items: T[],
  id: string,
  direction: MoveDirection,
  isPinned: (item: T) => boolean = () => false,
): T[] {
  const i = items.findIndex((x) => x.id === id);
  if (i < 0) return items;
  const target = direction === 'up' ? i - 1 : i + 1;
  if (target < 0 || target >= items.length) return items;
  // Never let an item cross a pin (keeps nav top / footer bottom).
  if (isPinned(items[i]) || isPinned(items[target])) return items;
  const next = items.slice();
  [next[i], next[target]] = [next[target], next[i]];
  return next;
}

/** Flip an item's `visible` (routable / on-page). Pure; no-op on unknown id. */
export function toggleVisible<T extends VisibleItem>(items: T[], id: string): T[] {
  return items.map((x) => (x.id === id ? { ...x, visible: !x.visible } : x));
}

/**
 * Flip an item's `nav.visible` (shown in the nav menu) — the axis independent
 * of `visible`. Pure; no-op on unknown id.
 */
export function toggleNavVisible<T extends NavItem>(items: T[], id: string): T[] {
  return items.map((x) =>
    x.id === id ? { ...x, nav: { ...x.nav, visible: !x.nav.visible } } : x,
  );
}

/** Set an item's `nav.label` (menu text / page name). Pure; no-op on unknown id. */
export function relabelNav<T extends NavItem>(items: T[], id: string, label: string): T[] {
  return items.map((x) => (x.id === id ? { ...x, nav: { ...x.nav, label } } : x));
}

/**
 * The Single pin rule: the nav section is pinned to the top, the footer to the
 * bottom, so neither participates in reordering. See ADR-0007 §D4 + PLAN §5.
 */
export function isSinglePinned(section: SingleSection): boolean {
  return section.type === 'nav' || section.type === 'footer';
}

// ── Mode-agnostic dispatchers ────────────────────────────────────────────────
// The Editor's single entry points: pick the nav-source array (+ pin rule) by
// `mode` and write the result back onto `json`. They mutate the passed `json`,
// which is the already-`structuredClone`d draft from the Editor's
// `updateSiteJson` — consistent with every other handler there.

export function moveNavItem(json: TemplateJson, id: string, direction: MoveDirection): void {
  if (isSingleTemplate(json)) {
    json.sections = moveItem(json.sections, id, direction, isSinglePinned);
  } else {
    json.pages = moveItem(json.pages, id, direction);
  }
}

export function toggleNavItemVisible(json: TemplateJson, id: string): void {
  if (isSingleTemplate(json)) {
    json.sections = toggleVisible(json.sections, id);
  } else {
    json.pages = toggleVisible(json.pages, id);
  }
}

export function toggleNavItemNavVisible(json: TemplateJson, id: string): void {
  if (isSingleTemplate(json)) {
    json.sections = toggleNavVisible(json.sections, id);
  } else {
    json.pages = toggleNavVisible(json.pages, id);
  }
}

export function relabelNavItem(json: TemplateJson, id: string, label: string): void {
  if (isSingleTemplate(json)) {
    json.sections = relabelNav(json.sections, id, label);
  } else {
    json.pages = relabelNav(json.pages, id, label);
  }
}
