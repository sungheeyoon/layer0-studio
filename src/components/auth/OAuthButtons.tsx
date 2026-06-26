'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { Provider } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { useDictionary } from '@/lib/i18n/provider';

function GoogleLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.34A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.98 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.02-2.34Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.02 2.34C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

function GitHubLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export function OAuthButtons() {
  const [loading, setLoading] = useState<Provider | null>(null);
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const t = useDictionary().auth.oauth;

  const providers: { id: Provider; label: string; logo: React.ReactNode }[] = [
    { id: 'google', label: t.continueWithGoogle, logo: <GoogleLogo /> },
    { id: 'github', label: t.continueWithGithub, logo: <GitHubLogo /> },
  ];

  async function signIn(provider: Provider) {
    setLoading(provider);
    const supabase = createClient();
    const callbackUrl = new URL('/auth/callback', window.location.origin);
    if (next) callbackUrl.searchParams.set('next', next);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: callbackUrl.toString() },
    });

    // On success the browser is redirected to the provider by the client SDK,
    // so this only runs if the request could not be initiated.
    if (error) {
      setLoading(null);
      window.location.assign('/login?error=oauth_failed');
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-caption uppercase tracking-wide text-muted-foreground">
          {t.divider}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="flex flex-col gap-3">
        {providers.map(({ id, label, logo }) => (
          <Button
            key={id}
            type="button"
            variant="outline"
            onClick={() => signIn(id)}
            disabled={loading !== null}
            className="w-full"
          >
            {loading === id ? <Loader2 className="h-4 w-4 animate-spin" /> : logo}
            <span>{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
