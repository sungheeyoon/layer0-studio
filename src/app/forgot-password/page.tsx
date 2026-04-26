'use client';

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { SITE_URL } from "@/lib/seo/base-url";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${SITE_URL}/auth/confirm?next=/update-password`,
    });

    if (resetError) {
      setError('요청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setIsLoading(false);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <main className="relative min-h-screen blueprint-grid flex items-center justify-center px-8">
        <div className="text-center max-w-md">
          <div className="w-1 h-1 bg-tertiary mx-auto mb-8"></div>
          <h2 className="font-headline text-2xl font-thin tracking-tight text-primary uppercase mb-4">LINK_SENT</h2>
          <p className="font-body text-sm font-light text-outline leading-relaxed mb-2">
            비밀번호 재설정 링크가 발송되었습니다.
          </p>
          <p className="font-body text-sm font-light text-outline leading-relaxed mb-8">
            <span className="text-primary font-medium">{email}</span>의 메일함을 확인해주세요.
          </p>
          <Link
            href="/login"
            className="font-label text-[0.6rem] font-light tracking-[0.1em] text-outline hover:text-primary border-b border-transparent hover:border-primary pb-0.5 transition-colors duration-200 uppercase"
          >
            LOGIN_PAGE →
          </Link>
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
            <h1 className="font-headline text-5xl font-thin tracking-tight text-zinc-900 mb-2">RESET_KEY</h1>
            <p className="font-body text-xs font-light tracking-wider text-zinc-400">비밀번호 재설정 링크를 이메일로 발송합니다.</p>
          </div>

          <form className="space-y-12" onSubmit={handleSubmit}>
            <div className="group relative">
              <label
                className="font-label text-[10px] font-medium tracking-[0.15em] uppercase text-zinc-400 group-focus-within:text-zinc-900 transition-colors"
                htmlFor="email"
              >
                USER_EMAIL
              </label>
              <div className="relative flex items-center">
                <input
                  className="w-full h-10 bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary font-body text-sm font-light tracking-widest text-zinc-900 placeholder:text-zinc-200"
                  id="email"
                  name="email"
                  placeholder="user@example.com"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="absolute right-0 top-0 w-1 h-1 bg-tertiary opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              </div>
            </div>

            <div className="pt-8 flex flex-col gap-6">
              {error && (
                <div className="text-red-500 font-label text-[10px] tracking-widest uppercase">
                  ERROR: {error}
                </div>
              )}
              <button
                className="w-full h-12 bg-primary text-on-primary font-label text-[11px] font-medium tracking-[0.2em] uppercase active:scale-[0.98] transition-transform flex items-center justify-center gap-3 disabled:opacity-50"
                type="submit"
                disabled={isLoading}
              >
                <span>{isLoading ? 'SENDING...' : 'SEND_RESET_LINK'}</span>
                <span className="w-[4px] h-[4px] bg-tertiary-fixed"></span>
              </button>

              <Link
                className="font-label text-[9px] font-light tracking-[0.1em] uppercase text-zinc-400 hover:text-zinc-900 transition-colors border-b border-transparent hover:border-zinc-900 pb-0.5 self-start"
                href="/login"
              >
                ← BACK_TO_LOGIN
              </Link>
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
