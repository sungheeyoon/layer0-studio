'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/i18n/provider';
import { setLocaleAction } from '@/lib/i18n/actions';
import { LOCALES, type Locale } from '@/lib/i18n/locale';

/**
 * ko/en language switch. Persists the choice via a Server Action (NEXT_LOCALE
 * cookie) then calls `router.refresh()` so Server Components re-render in the
 * new locale — no URL change, no full reload.
 */
export function LocaleToggle({ className }: { className?: string }) {
  const router = useRouter();
  const active = useLocale();
  const [isPending, startTransition] = useTransition();

  function select(next: Locale) {
    if (next === active) return;
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  }

  return (
    <div className={className} role="group" aria-label="Language">
      {LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => select(locale)}
          disabled={isPending}
          aria-pressed={locale === active}
          className={`font-label text-[10px] font-medium tracking-[0.15em] uppercase transition-colors disabled:opacity-50 ${
            locale === active ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          {locale}
        </button>
      ))}
    </div>
  );
}
