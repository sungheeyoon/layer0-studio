'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useDictionary } from "@/lib/i18n/provider";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const router = useRouter();
  const dict = useDictionary();
  const t = dict.auth.updatePassword;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError(t.weakPassword);
      return;
    }
    if (password !== confirm) {
      setError(t.mismatch);
      return;
    }

    setIsLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(t.updateFailed);
      setIsLoading(false);
    } else {
      await supabase.auth.signOut();
      router.push('/login');
    }
  }

  if (hasSession === false) {
    return (
      <main className="relative min-h-screen blueprint-grid flex items-center justify-center px-8">
        <div className="text-center max-w-md">
          <div className="w-1 h-1 bg-tertiary mx-auto mb-8"></div>
          <h2 className="font-headline text-2xl font-thin tracking-tight text-primary uppercase mb-4">LINK_EXPIRED</h2>
          <p className="font-body text-sm font-light text-outline leading-relaxed mb-8">
            {t.expiredMessage}
          </p>
          <button
            onClick={() => router.push('/forgot-password')}
            className="bg-primary text-on-primary font-label text-[0.6875rem] font-medium tracking-[0.2em] px-12 h-12 uppercase hover:bg-primary-fixed transition-colors duration-200"
          >
            {t.expiredButton}
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="relative min-h-screen blueprint-grid flex flex-col items-center justify-center pt-12">
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] flex items-center justify-center overflow-hidden">
          <div className="text-[30vw] md:text-[25vw] font-bold tracking-tighter text-black select-none leading-none">L0</div>
        </div>

        <div className="w-full max-w-[420px] px-8 py-12 bg-surface z-10">
          <div className="mb-20">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1 h-1 bg-tertiary"></span>
              <span className="font-label text-[10px] font-medium tracking-[0.2em] uppercase text-zinc-500">Password_Recovery</span>
            </div>
            <h1 className="font-headline text-5xl font-thin tracking-tight text-zinc-900 mb-2">NEW_KEY</h1>
            <p className="font-body text-xs font-light tracking-wider text-zinc-400">{t.subtitle}</p>
          </div>

          <form className="space-y-12" onSubmit={handleSubmit}>
            <div className="group relative">
              <label
                className="font-label text-[10px] font-medium tracking-[0.15em] uppercase text-zinc-400 group-focus-within:text-zinc-900 transition-colors pl-2"
                htmlFor="password"
              >
                {t.newPasswordLabel}
              </label>
              <div className="relative flex items-center">
                <input
                  className="w-full h-10 bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary font-body text-sm font-light tracking-widest text-zinc-900 placeholder:text-zinc-200 px-2"
                  id="password"
                  name="password"
                  placeholder="••••••••••••"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="absolute right-2 top-0 w-1 h-1 bg-tertiary opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              </div>
            </div>

            <div className="group relative">
              <label
                className="font-label text-[10px] font-medium tracking-[0.15em] uppercase text-zinc-400 group-focus-within:text-zinc-900 transition-colors pl-2"
                htmlFor="confirm"
              >
                {t.confirmLabel}
              </label>
              <div className="relative flex items-center">
                <input
                  className="w-full h-10 bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary font-body text-sm font-light tracking-widest text-zinc-900 placeholder:text-zinc-200 px-2"
                  id="confirm"
                  name="confirm"
                  placeholder="••••••••••••"
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                <div className="absolute right-2 top-0 w-1 h-1 bg-tertiary opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              </div>
            </div>

            <div className="pt-8 flex flex-col gap-6">
              {error && (
                <div className="text-red-500 font-label text-[10px] tracking-widest uppercase">
                  {dict.auth.common.errorPrefix}: {error}
                </div>
              )}
              <button
                className="w-full h-12 bg-primary text-on-primary font-label text-[11px] font-medium tracking-[0.2em] uppercase active:scale-[0.98] transition-transform flex items-center justify-center gap-3 disabled:opacity-50"
                type="submit"
                disabled={isLoading}
              >
                <span>{isLoading ? t.submitting : t.submit}</span>
                <span className="w-[4px] h-[4px] bg-tertiary-fixed"></span>
              </button>
            </div>
          </form>

          <div className="mt-24 pt-8 border-t border-zinc-100 grid grid-cols-2 gap-4">
            <div>
              <span className="block font-label text-[8px] tracking-widest text-zinc-400 uppercase">Security</span>
              <span className="block font-body text-[10px] font-light text-zinc-600">RESET_FLOW_2.0</span>
            </div>
            <div>
              <span className="block font-label text-[8px] tracking-widest text-zinc-400 uppercase">Encryption</span>
              <span className="block font-body text-[10px] font-light text-zinc-600">AES_256_GCM</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 right-12 text-zinc-200 hidden md:block">
          <div className="font-label text-[10px] font-light tracking-[0.3em] uppercase mb-4 [writing-mode:vertical-lr]">SYSTEM_VERSION_2.4.0</div>
          <div className="w-px h-32 bg-zinc-200 mx-auto"></div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full px-6 py-4 flex justify-between items-end pointer-events-none">
        <div className="font-label text-[8px] tracking-widest text-zinc-300 uppercase pointer-events-auto">
          © 2024 LAYER0_STUDIO_CORP. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </>
  );
}
