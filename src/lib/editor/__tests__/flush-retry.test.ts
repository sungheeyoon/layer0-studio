import { describe, it, expect } from 'vitest';
import {
  flushWithRetry,
  isRetryableFlushFailure,
  FLUSH_RETRY_DELAYS_MS,
  TRANSPORT_FAILURE_CODE,
  type SaveOutcome,
} from '../flush-retry';

const ok = (updatedAt = 'v2'): SaveOutcome => ({ ok: true, updatedAt });
const fail = (code: string): SaveOutcome => ({ ok: false, code });

/** Records the backoff it was asked for instead of actually waiting. */
function fakeSleep() {
  const slept: number[] = [];
  return { slept, sleep: async (ms: number) => { slept.push(ms); } };
}

/** An `attempt` that returns each scripted outcome in turn, counting calls. */
function scripted(...outcomes: SaveOutcome[]) {
  const calls: number[] = [];
  let i = 0;
  return {
    calls,
    attempt: async () => {
      calls.push(i);
      return outcomes[Math.min(i++, outcomes.length - 1)];
    },
  };
}

describe('isRetryableFlushFailure', () => {
  it('retries only the transport failure', () => {
    expect(isRetryableFlushFailure(fail(TRANSPORT_FAILURE_CODE))).toBe(true);
    expect(isRetryableFlushFailure(fail('STALE_VERSION'))).toBe(false);
    expect(isRetryableFlushFailure(fail('INVALID_TEMPLATE_JSON'))).toBe(false);
    // Allow-list, not a "anything but STALE" deny-list: an unclassified code
    // (including the server's own UNKNOWN, which means the server *did* run)
    // must default to not-retried.
    expect(isRetryableFlushFailure(fail('UNKNOWN'))).toBe(false);
    expect(isRetryableFlushFailure(ok())).toBe(false);
  });
});

describe('flushWithRetry', () => {
  it('recovers an edit when the retry lands', async () => {
    const { calls, attempt } = scripted(fail(TRANSPORT_FAILURE_CODE), ok('v2'));
    const { slept, sleep } = fakeSleep();

    await expect(flushWithRetry(attempt, { sleep })).resolves.toEqual(ok('v2'));
    expect(calls).toHaveLength(2);
    expect(slept).toEqual([FLUSH_RETRY_DELAYS_MS[0]]);
  });

  it('does not retry a save that already succeeded', async () => {
    const { calls, attempt } = scripted(ok());
    await expect(flushWithRetry(attempt, { sleep: async () => {} })).resolves.toEqual(ok());
    expect(calls).toHaveLength(1);
  });

  // ADR-0004: the other tab committed first. Re-sending our content against a
  // token we know is stale can only end in overwriting their write.
  it('never retries STALE_VERSION', async () => {
    const { calls, attempt } = scripted(fail('STALE_VERSION'), ok());
    const { slept, sleep } = fakeSleep();

    await expect(flushWithRetry(attempt, { sleep })).resolves.toEqual(fail('STALE_VERSION'));
    expect(calls).toHaveLength(1);
    expect(slept).toEqual([]);
  });

  // Deterministic rejection — the next attempt fails identically, so retrying
  // only spends time.
  it('never retries a validation failure', async () => {
    const { calls, attempt } = scripted(fail('INVALID_TEMPLATE_JSON'));
    await expect(flushWithRetry(attempt, { sleep: async () => {} }))
      .resolves.toEqual(fail('INVALID_TEMPLATE_JSON'));
    expect(calls).toHaveLength(1);
  });

  it('gives up after a bounded number of attempts', async () => {
    const { calls, attempt } = scripted(fail(TRANSPORT_FAILURE_CODE));
    const { slept, sleep } = fakeSleep();

    await expect(flushWithRetry(attempt, { sleep }))
      .resolves.toEqual(fail(TRANSPORT_FAILURE_CODE));
    expect(calls).toHaveLength(FLUSH_RETRY_DELAYS_MS.length + 1);
    expect(slept).toEqual([...FLUSH_RETRY_DELAYS_MS]);
  });

  // The retry re-enters the write queue instead of reusing one promise, so it
  // ships whatever the task reads at execution time — ADR-0015 §3.
  it('re-runs the task so a retry sees the freshest state', async () => {
    let token = 'v1';
    let firstTry = true;
    const attempt = async (): Promise<SaveOutcome> => {
      if (firstTry) {
        firstTry = false;
        token = 'v2'; // a write that landed while we were failing
        return fail(TRANSPORT_FAILURE_CODE);
      }
      return ok(token);
    };

    await expect(flushWithRetry(attempt, { sleep: async () => {} })).resolves.toEqual(ok('v2'));
  });

  it('stops retrying as soon as the failure changes kind', async () => {
    const { calls, attempt } = scripted(fail(TRANSPORT_FAILURE_CODE), fail('STALE_VERSION'), ok());
    await expect(flushWithRetry(attempt, { sleep: async () => {} }))
      .resolves.toEqual(fail('STALE_VERSION'));
    expect(calls).toHaveLength(2);
  });
});
