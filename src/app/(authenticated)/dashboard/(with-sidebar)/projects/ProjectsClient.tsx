"use client";

import { SiteSummary } from "@/domain/entities/user-site.entity";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { useDashboardData } from "../DashboardDataProvider";
import { useDictionary } from "@/lib/i18n/provider";
import SiteListTable from "@/components/dashboard/SiteListTable";
import SiteSettingsDialog from "./SiteSettingsDialog";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
  const [settingsSite, setSettingsSite] = useState<SiteSummary | null>(null);

  const filteredSites = searchQuery.trim()
    ? sites.filter(s =>
        s.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.domain && s.domain.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : sites;

  const activeNodes = sites.filter((site) => site.status === 'active').length;
  const draftStates = sites.filter((site) => site.status !== 'active').length;
  const stats = [
    { label: t.home.totalSites, value: sites.length },
    { label: t.home.activeNodes, value: activeNodes },
    { label: t.home.draftStates, value: draftStates },
  ];

  return (
    <div className="w-full">
      <section className="mb-12">
        <h2 className="text-caption mb-4 font-medium uppercase tracking-wider text-muted-foreground">
          {t.home.siteSummary}
        </h2>
        <Card className="justify-center p-8">
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

      {/* Header */}
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-heading">{t.projects.title}</h1>
          <p className="text-body mt-2 text-muted-foreground">
            <span className="block">{t.projects.descriptionLine1}</span>
            <span className="block lg:whitespace-nowrap">{t.projects.descriptionLine2}</span>
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
        onConfigure={setSettingsSite}
        empty={
          <div className="text-body py-12 text-center text-muted-foreground">
            {sites.length === 0
              ? t.projects.noProjects
              : <>{t.projects.noMatchPrefix}&ldquo;{searchQuery}&rdquo;</>}
          </div>
        }
      />

      {/* Settings dialog. The `Dialog` shell lives inside the component: while a
          request is in flight the dialog must refuse to close, and that guard
          belongs next to the flags that know a request is running.

          Rendering it conditionally is what clears its state — closing sets
          `settingsSite` to null, which unmounts the component and takes its
          drafts, errors and in-flight flags with it. That is the whole fix; the
          old code kept that state up here, where it outlived the dialog and had
          to be cleared by hand.

          `key` is insurance on top, for the day the dialog can be re-pointed at
          another site without closing first (a "next site" control, or a
          `forceMount`): then only the key would force the rebuild. Keyed on `id`
          and nothing else on purpose — `onPatch` below replaces the object on
          every save, and keying on identity or `updatedAt` would wipe the
          success message it just set. */}
      {settingsSite && (
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
              }}
              onClose={() => setSettingsSite(null)}
            />
      )}
    </div>
  );
}
