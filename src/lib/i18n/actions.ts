'use server';

import { cookies } from 'next/headers';
import { LOCALE_COOKIE, type Locale } from './locale';

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Persist the chosen UI language in the NEXT_LOCALE cookie. The caller pairs
 * this with `router.refresh()` so Server Components re-render in the new locale.
 */
export async function setLocaleAction(locale: Locale): Promise<void> {
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: ONE_YEAR_SECONDS,
    sameSite: 'lax',
  });
}
