'use client';

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { signupAction } from "./actions";
import { getAuthError } from "@/lib/errors/messages";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [signupEmail, setSignupEmail] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const result = await signupAction(formData);

    if ('error' in result) {
      setError(getAuthError(result.error));
    } else {
      setError(null);
      const email = formData.get('email') as string;
      setSignupEmail(email);
    }
  }

  if (signupEmail) {
    return (
      <main className="relative min-h-screen blueprint-grid flex items-center justify-center px-8">
        <div className="text-center max-w-md">
          <div className="w-1 h-1 bg-tertiary mx-auto mb-8"></div>
          <h2 className="font-headline text-2xl font-thin tracking-tight text-primary uppercase mb-4">
            ACCOUNT_CREATED
          </h2>
          <p className="font-body text-sm font-light text-outline leading-relaxed mb-2">
            가입이 완료되었습니다.
          </p>
          <p className="font-body text-sm font-light text-outline leading-relaxed mb-8">
            <span className="text-primary font-medium">{signupEmail}</span>으로 확인 메일이 발송되었습니다.
            메일함에서 링크를 클릭한 후 로그인해주세요.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-primary text-on-primary font-label text-[0.6875rem] font-medium tracking-[0.2em] px-12 h-12 uppercase hover:bg-primary-fixed transition-colors duration-200"
          >
            LOGIN_PAGE
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="relative min-h-screen blueprint-grid flex flex-col items-center justify-center pt-16 pb-12 px-8">
        <div className="grid grid-cols-12 w-full max-w-[1440px] z-10">
          {/* Left Margin Metadata (Architectural Blueprint Style) */}
          <div className="hidden lg:block col-span-2 border-r border-outline-variant/20 pt-12">
            <div className="space-y-12">
              <div className="space-y-1">
                <p className="font-label text-[0.6rem] font-medium tracking-[0.2em] text-outline uppercase">DOCUMENT_TYPE</p>
                <p className="font-body text-[0.6875rem] font-light tracking-[0.1em] text-primary uppercase">REGISTRATION_ENTRY</p>
              </div>
              <div className="space-y-1">
                <p className="font-label text-[0.6rem] font-medium tracking-[0.2em] text-outline uppercase">PROJECT_ID</p>
                <p className="font-body text-[0.6875rem] font-light tracking-[0.1em] text-primary uppercase">L0-STUDIO-2024</p>
              </div>
              <div className="space-y-1">
                <p className="font-label text-[0.6rem] font-medium tracking-[0.2em] text-outline uppercase">SCALE</p>
                <p className="font-body text-[0.6875rem] font-light tracking-[0.1em] text-primary uppercase">1:1 REAL_TIME</p>
              </div>
            </div>
          </div>

          {/* Central Registration Form */}
          <div className="col-span-12 lg:col-start-5 lg:col-span-4 py-12">
            <header className="mb-16">
              <h1 className="font-headline text-[3.5rem] font-thin leading-none tracking-tight text-primary mb-4">
                LAYER0 <br /> <span className="ml-12 italic">STUDIO</span>
              </h1>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-tertiary"></div>
                <p className="font-label text-[0.6875rem] font-medium tracking-[0.15em] text-outline uppercase">CREATE NEW WORKSPACE IDENTIFIER</p>
              </div>
            </header>

            <form className="space-y-10" action={handleSubmit}>
              {/* Field: Full Name */}
              <div className="relative group">
                <label className="block font-label text-[0.6rem] font-medium tracking-[0.15em] text-outline uppercase mb-2 group-focus-within:text-primary transition-colors pl-2" htmlFor="full_name">FULL NAME</label>
                <input
                  className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant focus:border-primary focus:ring-0 font-body text-sm font-light py-2 px-2 transition-all duration-300 placeholder:text-outline/30"
                  id="full_name"
                  name="full_name"
                  placeholder="SURNAME_FORENAME"
                  type="text"
                  required
                />
                <div className="absolute top-0 right-0 w-1 h-1 bg-tertiary opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              </div>

              {/* Field: Email Address */}
              <div className="relative group">
                <label className="block font-label text-[0.6rem] font-medium tracking-[0.15em] text-outline uppercase mb-2 group-focus-within:text-primary transition-colors pl-2" htmlFor="email">EMAIL ADDRESS</label>
                <input
                  className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant focus:border-primary focus:ring-0 font-body text-sm font-light py-2 px-2 transition-all duration-300 placeholder:text-outline/30"
                  id="email"
                  name="email"
                  placeholder="USER@LAYER0.STUDIO"
                  type="email"
                  required
                />
                <div className="absolute top-0 right-0 w-1 h-1 bg-tertiary opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              </div>

              {/* Field: Secure Password */}
              <div className="relative group">
                <label className="block font-label text-[0.6rem] font-medium tracking-[0.15em] text-outline uppercase mb-2 group-focus-within:text-primary transition-colors pl-2" htmlFor="password">SECURE PASSWORD</label>
                <input
                  className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant focus:border-primary focus:ring-0 font-body text-sm font-light py-2 px-2 transition-all duration-300 placeholder:text-outline/30"
                  id="password"
                  name="password"
                  placeholder="••••••••••"
                  type="password"
                  required
                />
                <div className="absolute top-0 right-0 w-1 h-1 bg-tertiary opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              </div>

              {/* Field: Workspace ID */}
              <div className="relative group">
                <label className="block font-label text-[0.6rem] font-medium tracking-[0.15em] text-outline uppercase mb-2 group-focus-within:text-primary transition-colors pl-2" htmlFor="workspace_id">WORKSPACE ID</label>
                <div className="relative flex items-center">
                  <input
                    className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant focus:border-primary focus:ring-0 font-body text-sm font-light py-2 px-2 transition-all duration-300 placeholder:text-outline/30"
                    id="workspace_id"
                    name="workspace_id"
                    placeholder="WORKSPACE_NAME"
                    type="text"
                    required
                  />
                  <span className="absolute right-0 bottom-2 font-label text-[0.6rem] font-medium text-outline/50 uppercase">.L0</span>
                  <div className="absolute top-0 right-0 w-1 h-1 bg-tertiary opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="pt-8 flex flex-col items-start gap-6">
                {error && (
                  <div className="text-red-500 font-label text-[10px] tracking-wide">
                    {error}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-1 h-1 bg-tertiary"></div>
                  <button 
                    className="bg-primary text-on-primary font-label text-[0.6875rem] font-medium tracking-[0.2em] px-12 h-12 uppercase hover:bg-primary-fixed transition-colors duration-200 active:scale-[0.98]" 
                    type="submit"
                  >
                    CREATE_ACCOUNT
                  </button>
                </div>
                <Link 
                  className="font-label text-[0.6rem] font-light tracking-[0.1em] text-outline hover:text-primary border-b border-transparent hover:border-primary pb-0.5 transition-colors duration-200 uppercase" 
                  href="/login"
                >
                  ALREADY_HAVE_AN_ACCOUNT? LOGIN
                </Link>
              </div>
            </form>

            {/* Social Login */}
            <div className="mt-10">
              <Suspense fallback={null}>
                <OAuthButtons />
              </Suspense>
            </div>
          </div>

          {/* Right Visual Accent */}
          <div className="hidden lg:block lg:col-start-10 lg:col-span-3 pt-24 pl-12">
            <div className="relative w-full h-[400px] border border-outline-variant/10 group overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="minimalist architectural concrete structure with sharp shadows and technical precision"
                className="w-full h-full object-cover grayscale opacity-40 group-hover:opacity-60 transition-opacity duration-700 group-hover:scale-105" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6ocqqCx1dAmaV5lwQARHk-ARiVjNs1xMnG3m_p_XlvC3k4Z4zQ3Z0z_a18vuCQCaxJUaMpRqvQQeh5hKm_MZqoSzKxXvnryAUYyav633d-E3kjtdzZpq9khP1bPhSRk1bbP7okw2bvoLWBC5qx2M_Bb0uvWR1NI9rN6MXEDoGHpEqwbh-cxc3C9mGM1TsbQBXVY6nA7uIZossNMRakD-YUf7zhUnkAW55T_fyUszXdcr7ygd5wT7LzQM1cd-JBXz7RrRSnVn4lQC-" 
              />
              <div className="absolute inset-0 bg-background/20"></div>
              {/* Blueprint Grid Overlay inside image container */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            </div>
            <div className="mt-4 space-y-1">
              <p className="font-label text-[0.6rem] font-medium tracking-[0.2em] text-outline uppercase">REFERENCE_IMG</p>
              <p className="font-body text-[0.6rem] font-light tracking-[0.05em] text-outline/60 uppercase">STRUCTURE_LVL_01.DWG</p>
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
        <div className="flex gap-4 pointer-events-auto">
          <span className="material-symbols-outlined text-[14px] text-zinc-300 hover:text-zinc-900 cursor-pointer transition-colors">terminal</span>
          <span className="material-symbols-outlined text-[14px] text-zinc-300 hover:text-zinc-900 cursor-pointer transition-colors">help_outline</span>
        </div>
      </footer>
    </>
  );
}
