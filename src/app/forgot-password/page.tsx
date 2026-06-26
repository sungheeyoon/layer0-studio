'use client';

import Link from "next/link";
import { useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { SITE_URL } from "@/lib/seo/base-url";
import { AuthShell, AuthStatus } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDictionary } from "@/lib/i18n/provider";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dict = useDictionary();
  const t = dict.auth.forgotPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${SITE_URL}/auth/confirm?next=/update-password`,
    });

    if (resetError) {
      setError(t.requestError);
      setIsLoading(false);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <AuthStatus
        icon={<MailCheck className="h-6 w-6" />}
        title={t.sentTitle}
        action={
          <Button asChild variant="outline">
            <Link href="/login">{t.sentLoginLink}</Link>
          </Button>
        }
      >
        <p>{t.sentLine1}</p>
        <p>
          {t.sentLine2Prefix}
          <span className="font-medium text-foreground">{email}</span>
          {t.sentLine2Suffix}
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
          {t.backToLogin}
        </Link>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">{t.emailLabel}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="user@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">
            {dict.auth.common.errorPrefix}: {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLoading ? t.submitting : t.submit}
        </Button>
      </form>
    </AuthShell>
  );
}
