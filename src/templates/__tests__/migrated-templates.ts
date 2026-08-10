/**
 * The ADR-0016 conversion gauge, shared by the two gates that measure it.
 *
 * A Template counts as migrated only when its **schema, renderer, preset and
 * test moved together** — the pilot proved that changing three of the four
 * leaves a Template that crashes at runtime while `tsc`, `test`, `lint` and
 * `template:verify:ci` all pass.
 *
 * Two gates read this list:
 *  - `src/lib/template/__tests__/validate.test.ts` — a migrated preset must
 *    validate clean; an un-migrated one must still be *rejected*, which is what
 *    makes the red in `template:verify:ci` meaningful rather than ambient.
 *  - `src/templates/__tests__/render-smoke.test.tsx` — a migrated Template must
 *    actually render its own preset.
 *
 * When every registry key is in here, delete the file and let both gates run
 * over the whole registry (ADR-0016 §8 step 3 / issue #136).
 */
export const MIGRATED_TEMPLATE_KEYS: ReadonlySet<string> = new Set([
  'academy-default',
  'cafe-cozy',
  'cafe-default',
  'corporate-default',
]);
