import { describe, it, expect } from 'vitest';
import { createWriteQueue } from '../write-queue';

/** A task that resolves only when `release()` is called, so overlap is observable. */
function deferred<T>() {
  let release!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    release = res;
    reject = rej;
  });
  return { promise, release, reject };
}

describe('createWriteQueue', () => {
  it('never runs two tasks at the same time', async () => {
    const enqueue = createWriteQueue();
    const first = deferred<string>();
    let secondStarted = false;

    const a = enqueue(() => first.promise);
    const b = enqueue(async () => {
      secondStarted = true;
      return 'b';
    });

    // The first task is still pending, so the second must not have begun.
    await Promise.resolve();
    expect(secondStarted).toBe(false);

    first.release('a');
    await expect(a).resolves.toBe('a');
    await expect(b).resolves.toBe('b');
    expect(secondStarted).toBe(true);
  });

  it('runs tasks in enqueue order', async () => {
    const enqueue = createWriteQueue();
    const order: number[] = [];
    const task = (n: number) => () =>
      new Promise<void>((res) => {
        setTimeout(() => {
          order.push(n);
          res();
        }, 10 - n); // later tasks would finish sooner if they ran concurrently
      });

    await Promise.all([enqueue(task(1)), enqueue(task(2)), enqueue(task(3))]);
    expect(order).toEqual([1, 2, 3]);
  });

  // A failed save must not wedge every save after it — otherwise one transient
  // network error would silently end auto-saving for the rest of the session.
  it('keeps running after a task rejects', async () => {
    const enqueue = createWriteQueue();

    const failed = enqueue(async () => {
      throw new Error('boom');
    });
    await expect(failed).rejects.toThrow('boom');

    await expect(enqueue(async () => 'still works')).resolves.toBe('still works');
  });

  it('reports each task outcome to its own caller', async () => {
    const enqueue = createWriteQueue();
    const ok = enqueue(async () => 'ok');
    const bad = enqueue(async () => {
      throw new Error('only mine');
    });
    const after = enqueue(async () => 'after');

    await expect(ok).resolves.toBe('ok');
    await expect(bad).rejects.toThrow('only mine');
    await expect(after).resolves.toBe('after');
  });

  // The unmount flush enqueues while an auto-save may already be in flight. The
  // flush must observe the token that save wrote, not the one it started with.
  it('lets a queued task see state written by the task before it', async () => {
    const enqueue = createWriteQueue();
    let token = 'v1';
    const inFlight = deferred<void>();

    const save = enqueue(async () => {
      await inFlight.promise;
      token = 'v2';
    });
    const flush = enqueue(async () => token);

    inFlight.release();
    await save;
    await expect(flush).resolves.toBe('v2');
  });
});
