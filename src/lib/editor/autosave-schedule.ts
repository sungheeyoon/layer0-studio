/**
 * When the editor's next auto-save should fire.
 *
 * Two timings, and the second one is the whole point:
 *
 * - `AUTOSAVE_IDLE_MS` — the debounce proper. A save fires this long after the
 *   user stops changing things.
 * - `AUTOSAVE_MAX_WAIT_MS` — the ceiling on how long the *oldest* edit not yet
 *   handed to a request may sit in memory.
 *
 * A bare idle debounce reschedules on every keystroke, so a user who types
 * without pausing never triggers a save at all: the unsaved window is unbounded,
 * not "at most 4 seconds". The ceiling converts that into a fixed worst case,
 * which is what lets the tab-close and crash paths stay out of scope for the
 * unmount flush. See ADR-0015 §2 and §6.
 */
export const AUTOSAVE_IDLE_MS = 4_000;
export const AUTOSAVE_MAX_WAIT_MS = 15_000;

/**
 * Delay before the next save attempt, given when the oldest pending edit arrived
 * and the current time. Clamped to `[0, AUTOSAVE_IDLE_MS]`: it is the idle
 * debounce until the max-wait deadline gets closer than that, then it tracks the
 * deadline, and it is `0` once the deadline has passed.
 */
export function nextSaveDelay(pendingSince: number, now: number): number {
  const untilDeadline = pendingSince + AUTOSAVE_MAX_WAIT_MS - now;
  return Math.max(0, Math.min(AUTOSAVE_IDLE_MS, untilDeadline));
}
