import { describe, it, expect } from 'vitest';
import {
  nextSaveDelay,
  AUTOSAVE_IDLE_MS,
  AUTOSAVE_MAX_WAIT_MS,
} from '../autosave-schedule';

describe('nextSaveDelay', () => {
  it('is the plain idle debounce for a fresh edit', () => {
    expect(nextSaveDelay(1_000, 1_000)).toBe(AUTOSAVE_IDLE_MS);
    expect(AUTOSAVE_IDLE_MS).toBe(10_000);
  });

  it('stays the idle debounce while the deadline is further away than it', () => {
    // Oldest pending edit is 2s old: 13s of headroom left, more than the 10s idle.
    expect(nextSaveDelay(0, 2_000)).toBe(AUTOSAVE_IDLE_MS);
  });

  it('tracks the max-wait deadline once it is nearer than the idle debounce', () => {
    // 13s in — only 2s of headroom left, so a keystroke now may not buy 4 more.
    expect(nextSaveDelay(0, 13_000)).toBe(2_000);
  });

  it('fires immediately once the deadline has passed', () => {
    expect(nextSaveDelay(0, AUTOSAVE_MAX_WAIT_MS)).toBe(0);
    expect(nextSaveDelay(0, AUTOSAVE_MAX_WAIT_MS + 5_000)).toBe(0);
  });

  it('never returns a negative delay', () => {
    expect(nextSaveDelay(0, 1_000_000)).toBe(0);
  });

  // The regression this whole module exists for: under uninterrupted typing a
  // bare idle debounce reschedules forever and never saves. Simulate a keystroke
  // every 100ms and assert a save is due within the ceiling.
  it('bounds the unsaved window under continuous typing', () => {
    const pendingSince = 0;
    let firedAt: number | null = null;
    for (let now = 0; now <= 30_000; now += 100) {
      if (nextSaveDelay(pendingSince, now) === 0) {
        firedAt = now;
        break;
      }
    }
    expect(firedAt).not.toBeNull();
    expect(firedAt).toBeLessThanOrEqual(AUTOSAVE_MAX_WAIT_MS);
  });
});
