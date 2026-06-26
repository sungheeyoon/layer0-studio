"use client";

import { UserSite } from "@/domain/entities/user-site.entity";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, LayoutGrid } from "lucide-react";
import { useDashboardData } from "./DashboardDataProvider";
import { useDictionary } from "@/lib/i18n/provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DashboardClient() {
  const { sites } = useDashboardData();
  const t = useDictionary().dashboard;
  const [selectedSite, setSelectedSite] = useState<UserSite | null>(sites[0] || null);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } catch {
      return dateString;
    }
  };

  const activeNodes = sites.filter(site => site.status === 'active').length;
  const draftStates = sites.filter(site => site.status !== 'active').length;
  const totalSites = sites.length;

  const stats = [
    { label: t.home.totalSites, value: totalSites },
    { label: t.home.activeNodes, value: activeNodes },
    { label: t.home.draftStates, value: draftStates },
  ];

  return (
    <div className="w-full max-w-[1400px]">
      {/* Site summary */}
      <section className="mb-16">
        <h2 className="text-caption mb-4 font-medium uppercase tracking-wider text-muted-foreground">
          {t.home.siteSummary}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-6">
              <p className="text-caption text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-5xl font-semibold tracking-tight tabular-nums">
                {String(stat.value).padStart(2, '0')}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent activity + quick actions */}
      <div className="mb-16 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <h2 className="text-caption mb-4 font-medium uppercase tracking-wider text-muted-foreground">
            {t.home.recentActivity}
          </h2>
          <Card className="min-h-[300px] p-8">
            {selectedSite ? (
              <div className="flex h-full flex-col justify-between gap-10">
                <div>
                  <h3 className="text-heading">{selectedSite.siteName}</h3>
                  <div className="mt-8 grid grid-cols-2 gap-6">
                    <div>
                      <span className="text-caption block text-muted-foreground">
                        {t.home.lastModified}
                      </span>
                      <span className="text-body block">{formatDate(selectedSite.updatedAt)}</span>
                    </div>
                    <div>
                      <span className="text-caption block text-muted-foreground">
                        {t.home.status}
                      </span>
                      <span className="text-body block">
                        {selectedSite.status === 'active' ? t.common.published : t.common.draft}
                      </span>
                    </div>
                  </div>
                </div>
                <Button asChild className="w-max">
                  <Link href={`/dashboard/editor?siteId=${selectedSite.id}`}>
                    {t.home.continueEditing}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-body py-12 text-muted-foreground">{t.home.noRecent}</div>
            )}
          </Card>
        </section>

        <section className="lg:col-span-5">
          <h2 className="text-caption mb-4 font-medium uppercase tracking-wider text-muted-foreground">
            {t.home.quickActions}
          </h2>
          <Link
            href="/dashboard/templates"
            className="group flex items-center justify-between rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/40 hover:bg-accent"
          >
            <span className="text-title">{t.home.browseTemplates}</span>
            <LayoutGrid className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-foreground" />
          </Link>
        </section>
      </div>

      {/* Site registry */}
      <section>
        <header className="mb-4 flex items-baseline justify-between">
          <h2 className="text-caption font-medium uppercase tracking-wider text-muted-foreground">
            {t.home.siteList}
          </h2>
          <Link
            href="/dashboard/projects"
            className="text-caption font-medium text-foreground transition-colors hover:text-primary"
          >
            {t.home.viewAll}
          </Link>
        </header>

        <div className="overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-12 border-b border-border bg-muted/50 px-4 py-3">
            <div className="text-caption col-span-5 font-medium uppercase tracking-wider text-muted-foreground">{t.common.colProject}</div>
            <div className="text-caption col-span-2 font-medium uppercase tracking-wider text-muted-foreground">{t.common.colStatus}</div>
            <div className="text-caption col-span-2 font-medium uppercase tracking-wider text-muted-foreground">{t.common.colLastMod}</div>
            <div className="text-caption col-span-3 text-right font-medium uppercase tracking-wider text-muted-foreground">{t.common.colExecution}</div>
          </div>

          {sites.length === 0 && (
            <div className="text-body py-12 text-center text-muted-foreground">
              {t.home.noProjects}
            </div>
          )}

          {sites.map((site) => {
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
      </section>
    </div>
  );
}
