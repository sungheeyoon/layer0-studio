"use client";

import { UserSite } from "@/domain/entities/user-site.entity";
import Link from "next/link";
import { useState } from "react";
import { useDashboardData } from "./DashboardDataProvider";

export default function DashboardClient() {
  const { sites } = useDashboardData();
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

  return (
    <div className="max-w-[1400px] w-full">
      {/* Section 1: Site Summary */}
      <section className="mb-24">
        <header className="mb-8 flex items-baseline justify-between border-b border-zinc-300 dark:border-zinc-700 pb-2">
          <h2 className="font-['Inter'] font-light tracking-[0.1em] text-[11px] uppercase text-zinc-500">Site Summary (SYSTEM_METRICS)</h2>
        </header>

        <div className="grid grid-cols-12 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
          <div className="col-span-4 bg-white dark:bg-zinc-900/50 py-8">
            <p className="font-['Inter'] font-medium text-[10px] uppercase tracking-widest text-zinc-400 mb-4 px-12">Total Sites</p>
            <p className="text-[5rem] leading-none font-thin tracking-tighter text-zinc-900 dark:text-zinc-100 px-12">{String(totalSites).padStart(2, '0')}</p>
          </div>

          <div className="col-span-4 bg-white dark:bg-zinc-900/50 py-8 border-l border-zinc-200 dark:border-zinc-800">
            <p className="font-['Inter'] font-medium text-[10px] uppercase tracking-widest text-zinc-400 mb-4 pl-12">Active Nodes</p>
            <div className="flex items-baseline gap-4 pl-12">
              <p className="text-[5rem] leading-none font-thin tracking-tighter text-zinc-900 dark:text-zinc-100">{String(activeNodes).padStart(2, '0')}</p>
              <div className="w-1 h-1 bg-[#7d000c] mb-3"></div>
            </div>
          </div>

          <div className="col-span-4 bg-white dark:bg-zinc-900/50 py-8 border-l border-zinc-200 dark:border-zinc-800">
            <p className="font-['Inter'] font-medium text-[10px] uppercase tracking-widest text-zinc-400 mb-4 pl-12">Draft States</p>
            <p className="text-[5rem] leading-none font-thin tracking-tighter text-zinc-900 dark:text-zinc-100 pl-12">{String(draftStates).padStart(2, '0')}</p>
          </div>
        </div>
      </section>

      {/* Section 2 & 3: Highlight & Quick Actions (Asymmetric Layout) */}
      <div className="grid grid-cols-12 gap-12 mb-24 items-start">
        {/* Recent Activity Card */}
        <section className="col-span-7">
          <header className="mb-6 flex items-baseline justify-between border-b border-zinc-300 dark:border-zinc-700 pb-2">
            <h2 className="font-['Inter'] font-light tracking-[0.1em] text-[11px] uppercase text-zinc-500">Recent Activity (NODE_HIGHLIGHT)</h2>
          </header>

          <div className="bg-[#f3f3f3] dark:bg-zinc-800/50 p-10 border border-zinc-200 dark:border-zinc-700 relative group min-h-[340px]">
            <div className="absolute top-0 right-0 p-4">
              <div className="w-1 h-1 bg-zinc-300 dark:bg-zinc-600"></div>
            </div>

            <div className="flex flex-col h-full justify-between">
              {selectedSite ? (
                <>
                  <div>
                    <div className="mb-12">
                      <span className="font-['Inter'] font-medium text-[10px] tracking-[0.2em] uppercase text-zinc-400">CORE NODE</span>
                      <h3 className="text-4xl font-thin tracking-tighter text-zinc-900 dark:text-zinc-100 mt-2">{selectedSite.siteName}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-12">
                      <div>
                        <span className="block font-['Inter'] font-medium text-[9px] uppercase tracking-widest text-zinc-400 mb-1">LAST_MODIFIED</span>
                        <span className="block font-['Inter'] font-light text-xs text-zinc-900 dark:text-zinc-300">{formatDate(selectedSite.updatedAt)}</span>
                      </div>
                      <div>
                        <span className="block font-['Inter'] font-medium text-[9px] uppercase tracking-widest text-zinc-400 mb-1">STATUS</span>
                        <span className="block font-['Inter'] font-light text-xs text-zinc-900 dark:text-zinc-300">{selectedSite.status === 'active' ? 'PUBLISHED' : 'DRAFT'}</span>
                      </div>
                    </div>
                  </div>

                  <Link href={`/dashboard/editor?siteId=${selectedSite.id}`} className="w-max bg-black dark:bg-white text-white dark:text-black font-['Inter'] font-medium text-[10px] uppercase tracking-[0.15em] py-4 px-10 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all inline-block">
                    CONTINUE_EDITING
                  </Link>
                </>
              ) : (
                <div className="py-12 text-zinc-500 font-light text-sm uppercase tracking-widest">
                  No recent projects found.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="col-span-5">
          <header className="mb-6 border-b border-zinc-300 dark:border-zinc-700 pb-2">
            <h2 className="font-['Inter'] font-light tracking-[0.1em] text-[11px] uppercase text-zinc-500">Quick Actions (QUICK_EXECUTION)</h2>
          </header>

          <div className="space-y-4">
            <Link href="/dashboard/templates" className="w-full flex items-center justify-between group p-6 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 transition-colors hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white">
              <div className="flex flex-col items-start">
                <span className="font-['Inter'] font-medium text-[10px] tracking-[0.15em] uppercase text-zinc-400 group-hover:text-zinc-500 dark:group-hover:text-zinc-400">BROWSE_RESOURCES</span>
                <span className="text-lg font-thin tracking-tight mt-1">BROWSE_TEMPLATES</span>
              </div>
              <span className="material-symbols-outlined font-thin text-3xl" data-icon="dashboard_customize">dashboard_customize</span>
            </Link>
          </div>

          <div className="mt-8">
            <div className="h-[200px] w-full bg-[#f3f3f3] dark:bg-zinc-800/80 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 overflow-hidden relative group">
              <div className="absolute inset-0 opacity-20 dark:opacity-10 grid-blueprint mix-blend-overlay"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-black/5 dark:to-white/5"></div>
              <div className="z-10 flex flex-col items-center opacity-40 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-4xl mb-2 text-zinc-500">monitoring</span>
                <span className="font-['Inter'] font-medium text-[10px] tracking-widest uppercase text-zinc-500">System_Metrics_Active</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Section 4: Site Registry Summary */}
      <section>
        <header className="mb-8 flex items-baseline justify-between border-b border-zinc-300 dark:border-zinc-700 pb-2">
          <h2 className="font-['Inter'] font-light tracking-[0.1em] text-[11px] uppercase text-zinc-500">Site List (SITE_REGISTRY_SUMMARY)</h2>
          <Link href="/dashboard/projects" className="font-['Inter'] font-medium text-[10px] uppercase tracking-[0.2em] text-zinc-900 dark:text-white border-b border-zinc-900/0 hover:border-zinc-900 dark:hover:border-white transition-all py-1">
            VIEW_ALL
          </Link>
        </header>

        {/* Project Grid */}
        <div className="grid grid-cols-12 gap-y-1">
          {/* Grid Header Labels */}
          <div className="col-span-12 grid grid-cols-12 pb-4 border-b border-zinc-200 dark:border-zinc-800 px-4">
            <div className="col-span-5 text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-zinc-400">Project Identification</div>
            <div className="col-span-2 text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-zinc-400">Status</div>
            <div className="col-span-2 text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-zinc-400">Last Modification</div>
            <div className="col-span-3 text-right text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-zinc-400">Execution</div>
          </div>

          {sites.length === 0 && (
            <div className="col-span-12 py-12 text-center text-zinc-500 font-light text-sm uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800">
              No projects found. Provision a new project to begin.
            </div>
          )}

          {sites.map((site, index) => {
            const isPublished = site.status === 'active';

            return (
              <div
                key={site.id}
                className="col-span-12 grid grid-cols-12 py-6 items-center px-4 hover:bg-[#f3f3f3] dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer"
                onMouseEnter={() => setSelectedSite(site)}
              >
                <div className="col-span-5 flex items-center gap-6">
                  {/* Wireframe Thumbnail */}
                  <div className="w-32 h-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 relative overflow-hidden flex items-center justify-center grid-blueprint">
                    {index % 3 === 0 ? (
                      <div className="w-24 h-12 border border-black/10 dark:border-white/10 flex flex-col justify-between p-1">
                        <div className="h-1 bg-black/20 dark:bg-white/20 w-8"></div>
                        <div className="h-4 bg-black/5 dark:bg-white/5 w-full"></div>
                      </div>
                    ) : index % 3 === 1 ? (
                      <div className="w-20 h-14 border border-black/10 dark:border-white/10 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full border border-black/5 dark:border-white/5"></div>
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-black/5 dark:bg-white/5 rotate-45"></div>
                    )}
                    <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium tracking-widest uppercase text-black dark:text-white truncate max-w-[200px]">
                      {site.siteName}
                    </span>
                    <span className="text-[0.75rem] text-zinc-500 tracking-tight font-light truncate max-w-[200px]">
                      {site.domain || `internal.id/${site.id.substring(0, 8)}`}
                    </span>
                  </div>
                </div>
                <div className="col-span-2 flex items-center gap-3">
                  <div className={`w-1 h-1 ${isPublished ? 'bg-[#7d000c]' : 'bg-zinc-300 dark:bg-zinc-600'}`}></div>
                  <span className={`text-[0.6875rem] font-medium uppercase tracking-widest ${!isPublished && 'text-zinc-400'}`}>
                    {isPublished ? 'PUBLISHED' : 'DRAFT'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[0.75rem] font-light text-zinc-600 dark:text-zinc-400">
                    {formatDate(site.updatedAt)}
                  </span>
                </div>
                <div className="col-span-3 flex justify-end gap-2">
                  {isPublished && site.domain ? (
                    <a
                      href={`/site/${site.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-zinc-300 dark:border-zinc-700 h-8 px-4 flex items-center justify-center text-[0.625rem] font-medium uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                    >
                      View
                    </a>
                  ) : (
                    <Link
                      href={`/preview/${site.id}`}
                      target="_blank"
                      className="border border-zinc-300 dark:border-zinc-700 h-8 px-4 flex items-center justify-center text-[0.625rem] font-medium uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                    >
                      Preview
                    </Link>
                  )}
                  <Link
                    href={`/dashboard/editor?siteId=${site.id}`}
                    className="bg-black text-white dark:bg-white dark:text-black h-8 px-4 flex items-center justify-center text-[0.625rem] font-medium uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
