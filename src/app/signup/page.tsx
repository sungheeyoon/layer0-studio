'use client';

import Link from "next/link";
import { Suspense, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { signupAction } from "./actions";
import { getAuthError } from "@/lib/errors/messages";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { AuthShell, AuthStatus } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDictionary, useLocale } from "@/lib/i18n/provider";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [signupEmail, setSignupEmail] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const locale = useLocale();
  const t = useDictionary().auth.signup;

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await signupAction(formData);

      if ('error' in result) {
        setError(getAuthError(result.error, locale));
      } else {
        setError(null);
        setSignupEmail(formData.get('email') as string);
      }
    });
  }

  if (signupEmail) {
    return (
      <AuthStatus
        icon={<CheckCircle2 className="h-6 w-6" />}
        title={t.successTitle}
        action={
          <Button onClick={() => router.push('/login')}>{t.successButton}</Button>
        }
      >
        <p>{t.successLine1}</p>
        <p>
          {t.successConfirmPrefix}
          <span className="font-medium text-foreground">{signupEmail}</span>
          {t.successConfirmSuffix}
        </p>
      </AuthStatus>
    );
  }

  return (
    <AuthShell
      title={t.title}
      subtitle={t.subtitle}
      footer={
        <Link href="/login" className="font-medium text-foreground hover:underline">
          {t.loginLink}
        </Link>
      }
    >
      <form className="space-y-4" action={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="full_name">{t.fullNameLabel}</Label>
          <Input id="full_name" name="full_name" type="text" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t.emailLabel}</Label>
          <Input id="email" name="email" type="email" placeholder="user@example.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t.passwordLabel}</Label>
          <Input id="password" name="password" type="password" placeholder="••••••••" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="workspace_id">{t.workspaceLabel}</Label>
          <Input id="workspace_id" name="workspace_id" type="text" required />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {t.submit}
        </Button>
      </form>

      <div className="mt-6">
        <Suspense fallback={null}>
          <OAuthButtons />
        </Suspense>
      </div>
    </AuthShell>
  );
}
