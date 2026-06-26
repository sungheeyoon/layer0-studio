"use client";

import { UserSite } from "@/domain/entities/user-site.entity";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Settings as SettingsIcon, X } from "lucide-react";
import {
  updateSiteDomainAction,
  publishSiteAction,
  deleteSiteAction,
  updateSiteNameAction,
  unpublishSiteAction,
} from "@/app/(authenticated)/dashboard/editor/actions";
import { getDomainError, getSiteError, isStaleConflict } from "@/lib/errors/messages";
import { useDashboardData } from "../DashboardDataProvider";
import { useDictionary, useLocale } from "@/lib/i18n/provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

export default function ProjectsClient() {
  const router = useRouter();
  const { sites, patchSite, removeSite } = useDashboardData();
  const locale = useLocale();
  const t = useDictionary().dashboard;

  // The optimistic-concurrency token must come from the freshest copy of the
  // site, not the snapshot captured when the settings panel opened — otherwise
  // a retry after a STALE_VERSION refresh (which updates `sites`) would send the
  // same stale token and fail again.
  const freshToken = (id: string, fallback: string) =>
    sites.find((s) => s.id === id)?.updatedAt ?? fallback;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSite, setSelectedSite] = useState<UserSite | null>(sites[0] || null);
  const [settingsSite, setSettingsSite] = useState<UserSite | null>(null);

  const filteredSites = searchQuery.trim()
    ? sites.filter(s =>
        s.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.domain && s.domain.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : sites;

  // Domain state
  const [editDomain, setEditDomain] = useState('');
  const [domainError, setDomainError] = useState<string | null>(null);
  const [domainVerified, setDomainVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Site name state
  const [editSiteName, setEditSiteName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [saveNameError, setSaveNameError] = useState<string | null>(null);
  const [saveNameSuccess, setSaveNameSuccess] = useState(false);

  // Status toggle state
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (settingsSite) {
      setEditDomain(settingsSite.domain || '');
      setEditSiteName(settingsSite.siteName);
      setDomainError(null);
      setDomainVerified(false);
      setSaveNameError(null);
      setSaveNameSuccess(false);
      setStatusError(null);
      setShowDeleteConfirm(false);
      setDeleteError(null);
    }
  }, [settingsSite]);

  const handleVerifyDomain = async () => {
    if (!settingsSite) return;
    setIsVerifying(true);
    setDomainError(null);
    setDomainVerified(false);

    try {
      const result = await updateSiteDomainAction(settingsSite.id, editDomain, freshToken(settingsSite.id, settingsSite.updatedAt));
      if ('error' in result) {
        setDomainError(getDomainError(result.error, locale));
        if (isStaleConflict(result)) router.refresh();
      } else if (result.domain) {
        setDomainVerified(true);
        setSettingsSite({ ...settingsSite, domain: result.domain, updatedAt: result.updatedAt });
        patchSite(settingsSite.id, { domain: result.domain, updatedAt: result.updatedAt });
      }
    } catch {
      setDomainError(t.common.unexpectedError);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCommitName = async () => {
    if (!settingsSite) return;
    if (editSiteName.trim() === settingsSite.siteName) return;

    setIsSavingName(true);
    setSaveNameError(null);
    setSaveNameSuccess(false);

    const result = await updateSiteNameAction(settingsSite.id, editSiteName, freshToken(settingsSite.id, settingsSite.updatedAt));
    if ('error' in result) {
      setSaveNameError(getSiteError(result.error, locale, t.projects.saveNameFailed));
      if (isStaleConflict(result)) router.refresh();
    } else {
      setSaveNameSuccess(true);
      const trimmed = editSiteName.trim();
      setSettingsSite({ ...settingsSite, siteName: trimmed, updatedAt: result.updatedAt });
      patchSite(settingsSite.id, { siteName: trimmed, updatedAt: result.updatedAt });
      router.refresh();
    }
    setIsSavingName(false);
  };

  const handleToggleStatus = async () => {
    if (!settingsSite) return;
    setIsTogglingStatus(true);
    setStatusError(null);

    const isActive = settingsSite.status === 'active';
    const token = freshToken(settingsSite.id, settingsSite.updatedAt);
    const result = isActive
      ? await unpublishSiteAction(settingsSite.id, token)
      : await publishSiteAction(settingsSite.id, token);

    if ('error' in result) {
      setStatusError(getSiteError(result.error, locale, t.projects.statusFailed));
      if (isStaleConflict(result)) router.refresh();
    } else {
      const newStatus = (isActive ? 'draft' : 'active') as UserSite['status'];
      setSettingsSite({ ...settingsSite, status: newStatus, updatedAt: result.updatedAt });
      patchSite(settingsSite.id, { status: newStatus, updatedAt: result.updatedAt });
      router.refresh();
    }
    setIsTogglingStatus(false);
  };

  const handleDelete = async () => {
    if (!settingsSite) return;
    setIsDeleting(true);
    setDeleteError(null);

    const deletedId = settingsSite.id;
    const result = await deleteSiteAction(deletedId);
    if ('error' in result) {
      setDeleteError(t.projects.deleteFailed);
      setIsDeleting(false);
    } else {
      removeSite(deletedId);
      setSettingsSite(null);
      if (selectedSite?.id === deletedId) setSelectedSite(null);
      router.refresh();
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } catch {
      return dateString;
    }
  };

  const isNameDirty = settingsSite && editSiteName.trim() !== settingsSite.siteName;

  return (
    <div className="w-full max-w-[1400px]">
      {/* Header */}
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-heading">{t.projects.title}</h1>
          <p className="text-body mt-2 max-w-md text-muted-foreground">
            {t.projects.description}
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.projects.searchPlaceholder}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Project table */}
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-12 border-b border-border bg-muted/50 px-4 py-3">
          <div className="text-caption col-span-5 font-medium uppercase tracking-wider text-muted-foreground">{t.common.colProject}</div>
          <div className="text-caption col-span-2 font-medium uppercase tracking-wider text-muted-foreground">{t.common.colStatus}</div>
          <div className="text-caption col-span-2 font-medium uppercase tracking-wider text-muted-foreground">{t.common.colLastMod}</div>
          <div className="text-caption col-span-3 text-right font-medium uppercase tracking-wider text-muted-foreground">{t.common.colExecution}</div>
        </div>

        {sites.length === 0 && (
          <div className="text-body py-12 text-center text-muted-foreground">
            {t.projects.noProjects}
          </div>
        )}

        {sites.length > 0 && filteredSites.length === 0 && (
          <div className="text-body py-12 text-center text-muted-foreground">
            {t.projects.noMatchPrefix}&ldquo;{searchQuery}&rdquo;
          </div>
        )}

        {filteredSites.map((site) => {
          const isPublished = site.status === 'active';

          return (
            <div
              key={site.id}
              className="group grid grid-cols-12 items-center border-b border-border px-4 py-4 transition-colors last:border-b-0 hover:bg-muted/50"
              onMouseEnter={() => setSelectedSite(site)}
            >
              <div className="col-span-5 flex flex-col">
                <span className="text-body truncate font-medium">{site.siteName}</span>
                <span className="text-caption truncate text-muted-foreground">
                  {site.domain || `internal.id/${site.id.substring(0, 8)}`}
                </span>
              </div>
              <div className="col-span-2">
                <Badge variant={isPublished ? "default" : "secondary"}>
                  {isPublished ? t.common.published : t.common.draft}
                </Badge>
              </div>
              <div className="col-span-2">
                <span className="text-caption text-muted-foreground">{formatDate(site.updatedAt)}</span>
              </div>
              <div className="col-span-3 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label={t.projects.configuration}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSettingsSite(site);
                  }}
                >
                  <SettingsIcon className="h-4 w-4" />
                </Button>
                {isPublished && site.domain ? (
                  <Button asChild variant="outline" size="sm">
                    <a href={`/site/${site.domain}`} target="_blank" rel="noopener noreferrer">
                      {t.common.view}
                    </a>
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/preview/${site.id}`} target="_blank">
                      {t.common.preview}
                    </Link>
                  </Button>
                )}
                <Button asChild size="sm">
                  <Link href={`/dashboard/editor?siteId=${site.id}`}>{t.common.edit}</Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail metadata */}
      {selectedSite && (
        <Card className="mt-10 p-6">
          <h2 className="text-caption mb-4 font-medium uppercase tracking-wider text-muted-foreground">
            {selectedSite.siteName}
          </h2>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <dt className="text-caption text-muted-foreground">{t.projects.coreTemplate}</dt>
              <dd className="text-body font-medium">{selectedSite.templateId ?? '—'}</dd>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-2">
              <dt className="text-caption text-muted-foreground">{t.projects.creationDate}</dt>
              <dd className="text-body font-medium">{formatDate(selectedSite.createdAt).split(' ')[0]}</dd>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-2">
              <dt className="text-caption text-muted-foreground">{t.projects.instanceUuid}</dt>
              <dd className="text-body font-medium">{selectedSite.id.substring(0, 12)}</dd>
            </div>
          </dl>
        </Card>
      )}

      {/* Settings dialog */}
      <Dialog open={!!settingsSite} onOpenChange={(open) => !open && setSettingsSite(null)}>
        <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto sm:max-w-2xl">
          {settingsSite && (
            <>
              <DialogHeader>
                <DialogTitle>{t.projects.configuration}</DialogTitle>
                <DialogDescription>{settingsSite.id}</DialogDescription>
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
                        disabled={isVerifying || !editDomain}
                      >
                        {isVerifying ? t.projects.verifying : t.projects.verify}
                      </Button>
                    </div>
                    {domainError && <p className="text-caption text-destructive">{domainError}</p>}
                    {domainVerified && <p className="text-caption text-primary">{t.projects.domainSet}</p>}
                    {!domainError && !domainVerified && (
                      <p className="text-caption text-muted-foreground">
                        {t.projects.domainHintPrefix}internal.id/{settingsSite.id.substring(0, 8)}
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
                        {settingsSite.status === 'active' ? t.projects.statusPublishedDesc : t.projects.statusDraftDesc}
                      </p>
                      {statusError && <p className="text-caption mt-1 text-destructive">{statusError}</p>}
                    </div>
                    <Button variant="outline" onClick={handleToggleStatus} disabled={isTogglingStatus}>
                      {isTogglingStatus ? t.projects.processing : settingsSite.status === 'active' ? t.projects.suspend : t.projects.publish}
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
                          <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                            {t.projects.cancel}
                          </Button>
                          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? t.projects.deleting : t.projects.confirmDelete}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                        {t.projects.deleteSite}
                      </Button>
                    )}
                  </div>
                </section>
              </div>

              <DialogFooter className="mt-8">
                <Button variant="ghost" onClick={() => setSettingsSite(null)}>
                  {t.projects.close}
                </Button>
                <Button onClick={handleCommitName} disabled={!isNameDirty || isSavingName}>
                  {isSavingName ? t.projects.saving : t.projects.commit}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
