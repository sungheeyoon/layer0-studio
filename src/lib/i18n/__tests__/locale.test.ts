import { describe, expect, it } from 'vitest';
import { resolveLocale } from '../locale';

describe('resolveLocale', () => {
  it('prefers a valid NEXT_LOCALE cookie over everything else', () => {
    expect(resolveLocale('en', 'ko-KR,ko;q=0.9')).toBe('en');
    expect(resolveLocale('ko', 'en-US,en;q=0.9')).toBe('ko');
  });

  it('ignores an unsupported cookie value and falls through to detection', () => {
    expect(resolveLocale('fr', 'en-US,en;q=0.9')).toBe('en');
    expect(resolveLocale('', 'en')).toBe('en');
  });

  it('detects locale from Accept-Language when no cookie is set', () => {
    expect(resolveLocale(undefined, 'en-US,en;q=0.9')).toBe('en');
    expect(resolveLocale(null, 'ko-KR')).toBe('ko');
  });

  it('honours q-values, picking the highest-ranked supported language', () => {
    expect(resolveLocale(undefined, 'fr;q=1.0,en;q=0.5')).toBe('en');
    expect(resolveLocale(undefined, 'en;q=0.3,ko;q=0.8')).toBe('ko');
  });

  it('skips unsupported languages to the first supported one', () => {
    expect(resolveLocale(undefined, 'fr-FR,de;q=0.9,en;q=0.4')).toBe('en');
  });

  it('falls back to ko (1차 타겟) when nothing matches', () => {
    expect(resolveLocale(undefined, 'fr-FR,de;q=0.9')).toBe('ko');
    expect(resolveLocale(undefined, undefined)).toBe('ko');
    expect(resolveLocale(null, null)).toBe('ko');
    expect(resolveLocale(undefined, '')).toBe('ko');
  });
});
