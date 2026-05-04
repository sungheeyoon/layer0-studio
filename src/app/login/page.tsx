'use client';

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "./actions";
import { getAuthError } from "@/lib/errors/messages";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await loginAction(formData);

      if (!result.success) {
        setError(getAuthError(result.code));
      } else {
        setError(null);
        router.push('/templates');
      }
    });
  }

  return (
    <>
      {/* Main Canvas */}
      <main className="relative min-h-screen blueprint-grid flex flex-col items-center justify-center pt-12">
        {/* Background Layering: Asymmetric subtle element */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] flex items-center justify-center overflow-hidden">
          <div className="text-[30vw] md:text-[25vw] font-bold tracking-tighter text-black select-none leading-none">L0</div>
        </div>

        {/* Login Container */}
        <div className="w-full max-w-[420px] px-8 py-12 bg-surface z-10">
          {/* Branding/Identity */}
          <div className="mb-20">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1 h-1 bg-tertiary"></span>
              <span className="font-label text-[10px] font-medium tracking-[0.2em] uppercase text-zinc-500">Identity_Verification</span>
            </div>
            <h1 className="font-headline text-5xl font-thin tracking-tight text-zinc-900 mb-2">ACCESS_GATE</h1>
            <p className="font-body text-xs font-light tracking-wider text-zinc-400">LAYER0 STUDIO CENTRAL AUTHENTICATION</p>
          </div>

          {/* Login Form */}
          <form className="space-y-12" action={handleSubmit}>
            {/* Email Field */}
            <div className="group relative">
              <label
                className="font-label text-[10px] font-medium tracking-[0.15em] uppercase text-zinc-400 group-focus-within:text-zinc-900 transition-colors pl-2"
                htmlFor="email"
              >
                USER_EMAIL
              </label>
              <div className="relative flex items-center">
                <input
                  className="w-full h-10 bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary font-body text-sm font-light tracking-widest text-zinc-900 placeholder:text-zinc-200 px-2"
                  id="email"
                  name="email"
                  placeholder="user@example.com"
                  type="email"
                  required
                />
                {/* Tertiary Square Status Dot on Focus */}
                <div className="absolute right-2 top-0 w-1 h-1 bg-tertiary opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              </div>
            </div>

            {/* Password Field */}
            <div className="group relative">
              <label
                className="font-label text-[10px] font-medium tracking-[0.15em] uppercase text-zinc-400 group-focus-within:text-zinc-900 transition-colors pl-2"
                htmlFor="password"
              >
                SECURE_KEY
              </label>
              <div className="relative flex items-center">
                <input
                  className="w-full h-10 bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary font-body text-sm font-light tracking-widest text-zinc-900 placeholder:text-zinc-200 px-2"
                  id="password"
                  name="password"
                  placeholder="••••••••••••"
                  type="password"
                  required
                />
                <div className="absolute right-2 top-0 w-1 h-1 bg-tertiary opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-8 flex flex-col gap-6">
              {error && (
                <div className="text-red-500 font-label text-[10px] tracking-widest uppercase">
                  ERROR: {error}
                </div>
              )}
              <button
                className="w-full h-12 bg-primary text-on-primary font-label text-[11px] font-medium tracking-[0.2em] uppercase active:scale-[0.98] transition-transform flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <span className="w-[10px] h-[10px] border border-on-primary border-t-transparent rounded-full animate-spin"></span>
                    <span>AUTHENTICATING...</span>
                  </>
                ) : (
                  <>
                    <span>INITIATE_SESSION</span>
                    <span className="w-[4px] h-[4px] bg-tertiary-fixed"></span>
                  </>
                )}
              </button>
              
              <div className="flex justify-between items-center">
                <Link
                  className="font-label text-[9px] font-light tracking-[0.1em] uppercase text-zinc-400 hover:text-zinc-900 transition-colors border-b border-transparent hover:border-zinc-900 pb-0.5"
                  href="/forgot-password"
                >
                  FORGOT_KEY?
                </Link>
                <Link 
                  className="font-label text-[9px] font-light tracking-[0.1em] uppercase text-zinc-400 hover:text-zinc-900 transition-colors border-b border-transparent hover:border-zinc-900 pb-0.5" 
                  href="/signup"
                >
                  REQUEST_ACCESS
                </Link>
              </div>
            </div>
          </form>

          {/* Technical Metadata Footer */}
          <div className="mt-24 pt-8 border-t border-zinc-100 grid grid-cols-2 gap-4">
            <div>
              <span className="block font-label text-[8px] tracking-widest text-zinc-400 uppercase">Latency</span>
              <span className="block font-body text-[10px] font-light text-zinc-600">12.4ms [STABLE]</span>
            </div>
            <div>
              <span className="block font-label text-[8px] tracking-widest text-zinc-400 uppercase">Encryption</span>
              <span className="block font-body text-[10px] font-light text-zinc-600">AES_256_GCM</span>
            </div>
          </div>
        </div>

        {/* Decorative Blueprint Element */}
        <div className="absolute bottom-12 right-12 text-zinc-200 hidden md:block">
          <div className="font-label text-[10px] font-light tracking-[0.3em] uppercase mb-4 [writing-mode:vertical-lr]">SYSTEM_VERSION_2.4.0</div>
          <div className="w-px h-32 bg-zinc-200 mx-auto"></div>
        </div>
      </main>

      {/* Side Footer / Legal Focus Shell */}
      <footer className="fixed bottom-0 left-0 w-full px-6 py-4 flex justify-between items-end pointer-events-none">
        <div className="font-label text-[8px] tracking-widest text-zinc-300 uppercase pointer-events-auto">
          © 2024 LAYER0_STUDIO_CORP. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </>
  );
}
