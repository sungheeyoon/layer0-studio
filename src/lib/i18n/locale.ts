/**
 * Locale primitives for the Studio bilingual (ko/en) i18n infra.
 *
 * `resolveLocale` is the single, pure source of truth for "which language does
 * this request render in". Keeping it free of `next/headers` (callers pass the
 * raw cookie + Accept-Language values) is what makes it unit-testable in
 * isolation — see src/lib/i18n/__tests__/locale.test.ts.
 */

export const LOCALES = ['ko', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

/** 1차 타겟이 한국 사용자이므로 감지 실패 시 한국어로 떨어진다. */
export const DEFAULT_LOCALE: Locale = 'ko';

/** Client-set, non-httpOnly so both the toggle and the server can read it. */
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/**
 * Pick the first *supported* language from an `Accept-Language` header,
 * honouring q-values. `en-US` collapses to `en`. Returns null when nothing
 * matches so the caller can fall back to the default.
 */
function parseAcceptLanguage(header: string | undefined | null): Locale | null {
  if (!header) return null;

  const ranked = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const qParam = params.find((p) => p.trim().startsWith('q='));
      const q = qParam ? Number.parseFloat(qParam.split('=')[1]) : 1;
      return {
        base: tag.trim().toLowerCase().split('-')[0],
        q: Number.isNaN(q) ? 0 : q,
      };
    })
    .filter((entry) => entry.base.length > 0)
    .sort((a, b) => b.q - a.q); // stable sort preserves source order for equal q

  for (const entry of ranked) {
    if (isLocale(entry.base)) return entry.base;
  }
  return null;
}

/**
 * Resolution precedence: NEXT_LOCALE cookie → Accept-Language → DEFAULT_LOCALE.
 * A cookie with an unsupported value is ignored (falls through to detection).
 */
export function resolveLocale(
  cookieValue: string | undefined | null,
  acceptLanguage: string | undefined | null,
): Locale {
  if (isLocale(cookieValue)) return cookieValue;
  return parseAcceptLanguage(acceptLanguage) ?? DEFAULT_LOCALE;
}
