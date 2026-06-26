import type { Locale } from './locale';
import { ko, type Messages } from './messages/ko';
import { en } from './messages/en';

/**
 * Server-only dictionary loader. Import this from Server Components / the root
 * layout — never from a Client Component — so both catalogs stay out of the
 * client bundle. The layout passes only the *active* locale's dictionary into
 * the client provider as a (serializable) prop.
 */
const DICTIONARIES: Record<Locale, Messages> = { ko, en };

export function getDictionary(locale: Locale): Messages {
  return DICTIONARIES[locale];
}
