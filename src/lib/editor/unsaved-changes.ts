'use client';

import { useSyncExternalStore } from 'react';

/**
 * "Does the editor hold edits the user has not saved?" — shared between the
 * editor and the chrome above it.
 *
 * The exit link lives in `editor/layout.tsx`, a sibling of `DynamicEditor`
 * rather than an ancestor, so there is no component boundary to thread this
 * through. Context would need a provider wrapping both, which means turning the
 * layout into a client component and pulling the whole editor subtree under it.
 * A module-level store with `useSyncExternalStore` is the smaller seam, and it
 * keeps the layout a Server Component.
 *
 * Scoped by construction: the editor is a single full-viewport route, so only
 * one editor is ever mounted. The unmount effect resets the flag, which is what
 * keeps a stale `true` from following the user to the next Site.
 */
let unsavedChanges = false;
const listeners = new Set<() => void>();

export function setUnsavedChanges(next: boolean): void {
  if (unsavedChanges === next) return;
  unsavedChanges = next;
  for (const listener of listeners) listener();
}

export function getUnsavedChanges(): boolean {
  return unsavedChanges;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Server snapshot is always `false` — nothing is unsaved before hydration. */
export function useUnsavedChanges(): boolean {
  return useSyncExternalStore(subscribe, getUnsavedChanges, () => false);
}
