import { cookies, headers } from 'next/headers';
import { resolveLocale, LOCALE_COOKIE, type Locale } from './locale';

/**
 * Resolve the active locale for the current request from the NEXT_LOCALE cookie
 * and the Accept-Language header. The pure precedence logic lives in
 * `resolveLocale`; this only does the Next 16 async cookie/header plumbing.
 */
export async function getLocale(): Promise<Locale> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  return resolveLocale(
    cookieStore.get(LOCALE_COOKIE)?.value,
    headerStore.get('accept-language'),
  );
}
