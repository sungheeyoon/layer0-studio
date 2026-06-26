'use client';

import React, { useState, useTransition } from "react";
import { KeyRound, Loader2, LogOut } from "lucide-react";
import { changePasswordAction, deleteAccountAction } from "./actions";
import { logoutAction } from "@/app/login/actions";
import { useDashboardData } from "../DashboardDataProvider";
import { useDictionary, useLocale } from "@/lib/i18n/provider";
import { getAuthError } from "@/lib/errors/messages";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsClient() {
  const { user } = useDashboardData();
  const t = useDictionary().settings;
  const locale = useLocale();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (password !== confirmPassword) {
      setPasswordError("PASSWORDS_DO_NOT_MATCH");
      return;
    }

    if (password.length < 6) {
      setPasswordError("WEAK_PASSWORD");
      return;
    }

    startTransition(async () => {
      const result = await changePasswordAction(password);
      if ('error' in result) {
        setPasswordError(result.error);
      } else {
        setPasswordSuccess(true);
        setIsChangingPassword(false);
        setPassword("");
        setConfirmPassword("");
      }
    });
  };

  const handleLogout = async () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteAccountAction();
      if (result?.error) {
        setDeleteError(t.actions.deleteFailed);
      }
    });
  };

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "—";
  const userEmail = user?.email || "—";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <header>
        <h1 className="text-heading">{t.title}</h1>
      </header>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-title">{t.account.heading}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <span className="text-caption text-muted-foreground">{t.account.nameLabel}</span>
              <p className="text-body">{userName}</p>
            </div>
            <div className="space-y-1">
              <span className="text-caption text-muted-foreground">{t.account.emailLabel}</span>
              <p className="text-body">{userEmail}</p>
            </div>
          </div>

          <Separator />

          {!isChangingPassword ? (
            <div>
              <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
                <KeyRound className="h-4 w-4" />
                {t.account.changePassword}
              </Button>
              {passwordSuccess && (
                <p className="text-caption mt-2 text-primary">{t.account.passwordUpdated}</p>
              )}
            </div>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">{t.account.newPasswordLabel}</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t.account.confirmPasswordLabel}</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {passwordError && (
                <p className="text-caption text-destructive">
                  {t.account.errorPrefix}: {getAuthError(passwordError, locale)}
                </p>
              )}

              <div className="flex gap-3">
                <Button type="submit" disabled={isPending}>
                  {isPending ? t.account.submitting : t.account.submit}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordError(null);
                  }}
                >
                  {t.account.cancel}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Account actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-title">{t.actions.heading}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-body">{t.actions.logout}</span>
            <Button variant="outline" onClick={handleLogout} disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              {isPending ? t.actions.loggingOut : t.actions.logout}
            </Button>
          </div>

          <Separator />

          <div className="flex items-start justify-between gap-6">
            <div className="space-y-1">
              <p className="text-body font-medium text-destructive">{t.actions.delete}</p>
              <p className="text-caption max-w-md text-muted-foreground">{t.actions.warning}</p>
              {deleteError && <p className="text-caption mt-1 text-destructive">{deleteError}</p>}
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isPending}>
                  {t.actions.delete}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t.actions.confirmDelete}</AlertDialogTitle>
                  <AlertDialogDescription>{t.actions.warning}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t.actions.cancelDelete}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    {t.actions.confirmDelete}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
