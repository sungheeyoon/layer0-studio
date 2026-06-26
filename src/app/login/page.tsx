'use client';

import Link from "next/link";
import { Suspense, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { loginAction } from "./actions";
import { getAuthError } from "@/lib/errors/messages";
import { safeNextPath } from "@/lib/auth/safe-next";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDictionary, useLocale } from "@/lib/i18n/provider";

function LoginForm() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useDictionary().auth.login;
  const urlError = searchParams.get('error');
  const next = searchParams.get('next');
  const [error, setError] = useState<string | null>(
    urlError ? getAuthError(urlError.toUpperCase(), locale) : null
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await loginAction(formData);

      if ('error' in result) {
        setError(getAuthError(result.error, locale));
      } else {
        setError(null);
        router.push(safeNextPath(next));
      }
    });
  }

  return (
    <AuthShell
      title={t.title}
      subtitle={t.subtitle}
      footer={
        <>
          <Link href="/signup" className="font-medium text-foreground hover:underline">
            {t.signupLink}
          </Link>
        </>
      }
    >
      <form className="space-y-4" action={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">{t.emailLabel}</Label>
          <Input id="email" name="email" type="email" placeholder="user@example.com" required />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t.passwordLabel}</Label>
            <Link
              href="/forgot-password"
              className="text-caption text-muted-foreground hover:text-foreground"
            >
              {t.forgotLink}
            </Link>
          </div>
          <Input id="password" name="password" type="password" placeholder="••••••••" required />
        </div>

        {error && (
          <p className="text-sm text-destructive">
            {t.errorPrefix}: {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? t.submitting : t.submit}
        </Button>
      </form>

      <div className="mt-6">
        <OAuthButtons />
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
