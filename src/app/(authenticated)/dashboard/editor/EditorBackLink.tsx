'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useDictionary } from '@/lib/i18n/provider';
import { useUnsavedChanges } from '@/lib/editor/unsaved-changes';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

/**
 * The editor's exit door, and the one leave path the product actually promises
 * to cover.
 *
 * The line drawn in ADR-0017: navigation the *app* initiates is the app's
 * responsibility, because the app can stop it. `onNavigate`'s `preventDefault`
 * is how App Router lets a Link do that; the browser's own Back button offers
 * no equivalent, and closing the tab only gets the generic `beforeunload`
 * prompt. Those two stay uncovered on purpose — see the ADR.
 */
export default function EditorBackLink() {
  const t = useDictionary().editor;
  const router = useRouter();
  const unsaved = useUnsavedChanges();
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.leaveGuard.title}</AlertDialogTitle>
            <AlertDialogDescription>{t.leaveGuard.body}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.leaveGuard.stay}</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/dashboard')}>
              {t.leaveGuard.leave}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Link
        href="/dashboard"
        onNavigate={(e) => {
          if (!unsaved) return;
          e.preventDefault();
          setConfirming(true);
        }}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t.backToDashboard}
      </Link>
    </>
  );
}
