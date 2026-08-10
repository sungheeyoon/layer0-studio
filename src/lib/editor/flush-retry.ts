/**
 * Retry policy for the unmount flush — the one write with no screen left to
 * report a failure on.
 *
 * [ADR-0015](../../../docs/adr/0015-edit-loss-paths-exhaustive-defense.md) §2
 * enumerated the three ways that flush can fail and found that only one of them
 * is worth acting on:
 *
 * | failure | why it is not retried / is retried |
 * |---|---|
 * | `STALE_VERSION` | another tab committed first. Retrying re-sends the same content against a token we know is stale, and if it ever succeeded it would overwrite that tab's write — exactly what ADR-0004 exists to prevent. **Drop it.** |
 * | validation failure | the content is rejected deterministically; the next attempt fails identically. ADR-0015 §4 already demoted every user-reachable blocking rule to a warning, so reaching here means a developer bug, not a fixable field. **Drop it.** |
 * | transport failure | the request never reached the server. The content is still valid and the token is still fresh — a second attempt can genuinely land it. **Retry.** |
 *
 * So the retry set is exactly `TRANSPORT_FAILURE_CODE`, an allow-list rather
 * than a "retry anything that isn't STALE" deny-list: a code nobody classified
 * must default to *not* retried.
 *
 * Bounded on purpose. ADR-0015 §2 refused a background write loop the user
 * cannot see, and two attempts over ~2s is not that — it finishes inside the
 * SPA navigation that triggered it, then stops.
 */

/** The result of one write attempt, normalised so callers branch on a code. */
export type SaveOutcome = { ok: true; updatedAt: string } | { ok: false; code: string };

/**
 * The code `runSave` reports when the Server Action call itself threw — the
 * request never got an answer. Distinct from the server's own `UNKNOWN`, which
 * means the server ran and failed: that one is not retryable, this one is.
 */
export const TRANSPORT_FAILURE_CODE = 'NETWORK_ERROR';

/** Backoff between flush attempts. Length = number of retries after the first try. */
export const FLUSH_RETRY_DELAYS_MS = [400, 1600] as const;

export function isRetryableFlushFailure(outcome: SaveOutcome): boolean {
  return !outcome.ok && outcome.code === TRANSPORT_FAILURE_CODE;
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Runs `attempt`, retrying only a transport failure and only `delays.length`
 * times. Returns the last outcome either way — the caller still decides what a
 * final failure means.
 *
 * `attempt` must re-enter the write queue on every call rather than reusing one
 * in-flight promise: the queue is what keeps a retry ordered against any write
 * that started meanwhile, and re-running the task is what re-reads the freshest
 * content and concurrency token (`write-queue.ts`, ADR-0015 §3).
 */
export async function flushWithRetry(
  attempt: () => Promise<SaveOutcome>,
  options: { delays?: readonly number[]; sleep?: (ms: number) => Promise<void> } = {},
): Promise<SaveOutcome> {
  const { delays = FLUSH_RETRY_DELAYS_MS, sleep = wait } = options;

  let outcome = await attempt();
  for (const delay of delays) {
    if (!isRetryableFlushFailure(outcome)) return outcome;
    await sleep(delay);
    outcome = await attempt();
  }
  return outcome;
}
