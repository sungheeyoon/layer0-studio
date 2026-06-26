'use client';

import { createContext, useContext } from 'react';
import type { Locale } from './locale';
import type { Messages } from './messages/ko';

type I18nValue = {
  locale: Locale;
  dictionary: Messages;
};

const I18nContext = createContext<I18nValue | null>(null);

/**
 * Wraps the app once (in the root layout) with the *active* locale's dictionary.
 * The server selects ko or en and passes only that one in — the client bundle
 * never carries both catalogs.
 */
export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Messages;
  children: React.ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ locale, dictionary }}>
      {children}
    </I18nContext.Provider>
  );
}

function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error('useI18n must be used within <I18nProvider>');
  }
  return value;
}

/** Typed dictionary for direct object access, e.g. `useDictionary().auth.login.submit`. */
export const useDictionary = (): Messages => useI18n().dictionary;

/** Active locale — for passing into locale-aware helpers like `getAuthError`. */
export const useLocale = (): Locale => useI18n().locale;
