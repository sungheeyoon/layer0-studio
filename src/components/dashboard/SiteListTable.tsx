"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Settings as SettingsIcon } from "lucide-react";
import type { UserSite } from "@/domain/entities/user-site.entity";
import { useDictionary } from "@/lib/i18n/provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  } catch {
    return dateString;
  }
}

interface SiteListTableProps {
  sites: UserSite[];
  /** Shown when `sites` is empty (page-specific copy, e.g. "no sites" vs "no match"). */
  empty: ReactNode;
  /** Hovering a row reports it back — powers the spotlight / detail card on each page. */
  onHoverSite?: (site: UserSite) => void;
  /** When provided, each row gets a gear button that opens that site's settings. */
  onConfigure?: (site: UserSite) => void;
}

/**
 * The shared site registry table used by both the dashboard overview and the
 * projects page. Both rendered the same grid-cols-12 markup inline; this is the
 * single source so the two never drift. The only per-page difference is the
 * optional gear button (`onConfigure`) and the empty-state copy.
 */
export default function SiteListTable({ sites, empty, onHoverSite, onConfigure }: SiteListTableProps) {
  const t = useDictionary().dashboard;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Column header */}
      <div className="grid grid-cols-12 gap-4 border-b border-border bg-muted/40 px-5 py-3">
        <div className="text-caption col-span-5 font-medium uppercase tracking-wider text-muted-foreground">{t.common.colProject}</div>
        <div className="text-caption col-span-2 font-medium uppercase tracking-wider text-muted-foreground">{t.common.colStatus}</div>
        <div className="text-caption col-span-2 font-medium uppercase tracking-wider text-muted-foreground">{t.common.colLastMod}</div>
        <div className="text-caption col-span-3 text-right font-medium uppercase tracking-wider text-muted-foreground">{t.common.colExecution}</div>
      </div>

      {sites.length === 0 ? (
        empty
      ) : (
        sites.map((site) => {
          const isPublished = site.status === "active";

          return (
            <div
              key={site.id}
              className="group grid grid-cols-12 items-center gap-4 border-b border-border px-5 py-4 transition-colors last:border-b-0 hover:bg-muted/40"
              onMouseEnter={() => onHoverSite?.(site)}
            >
              {/* Project: initial avatar + name + public Site address */}
              <div className="col-span-5 flex min-w-0 items-center gap-3">
                <div className="text-caption flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted font-semibold uppercase text-muted-foreground">
                  {site.siteName.charAt(0)}
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="text-body truncate font-medium">{site.siteName}</span>
                  <span className="text-caption truncate text-muted-foreground">
                    {site.domain || t.domains.noDomainSet}
                  </span>
                </div>
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
                {onConfigure && (
                  <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label={t.projects.configuration}
                    onClick={(e) => {
                      e.stopPropagation();
                      onConfigure(site);
                    }}
                  >
                    <SettingsIcon className="h-4 w-4" />
                  </Button>
                )}
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
        })
      )}
    </div>
  );
}
