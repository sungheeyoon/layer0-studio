import type { ValidationIssue } from '@/lib/template/validate';

/**
 * Turns `validateContent`'s flat issue list into a lookup the editor's inputs can
 * consult, so a warning appears under the field that caused it.
 *
 * Why the editor validates at all, given the server does: after
 * [ADR-0015](../../../docs/adr/0015-edit-loss-paths-exhaustive-defense.md) §4 the
 * rules a User can actually trigger are Warning rules — the save goes through and
 * nothing stops them. Without a signal at the field, "your colour is not a hex
 * value" would only ever show up as a slightly wrong colour on the published
 * Site. So this runs the *same function* the server runs (`validateContent` is
 * pure and imports nothing but types), and reports rather than blocks. Blocking
 * here would just move the loss it was meant to prevent into the client.
 */

/**
 * Issue codes worth putting in front of a User. Everything else `validateContent`
 * emits is authoring feedback — a Preset that names a field its component does
 * not declare, a layout value no renderer reads — and belongs in a build log, not
 * under someone's colour picker.
 */
const USER_ACTIONABLE_CODES: ReadonlySet<string> = new Set([
  'INVALID_COLOR',
  'NON_HEX_COLOR',
  'INVALID_COLOR_FIELD',
  'INVALID_FONT_SIZE',
  'INSECURE_URL',
]);

/**
 * `globalStyles.<key>` — the thin, user-editable overlay.
 */
const GLOBAL_STYLES_PATH = /^globalStyles\.([A-Za-z]+)$/;

/**
 * `…sections[id=<id>].fields.<key>` — the tail is identical for all three shapes
 * a Section path can take (`sections[…]` for Single, `pages[slug=…].sections[…]`
 * and `shared.header.sections[…]` for Multi), so matching the tail covers every
 * Site Type without knowing which one produced it.
 *
 * `[^.[]+$` deliberately fails to match a nested array-item path
 * (`….fields.menu.items[0].fields.name`): those fields render inside
 * `ArrayFieldEditor`, which has no anchor to hang a message on. No user-actionable
 * rule reaches inside array items today — Rule 11 walks only top-level Section
 * fields — so nothing is currently dropped by this.
 */
const SECTION_FIELD_PATH = /sections\[id=([^\]]+)\]\.fields\.([^.[]+)$/;

/** Lookup key for one Section's Field. */
export function fieldIssueKey(sectionId: string, fieldKey: string): string {
  return `${sectionId}::${fieldKey}`;
}

export interface IssueIndex {
  /** `globalStyles` key → issue codes. */
  globalStyles: Record<string, string[]>;
  /** {@link fieldIssueKey} → issue codes. */
  fields: Record<string, string[]>;
}

export const EMPTY_ISSUE_INDEX: IssueIndex = { globalStyles: {}, fields: {} };

/**
 * Indexes issues by the input that produced them. Carries **codes**, not
 * sentences — the caller maps a code to a localised string through the i18n
 * dictionary, keeping this module free of user-facing text.
 */
export function indexIssues(issues: readonly ValidationIssue[]): IssueIndex {
  const index: IssueIndex = { globalStyles: {}, fields: {} };

  for (const issue of issues) {
    if (!issue.path || !USER_ACTIONABLE_CODES.has(issue.code)) continue;

    const global = GLOBAL_STYLES_PATH.exec(issue.path);
    if (global) {
      (index.globalStyles[global[1]] ??= []).push(issue.code);
      continue;
    }

    const field = SECTION_FIELD_PATH.exec(issue.path);
    if (field) {
      (index.fields[fieldIssueKey(field[1], field[2])] ??= []).push(issue.code);
    }
  }

  return index;
}
