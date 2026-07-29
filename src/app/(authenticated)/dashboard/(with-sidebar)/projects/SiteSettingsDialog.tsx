"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { UserSite } from "@/domain/entities/user-site.entity";
import {
  updateSiteDomainAction,
  publishSiteAction,
  deleteSiteAction,
  updateSiteNameAction,
  unpublishSiteAction,
} from "@/app/(authenticated)/dashboard/editor/actions";
import { getDomainError, getSiteError, isStaleConflict } from "@/lib/errors/messages";
import { useDictionary, useLocale } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SiteSettingsDialogProps {
  /** The site being configured. Never null — the parent renders nothing when no site is selected. */
  site: UserSite;
  /**
   * The freshest `updatedAt` for optimistic concurrency. Read through the parent
   * rather than off `site`, so a retry after a STALE_VERSION refresh sends the
   * new token instead of the one captured when the dialog opened.
   */
  freshToken: (id: string, fallback: string) => string;
  /** Propagate a server-confirmed change up to the site list and the parent's copy. */
  onPatch: (id: string, partial: Partial<UserSite>) => void;
  onDeleted: (id: string) => void;
  onClose: () => void;
}

/**
 * The site settings dialog — the `Dialog` shell as well as its contents, so that
 * the rule "cannot be closed mid-request" sits next to the flags that know a
 * request is running. The parent decides only *whether* to render it.
 *
 * It owns all of its transient state too: the two form drafts, the four error
 * slots, the success flags and the delete confirmation step. That state used to
 * live in `ProjectsClient`, where it outlived the dialog and had to be cleared
 * by hand in an effect keyed on the selected site — a list that had to be kept
 * in step with every field added. It fell out of step: `isDeleting` was missing,
 * and the second delete in a session was dead on arrival.
 *
 * In-flight flags are `useTransition`, not booleans: its pending state ends when
 * the transition settles, whatever the outcome, so no exit path can leak a stuck
 * spinner. One transition per action so they stay independent, and each callback
 * keeps its own try/catch — a throw escaping a transition reaches the error
 * boundary and replaces the page, where these failures belong inline with the
 * dialog still usable.
 */
export default function SiteSettingsDialog({
  site,
  freshToken,
  onPatch,
  onDeleted,
  onClose,
}: SiteSettingsDialogProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useDictionary().dashboard;

  const [editDomain, setEditDomain] = useState(site.domain || '');
  const [domainError, setDomainError] = useState<string | null>(null);
  const [domainVerified, setDomainVerified] = useState(false);
  const [isVerifying, startVerifying] = useTransition();

  const [editSiteName, setEditSiteName] = useState(site.siteName);
  const [isSavingName, startSavingName] = useTransition();
  const [saveNameError, setSaveNameError] = useState<string | null>(null);
  const [saveNameSuccess, setSaveNameSuccess] = useState(false);

  const [isTogglingStatus, startTogglingStatus] = useTransition();
  const [statusError, setStatusError] = useState<string | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, startDeleting] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isNameDirty = editSiteName.trim() !== site.siteName;

  /**
   * While a request is in flight this dialog is the only thing that will report
   * its outcome, so it must not be dismissable. Closing unmounts it, and a
   * failure landing afterwards sets state on a dead component: the error is
   * dropped, and for a delete the user is left believing a site was removed
   * that is still there.
   *
   * Radix routes the close button, Escape and outside-click all through
   * `onOpenChange`, so guarding it covers every dismissal at once; the footer's
   * own button is disabled separately. The close button is hidden rather than
   * disabled — a visible control that ignores clicks reads as a broken dialog.
   */
  const isBusy = isVerifying || isSavingName || isTogglingStatus || isDeleting;

  const handleVerifyDomain = () => {
    setDomainError(null);
    setDomainVerified(false);

    startVerifying(async () => {
      try {
        const result = await updateSiteDomainAction(site.id, editDomain, freshToken(site.id, site.updatedAt));
        if ('error' in result) {
          setDomainError(getDomainError(result.error, locale));
          if (isStaleConflict(result)) router.refresh();
        } else if (result.domain) {
          setDomainVerified(true);
          onPatch(site.id, { domain: result.domain, updatedAt: result.updatedAt });
        }
      } catch {
        setDomainError(t.common.unexpectedError);
      }
    });
  };

  const handleCommitName = () => {
    if (!isNameDirty) return;

    setSaveNameError(null);
    setSaveNameSuccess(false);

    startSavingName(async () => {
      try {
        const result = await updateSiteNameAction(site.id, editSiteName, freshToken(site.id, site.updatedAt));
        if ('error' in result) {
          setSaveNameError(getSiteError(result.error, locale, t.projects.saveNameFailed));
          if (isStaleConflict(result)) router.refresh();
        } else {
          setSaveNameSuccess(true);
          onPatch(site.id, { siteName: editSiteName.trim(), updatedAt: result.updatedAt });
          router.refresh();
        }
      } catch {
        setSaveNameError(t.common.unexpectedError);
      }
    });
  };

  const handleToggleStatus = () => {
    setStatusError(null);

    startTogglingStatus(async () => {
      try {
        const isActive = site.status === 'active';
        const token = freshToken(site.id, site.updatedAt);
        const result = isActive
          ? await unpublishSiteAction(site.id, token)
          : await publishSiteAction(site.id, token);

        if ('error' in result) {
          setStatusError(getSiteError(result.error, locale, t.projects.statusFailed));
          if (isStaleConflict(result)) router.refresh();
        } else {
          onPatch(site.id, {
            status: (isActive ? 'draft' : 'active') as UserSite['status'],
            updatedAt: result.updatedAt,
          });
          router.refresh();
        }
      } catch {
        setStatusError(t.common.unexpectedError);
      }
    });
  };

  const handleDelete = () => {
    setDeleteError(null);

    startDeleting(async () => {
      try {
        const result = await deleteSiteAction(site.id);
        if ('error' in result) {
          setDeleteError(t.projects.deleteFailed);
        } else {
          onDeleted(site.id);
          router.refresh();
        }
      } catch {
        setDeleteError(t.projects.deleteFailed);
      }
    });
  };

  return (
    <Dialog open onOpenChange={(next) => { if (!next && !isBusy) onClose(); }}>
      <DialogContent
        className="max-h-[90vh] gap-0 overflow-y-auto sm:max-w-2xl"
        showCloseButton={!isBusy}
      >
      <DialogHeader>
        <DialogTitle>{t.projects.configuration}</DialogTitle>
        <DialogDescription>{site.siteName}</DialogDescription>
      </DialogHeader>

      <div className="mt-6 space-y-8">
        {/* Basic info */}
        <section className="space-y-3">
          <h3 className="text-title">{t.projects.basicInfo}</h3>
          <div className="space-y-2">
            <Label htmlFor="site-name">{t.projects.siteName}</Label>
            <Input
              id="site-name"
              type="text"
              value={editSiteName}
              disabled={isBusy}
              onChange={(e) => {
                setEditSiteName(e.target.value);
                setSaveNameError(null);
                setSaveNameSuccess(false);
              }}
            />
            {saveNameError && <p className="text-caption text-destructive">{saveNameError}</p>}
            {saveNameSuccess && <p className="text-caption text-primary">{t.projects.nameSaved}</p>}
          </div>
        </section>

        {/* Domain */}
        <section className="space-y-3">
          <h3 className="text-title">{t.projects.domainUrl}</h3>
          <div className="space-y-2">
            <Label htmlFor="site-domain">{t.projects.primaryDomain}</Label>
            <div className="flex gap-2">
              <Input
                id="site-domain"
                type="text"
                value={editDomain}
                disabled={isBusy}
                onChange={(e) => {
                  setEditDomain(e.target.value);
                  setDomainVerified(false);
                  setDomainError(null);
                }}
                placeholder={t.projects.domainPlaceholder}
                aria-invalid={!!domainError}
              />
              <Button
                variant="outline"
                onClick={handleVerifyDomain}
                disabled={isBusy || !editDomain}
              >
                {isVerifying && <Loader2 className="h-4 w-4 animate-spin" />}
                {isVerifying ? t.projects.verifying : t.projects.verify}
              </Button>
            </div>
            {domainError && <p className="text-caption text-destructive">{domainError}</p>}
            {domainVerified && <p className="text-caption text-primary">{t.projects.domainSet}</p>}
            {!domainError && !domainVerified && (
              <p className="text-caption text-muted-foreground">
                {t.projects.domainHintPrefix}internal.id/{site.id.substring(0, 8)}
              </p>
            )}
          </div>
        </section>

        {/* Status */}
        <section className="space-y-3">
          <h3 className="text-title">{t.projects.executionStatus}</h3>
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
            <div>
              <p className="text-body font-medium">{t.projects.productionState}</p>
              <p className="text-caption text-muted-foreground">
                {site.status === 'active' ? t.projects.statusPublishedDesc : t.projects.statusDraftDesc}
              </p>
              {statusError && <p className="text-caption mt-1 text-destructive">{statusError}</p>}
            </div>
            <Button variant="outline" onClick={handleToggleStatus} disabled={isBusy}>
              {isTogglingStatus && <Loader2 className="h-4 w-4 animate-spin" />}
              {isTogglingStatus ? t.projects.processing : site.status === 'active' ? t.projects.suspend : t.projects.publish}
            </Button>
          </div>
        </section>

        {/* Danger zone */}
        <section className="space-y-3">
          <h3 className="text-title text-destructive">{t.projects.dangerZone}</h3>
          <div className="flex items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <div>
              <p className="text-body font-medium text-destructive">{t.projects.deleteProject}</p>
              <p className="text-caption max-w-sm text-muted-foreground">{t.projects.deleteWarn}</p>
              {deleteError && <p className="text-caption mt-1 text-destructive">{deleteError}</p>}
            </div>
            {showDeleteConfirm ? (
              <div className="flex flex-col items-end gap-2">
                <span className="text-caption font-medium text-destructive">{t.projects.confirmPrompt}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)} disabled={isBusy}>
                    {t.projects.cancel}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isBusy}>
                    {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isDeleting ? t.projects.deleting : t.projects.confirmDelete}
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} disabled={isBusy}>
                {t.projects.deleteSite}
              </Button>
            )}
          </div>
        </section>
      </div>

      <DialogFooter className="mt-8">
        <Button variant="ghost" onClick={onClose} disabled={isBusy}>
          {t.projects.close}
        </Button>
        <Button onClick={handleCommitName} disabled={!isNameDirty || isBusy}>
          {isSavingName && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSavingName ? t.projects.saving : t.projects.commit}
        </Button>
      </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
