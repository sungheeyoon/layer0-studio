/**
 * Serialises writes to one Site so that no two of them are ever in flight at the
 * same time.
 *
 * [ADR-0004](../../../docs/adr/0004-optimistic-concurrency-via-rpc.md) serialised
 * writes *across* tabs: every save carries an `expectedUpdatedAt` and the RPC
 * rejects a stale one. It never covered writes racing *inside* one tab, and
 * those carry the same token — so whichever commits second is rejected as
 * `STALE_VERSION` and the editor reports a concurrency conflict against itself.
 * That was reachable: clicking "Save draft" while an auto-save was still in
 * flight raised the "edited elsewhere" modal for a user alone in one tab.
 *
 * Run every write — auto-save, manual save, publish, the unmount flush — through
 * a single queue. Tasks should read the content and the token at execution time,
 * not when they were enqueued, so each one ships the newest edit and a token
 * freshened by whatever ran ahead of it. See ADR-0015 §3.
 */
export type WriteQueue = <T>(task: () => Promise<T>) => Promise<T>;

export function createWriteQueue(): WriteQueue {
  let chain: Promise<unknown> = Promise.resolve();

  return function enqueue<T>(task: () => Promise<T>): Promise<T> {
    // `.then(task, task)` — run the next task whether the previous one resolved
    // or rejected. A failed write must not wedge every write after it.
    const run = chain.then(task, task);
    // The chain itself always settles clean; outcomes reach the caller through
    // `run`, so a rejection here would otherwise surface as unhandled.
    chain = run.then(() => undefined, () => undefined);
    return run;
  };
}
