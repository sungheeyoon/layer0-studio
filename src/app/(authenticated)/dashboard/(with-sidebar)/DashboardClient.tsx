"use client";

import { UserSite } from "@/domain/entities/user-site.entity";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Clock } from "lucide-react";
import { useDashboardData } from "./DashboardDataProvider";
import { useDictionary } from "@/lib/i18n/provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SiteListTable from "@/components/dashboard/SiteListTable";

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
      {/* Site summary + resume — same row, split in half */}
      <div className="mb-16 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
        {/* Site summary — three compact stats in one panel */}
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

        {/* Resume editing — spotlight of the most recent site, or onboarding when empty */}
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

      {/* Site registry */}
      <section>
        <header className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="text-caption font-medium uppercase tracking-wider text-muted-foreground">
            {t.home.siteList}
          </h2>
          <div className="flex items-baseline gap-5">
            <Link
              href="/dashboard/templates"
              className="text-caption font-medium text-foreground transition-colors hover:text-primary"
            >
              + {t.home.newSite}
            </Link>
            <Link
              href="/dashboard/projects"
              className="text-caption font-medium text-foreground transition-colors hover:text-primary"
            >
              {t.home.viewAll}
            </Link>
          </div>
        </header>

        <SiteListTable
          sites={sites}
          onHoverSite={setSelectedSite}
          empty={
            <div className="text-body py-12 text-center text-muted-foreground">
              {t.home.noProjects}
            </div>
          }
        />
      </section>
    </div>
  );
}
