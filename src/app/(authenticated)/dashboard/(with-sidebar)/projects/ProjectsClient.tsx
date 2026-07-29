"use client";

import { UserSite } from "@/domain/entities/user-site.entity";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Search, X } from "lucide-react";
import { useDashboardData } from "../DashboardDataProvider";
import { useDictionary } from "@/lib/i18n/provider";
import SiteListTable from "@/components/dashboard/SiteListTable";
import SiteSettingsDialog from "./SiteSettingsDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function ProjectsClient() {
  const { sites, patchSite, removeSite } = useDashboardData();
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } catch {
      return dateString;
    }
  };


  const activeNodes = sites.filter((site) => site.status === 'active').length;
  const draftStates = sites.filter((site) => site.status !== 'active').length;
  const stats = [
    { label: t.home.totalSites, value: sites.length },
    { label: t.home.activeNodes, value: activeNodes },
    { label: t.home.draftStates, value: draftStates },
  ];

  return (
    <div className="w-full">
      {/* Site summary + resume-editing — folded in from the former overview home */}
      <div className="mb-12 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
        <section className="flex flex-col">
          <h2 className="text-caption mb-4 font-medium uppercase tracking-wider text-muted-foreground">
            {t.home.siteSummary}
          </h2>
          <Card className="flex-1 justify-center p-8">
            <div className="grid grid-cols-3 divide-x divide-border">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center justify-center gap-1.5 px-2">
                  <span className="text-4xl font-semibold tracking-tight tabular-nums">
                    {String(stat.value).padStart(2, '0')}
                  </span>
                  <span className="text-caption text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="flex flex-col">
          <h2 className="text-caption mb-4 font-medium uppercase tracking-wider text-muted-foreground">
            {t.home.resumeWork}
          </h2>
          <Card className="flex-1 justify-between gap-5 p-6">
            {selectedSite ? (
              <>
                <div className="flex items-start gap-3">
                  <div className="text-title flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-muted font-semibold uppercase text-muted-foreground">
                    {selectedSite.siteName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-title truncate">{selectedSite.siteName}</h3>
                      <Badge variant={selectedSite.status === 'active' ? 'default' : 'secondary'}>
                        {selectedSite.status === 'active' ? t.common.published : t.common.draft}
                      </Badge>
                    </div>
                    <p className="text-caption mt-1.5 flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDate(selectedSite.updatedAt)}
                    </p>
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link href={`/dashboard/editor?siteId=${selectedSite.id}`}>
                    {t.home.continueEditing}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                <p className="text-body text-muted-foreground">{t.home.noRecent}</p>
                <Button asChild>
                  <Link href="/dashboard/templates">
                    {t.home.startFromTemplate}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </Card>
        </section>
      </div>

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
      <SiteListTable
        sites={filteredSites}
        onHoverSite={setSelectedSite}
        onConfigure={setSettingsSite}
        empty={
          <div className="text-body py-12 text-center text-muted-foreground">
            {sites.length === 0
              ? t.projects.noProjects
              : <>{t.projects.noMatchPrefix}&ldquo;{searchQuery}&rdquo;</>}
          </div>
        }
      />

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
              <dt className="text-caption text-muted-foreground">{t.projects.primaryDomain}</dt>
              <dd className="text-body truncate font-medium">
                {selectedSite.domain || <span className="text-muted-foreground">{t.domains.noDomainSet}</span>}
              </dd>
            </div>
          </dl>
        </Card>
      )}

      {/* Settings dialog */}
      <Dialog open={!!settingsSite} onOpenChange={(open) => !open && setSettingsSite(null)}>
        <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto sm:max-w-2xl">
          {settingsSite && (
            // What actually clears the dialog's state is this conditional: closing
            // sets `settingsSite` to null, which unmounts the component and takes
            // its drafts, errors and in-flight flags with it. That is the whole
            // fix — the old code kept that state in this parent, where it outlived
            // the dialog and had to be cleared by hand.
            //
            // `key` is insurance on top, for the day the dialog can be re-pointed
            // at another site without closing first (a "next site" control, or a
            // `forceMount`): then only the key would force the rebuild. Keyed on
            // `id` and nothing else on purpose — `onPatch` below replaces the
            // object on every save, and keying on identity or `updatedAt` would
            // wipe the success message it just set.
            <SiteSettingsDialog
              key={settingsSite.id}
              site={settingsSite}
              freshToken={freshToken}
              onPatch={(id, partial) => {
                patchSite(id, partial);
                setSettingsSite((current) => (current && current.id === id ? { ...current, ...partial } : current));
              }}
              onDeleted={(id) => {
                removeSite(id);
                setSettingsSite(null);
                if (selectedSite?.id === id) setSelectedSite(null);
              }}
              onClose={() => setSettingsSite(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
