import { useEffect, useRef } from 'react';

/**
 * Flushes pending edits when the page goes `hidden`.
 *
 * [ADR-0015](../../../docs/adr/0015-edit-loss-paths-exhaustive-defense.md) §2
 * put tab-close out of scope because saving during `unload` needs a save path
 * *outside* `withUser` (`sendBeacon` + a Route Handler), which ADR-0004 forbids.
 * That reasoning never applied to `visibilitychange`: the page is still alive
 * when it fires, so the request completes and the existing Server Action →
 * write queue → RPC path is used unchanged. This is the same "the page survives
 * the departure" case the unmount flush already covers.
 *
 * It matters most where the unmount flush cannot help: a mobile home-button
 * press backgrounds the tab without unmounting anything, and a backgrounded tab
 * has its `setTimeout` throttled — so `AUTOSAVE_MAX_WAIT_MS` stops being a real
 * ceiling exactly when the OS may reclaim the tab.
 *
 * `hasPendingEdits` is the guard, not an optimisation: without it every tab
 * switch would write. The live debounce timer is the signal the unmount flush
 * already uses — "edits exist that no request has picked up yet" — and it is
 * also what keeps repeated hidden/visible transitions from stacking saves, as
 * the first flush clears it.
 *
 * **This raises the odds, it does not zero the loss.** Closing a desktop tab
 * fires `hidden` too, but the page dies right after and an in-flight request is
 * not guaranteed to finish. The `beforeunload` warning stays.
 */
export function useFlushOnHidden({
  hasPendingEdits,
  flush,
}: {
  hasPendingEdits: () => boolean;
  flush: () => void;
}): void {
  // Read both through refs so the listener registers once and still calls the
  // newest closures — re-subscribing on every render would drop and re-add the
  // listener between a hidden transition and its handler.
  const hasPendingEditsRef = useRef(hasPendingEdits);
  const flushRef = useRef(flush);
  useEffect(() => { hasPendingEditsRef.current = hasPendingEdits; }, [hasPendingEdits]);
  useEffect(() => { flushRef.current = flush; }, [flush]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState !== 'hidden') return;
      if (!hasPendingEditsRef.current()) return;
      flushRef.current();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);
}
