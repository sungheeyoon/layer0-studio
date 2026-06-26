'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { AuthShell, AuthStatus } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      <AuthStatus
        icon={<AlertTriangle className="h-6 w-6" />}
        title={t.expiredTitle}
        action={
          <Button onClick={() => router.push('/forgot-password')}>
            {t.expiredButton}
          </Button>
        }
      >
        <p>{t.expiredMessage}</p>
      </AuthStatus>
    );
  }

  return (
    <AuthShell title={t.title} subtitle={t.subtitle}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="password">{t.newPasswordLabel}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">{t.confirmLabel}</Label>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            placeholder="••••••••"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
