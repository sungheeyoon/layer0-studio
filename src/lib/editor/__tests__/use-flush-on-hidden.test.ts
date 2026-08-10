// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, cleanup } from '@testing-library/react';
import { useFlushOnHidden } from '../use-flush-on-hidden';

// @testing-library's auto-cleanup only self-registers under `globals: true`,
// which this repo does not use.
afterEach(cleanup);

/** Drives the real event, so the test exercises the listener wiring too. */
function goHidden() {
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
  document.dispatchEvent(new Event('visibilitychange'));
}

function goVisible() {
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
  document.dispatchEvent(new Event('visibilitychange'));
}

afterEach(goVisible);

describe('useFlushOnHidden', () => {
  it('flushes when the tab is backgrounded with edits waiting', () => {
    const flush = vi.fn();
    renderHook(() => useFlushOnHidden({ hasPendingEdits: () => true, flush }));

    goHidden();

    expect(flush).toHaveBeenCalledTimes(1);
  });

  // Every tab switch would otherwise write — the guard is what makes this cost
  // nothing when there is nothing to save.
  it('sends no request when there are no pending edits', () => {
    const flush = vi.fn();
    renderHook(() => useFlushOnHidden({ hasPendingEdits: () => false, flush }));

    goHidden();

    expect(flush).not.toHaveBeenCalled();
  });

  it('ignores the transition back to visible', () => {
    const flush = vi.fn();
    renderHook(() => useFlushOnHidden({ hasPendingEdits: () => true, flush }));

    goVisible();

    expect(flush).not.toHaveBeenCalled();
  });

  // The real guard is the debounce timer, which the flush clears. Repeated
  // hidden/visible cycles must not stack saves on top of one already dispatched.
  it('does not stack saves across repeated hidden transitions', () => {
    let pending = true;
    const flush = vi.fn(() => { pending = false; });
    renderHook(() => useFlushOnHidden({ hasPendingEdits: () => pending, flush }));

    goHidden();
    goVisible();
    goHidden();
    goVisible();
    goHidden();

    expect(flush).toHaveBeenCalledTimes(1);
  });

  it('flushes again once new edits arrive', () => {
    let pending = true;
    const flush = vi.fn(() => { pending = false; });
    renderHook(() => useFlushOnHidden({ hasPendingEdits: () => pending, flush }));

    goHidden();
    goVisible();
    pending = true; // the user typed again
    goHidden();

    expect(flush).toHaveBeenCalledTimes(2);
  });

  it('stops listening once unmounted', () => {
    const flush = vi.fn();
    const { unmount } = renderHook(() =>
      useFlushOnHidden({ hasPendingEdits: () => true, flush }),
    );

    unmount();
    goHidden();

    expect(flush).not.toHaveBeenCalled();
  });

  // The listener subscribes once, so it has to reach the newest closures — a
  // stale `flush` would write content captured at mount.
  it('calls the latest callbacks after a re-render', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ flush }) => useFlushOnHidden({ hasPendingEdits: () => true, flush }),
      { initialProps: { flush: first } },
    );

    rerender({ flush: second });
    goHidden();

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
