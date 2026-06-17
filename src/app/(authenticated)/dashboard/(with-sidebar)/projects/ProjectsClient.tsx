"use client";

import { UserSite } from "@/domain/entities/user-site.entity";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  updateSiteDomainAction,
  publishSiteAction,
  deleteSiteAction,
  updateSiteNameAction,
  unpublishSiteAction,
} from "@/app/(authenticated)/dashboard/editor/actions";
import { getDomainError, getSiteError } from "@/lib/errors/messages";
import { useDashboardData } from "../DashboardDataProvider";

export default function ProjectsClient() {
  const router = useRouter();
  const { sites, patchSite, removeSite } = useDashboardData();
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
      const result = await updateSiteDomainAction(settingsSite.id, editDomain, settingsSite.updatedAt);
      if ('error' in result) {
        setDomainError(getDomainError(result.error));
        if (result.error === 'STALE_VERSION') router.refresh();
      } else if (result.domain) {
        setDomainVerified(true);
        setSettingsSite({ ...settingsSite, domain: result.domain, updatedAt: result.updatedAt });
        patchSite(settingsSite.id, { domain: result.domain, updatedAt: result.updatedAt });
      }
    } catch {
      setDomainError('An unexpected error occurred.');
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

    const result = await updateSiteNameAction(settingsSite.id, editSiteName, settingsSite.updatedAt);
    if ('error' in result) {
      setSaveNameError(getSiteError(result.error, '이름 저장에 실패했습니다.'));
      if (result.error === 'STALE_VERSION') router.refresh();
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
    const result = isActive
      ? await unpublishSiteAction(settingsSite.id, settingsSite.updatedAt)
      : await publishSiteAction(settingsSite.id, settingsSite.updatedAt);

    if ('error' in result) {
      setStatusError(getSiteError(result.error, '상태 변경에 실패했습니다.'));
      if (result.error === 'STALE_VERSION') router.refresh();
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
      setDeleteError('삭제에 실패했습니다. 다시 시도해주세요.');
      setIsDeleting(false);
    } else {
      removeSite(deletedId);
      setSettingsSite(null);
      if (selectedSite?.id === deletedId) setSelectedSite(null);
      router.refresh();
    }
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } catch {
      return dateString;
    }
  };

  const currentSyncTime = formatDate(new Date().toISOString()) + " UTC";
  const isNameDirty = settingsSite && editSiteName.trim() !== settingsSite.siteName;

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="mb-12 flex justify-between items-end">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-light tracking-tight mb-4 uppercase text-black dark:text-white">Project Inventory</h2>
          <p className="text-[0.875rem] text-zinc-500 font-light max-w-md leading-relaxed">
            Active management of technical instances and architectural prototypes.
            Manage deployment states, URL mapping, and core structural configurations.
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="text-right">
            <span className="text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-zinc-400 block mb-1">Last Sync</span>
            <span className="text-[0.875rem] font-light text-black dark:text-white">{currentSyncTime}</span>
          </div>
          {/* Search */}
          <div className="relative flex items-center">
            <span className="material-symbols-outlined text-zinc-400 absolute left-3 !text-[1rem]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH_PROJECTS..."
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-8 pr-4 py-2 text-[0.6875rem] font-light uppercase tracking-widest text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-black dark:focus:border-white w-52 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-zinc-400 hover:text-black dark:hover:text-white"
              >
                <span className="material-symbols-outlined !text-[0.875rem]">close</span>
              </button>
            )}
          </div>
        </div>
      </div>

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

        {sites.length > 0 && filteredSites.length === 0 && (
          <div className="col-span-12 py-12 text-center text-zinc-500 font-light text-sm uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800">
            No projects match &ldquo;{searchQuery}&rdquo;
          </div>
        )}

        {filteredSites.map((site, index) => {
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSettingsSite(site);
                  }}
                  className="border border-zinc-300 dark:border-zinc-700 h-8 px-2 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                >
                  <span className="material-symbols-outlined !text-[1rem]">settings</span>
                </button>
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

      {/* Detail Drawer / Inset View */}
      {selectedSite && (
        <div className="mt-24 pt-12 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-12 gap-8">
          <div className="col-span-4">
            <span className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-zinc-400 block mb-6">Active_System_Metadata</span>
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <span className="text-[0.75rem] uppercase tracking-widest text-zinc-500">Core Template</span>
                <span className="text-sm font-medium uppercase tracking-tighter text-black dark:text-white">
                  {selectedSite.templateId ? `TPL_${selectedSite.templateId.substring(0, 8)}` : 'CUSTOM_BUILD'}
                </span>
              </div>
              <div className="flex justify-between items-end border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <span className="text-[0.75rem] uppercase tracking-widest text-zinc-500">Creation Date</span>
                <span className="text-sm font-medium uppercase tracking-tighter text-black dark:text-white">
                  {formatDate(selectedSite.createdAt).split(' ')[0]}
                </span>
              </div>
              <div className="flex justify-between items-end border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <span className="text-[0.75rem] uppercase tracking-widest text-zinc-500">Instance UUID</span>
                <span className="text-sm font-medium uppercase tracking-tighter text-black dark:text-white">
                  {selectedSite.id.substring(0, 12).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          <div className="col-span-8 bg-[#f3f3f3] dark:bg-zinc-900 p-8 flex flex-col justify-between grid-blueprint min-h-[300px]">
            <div>
              <span className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-zinc-400 block mb-2">Structural Preview // ACTIVE</span>
              <h3 className="text-2xl font-light uppercase tracking-tight text-black dark:text-white">{selectedSite.siteName}.sys</h3>
            </div>
            <div className="grid grid-cols-3 gap-8">
              <div className="aspect-square border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 p-4">
                <div className="h-full w-full border-t border-l border-black/10 dark:border-white/10 flex items-center justify-center">
                  <span className="text-[0.5rem] uppercase text-zinc-400">Layout_A</span>
                </div>
              </div>
              <div className="aspect-square border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 p-4">
                <div className="h-full w-full border-t border-l border-black/10 dark:border-white/10 flex items-center justify-center">
                  <span className="text-[0.5rem] uppercase text-zinc-400">Layout_B</span>
                </div>
              </div>
              <div className="aspect-square border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 p-4 flex items-center justify-center">
                <span className="material-symbols-outlined text-zinc-300 dark:text-zinc-700">add</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {settingsSite && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-[#f9f9f9] dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121212]">
              <div>
                <h2 className="text-xl font-light tracking-widest uppercase text-black dark:text-white">Project Configuration</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-1.5 bg-[#7d000c]"></span>
                  <span className="text-[0.625rem] font-medium tracking-[0.2em] text-zinc-500 uppercase">{settingsSite.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSettingsSite(null)}
                className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors w-10 h-10 flex items-center justify-center border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
              >
                <span className="material-symbols-outlined font-light">close</span>
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Settings Sidebar */}
              <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121212] p-6 space-y-1">
                <button
                  onClick={() => scrollToSection('settings-basic-info')}
                  className="w-full text-left px-4 py-3 text-[0.6875rem] font-medium uppercase tracking-widest hover:bg-[#f3f3f3] dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 transition-colors flex items-center justify-between group"
                >
                  <span>Basic Info</span>
                  <span className="material-symbols-outlined !text-[1rem] opacity-0 group-hover:opacity-50">chevron_right</span>
                </button>
                <button
                  onClick={() => scrollToSection('settings-domain')}
                  className="w-full text-left px-4 py-3 text-[0.6875rem] font-medium uppercase tracking-widest text-zinc-500 hover:bg-[#f3f3f3] dark:hover:bg-zinc-900 transition-colors flex items-center justify-between group"
                >
                  <span>Domain & URL</span>
                  <span className="material-symbols-outlined !text-[1rem] opacity-0 group-hover:opacity-50">chevron_right</span>
                </button>
                <button
                  onClick={() => scrollToSection('settings-status')}
                  className="w-full text-left px-4 py-3 text-[0.6875rem] font-medium uppercase tracking-widest text-zinc-500 hover:bg-[#f3f3f3] dark:hover:bg-zinc-900 transition-colors flex items-center justify-between group"
                >
                  <span>Status</span>
                  <span className="material-symbols-outlined !text-[1rem] opacity-0 group-hover:opacity-50">chevron_right</span>
                </button>
                <div className="pt-6 mt-6 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    onClick={() => scrollToSection('settings-danger')}
                    className="w-full text-left px-4 py-3 text-[0.6875rem] font-medium uppercase tracking-widest text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center justify-between group"
                  >
                    <span>Danger Zone</span>
                    <span className="material-symbols-outlined !text-[1rem] opacity-0 group-hover:opacity-100 text-red-600">warning</span>
                  </button>
                </div>
              </div>

              {/* Settings Form Area */}
              <div className="flex-1 overflow-y-auto p-8 grid-blueprint bg-[#f9f9f9] dark:bg-[#0a0a0a]">
                <div className="max-w-2xl space-y-12">
                  <section id="settings-basic-info">
                    <h3 className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-zinc-400 block mb-6 flex items-center gap-3">
                      <span className="material-symbols-outlined !text-[1rem]">tune</span>
                      Basic Info
                    </h3>
                    <div className="space-y-6 bg-white dark:bg-[#121212] p-6 border border-zinc-200 dark:border-zinc-800">
                      <div>
                        <label className="block text-[0.6875rem] font-medium uppercase tracking-widest text-black dark:text-white mb-3">Site Name</label>
                        <input
                          type="text"
                          value={editSiteName}
                          onChange={(e) => {
                            setEditSiteName(e.target.value);
                            setSaveNameError(null);
                            setSaveNameSuccess(false);
                          }}
                          className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm font-light text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all placeholder:text-zinc-400"
                        />
                        {saveNameError && <p className="text-[0.6875rem] text-red-500 mt-2 font-light">{saveNameError}</p>}
                        {saveNameSuccess && <p className="text-[0.6875rem] text-green-500 mt-2 font-light">이름이 저장되었습니다.</p>}
                      </div>
                    </div>
                  </section>

                  <section id="settings-domain">
                    <h3 className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-zinc-400 block mb-6 flex items-center gap-3">
                      <span className="material-symbols-outlined !text-[1rem]">router</span>
                      Domain & URL
                    </h3>
                    <div className="space-y-6 bg-white dark:bg-[#121212] p-6 border border-zinc-200 dark:border-zinc-800">
                      <div>
                        <label className="block text-[0.6875rem] font-medium uppercase tracking-widest text-black dark:text-white mb-3">Primary Domain</label>
                        <div className="flex">
                          <input
                            type="text"
                            value={editDomain}
                            onChange={(e) => {
                              setEditDomain(e.target.value);
                              setDomainVerified(false);
                              setDomainError(null);
                            }}
                            placeholder="Enter custom domain..."
                            className={`flex-1 bg-transparent border ${domainError ? 'border-red-500' : domainVerified ? 'border-green-500' : 'border-zinc-300 dark:border-zinc-700'} px-4 py-3 text-sm font-light text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all placeholder:text-zinc-400`}
                          />
                          <button
                            onClick={handleVerifyDomain}
                            disabled={isVerifying || !editDomain}
                            className="border border-l-0 border-zinc-300 dark:border-zinc-700 px-6 text-[0.6875rem] font-medium uppercase tracking-widest hover:bg-[#f3f3f3] dark:hover:bg-zinc-800 transition-colors text-black dark:text-white disabled:opacity-50"
                          >
                            {isVerifying ? 'Verifying...' : 'Verify'}
                          </button>
                        </div>
                        {domainError && <p className="text-[0.6875rem] text-red-500 mt-2 font-light tracking-wide">{domainError}</p>}
                        {domainVerified && <p className="text-[0.6875rem] text-green-500 mt-2 font-light tracking-wide">도메인이 성공적으로 설정되었습니다.</p>}
                        {!domainError && !domainVerified && (
                          <p className="text-[0.6875rem] text-zinc-500 mt-2 font-light tracking-wide">
                            Leave blank to use the default internal routing: internal.id/{settingsSite.id.substring(0, 8)}
                          </p>
                        )}
                      </div>
                    </div>
                  </section>

                  <section id="settings-status">
                    <h3 className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-zinc-400 block mb-6 flex items-center gap-3">
                      <span className="material-symbols-outlined !text-[1rem]">power_settings_new</span>
                      Execution Status
                    </h3>
                    <div className="flex items-center justify-between p-6 bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800">
                      <div>
                        <span className="block text-[0.75rem] font-medium uppercase tracking-widest text-black dark:text-white mb-1">Production State</span>
                        <span className="block text-[0.6875rem] font-light text-zinc-500">
                          Currently {settingsSite.status === 'active' ? 'published and globally accessible' : 'in local draft execution mode'}.
                        </span>
                        {statusError && <p className="text-[0.6875rem] text-red-500 mt-2 font-light">{statusError}</p>}
                      </div>
                      <button
                        onClick={handleToggleStatus}
                        disabled={isTogglingStatus}
                        className="border border-zinc-300 dark:border-zinc-700 px-6 py-3 text-[0.6875rem] font-medium uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors disabled:opacity-50"
                      >
                        {isTogglingStatus ? 'Processing...' : settingsSite.status === 'active' ? 'Suspend Instance' : 'Publish Instance'}
                      </button>
                    </div>
                  </section>

                  <section id="settings-danger">
                    <h3 className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-red-500 block mb-6 flex items-center gap-3">
                      <span className="material-symbols-outlined !text-[1rem]">warning</span>
                      Danger Zone
                    </h3>
                    <div className="flex items-center justify-between p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50">
                      <div>
                        <span className="block text-[0.75rem] font-medium uppercase tracking-widest text-red-600 dark:text-red-400 mb-1">Delete Project</span>
                        <span className="block text-[0.6875rem] font-light text-red-500/80 dark:text-red-400/80 max-w-sm">
                          Permanently remove this project and all its associated data. This action cannot be undone.
                        </span>
                        {deleteError && <p className="text-[0.6875rem] text-red-500 mt-2 font-light">{deleteError}</p>}
                      </div>
                      {showDeleteConfirm ? (
                        <div className="flex flex-col gap-2 items-end">
                          <span className="text-[0.6875rem] text-red-600 font-medium uppercase tracking-widest">확인하시겠습니까?</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowDeleteConfirm(false)}
                              className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-[0.6875rem] font-medium uppercase tracking-widest text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleDelete}
                              disabled={isDeleting}
                              className="border border-red-500 bg-red-600 text-white px-4 py-2 text-[0.6875rem] font-medium uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="border border-red-200 dark:border-red-900/50 bg-white dark:bg-black px-6 py-3 text-[0.6875rem] font-medium uppercase tracking-widest text-red-600 dark:text-red-500 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-colors"
                        >
                          Delete Site
                        </button>
                      )}
                    </div>
                  </section>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-[#121212]">
              <div className="text-[0.625rem] font-light text-zinc-400 tracking-widest uppercase hidden sm:block">
                {isNameDirty ? 'Site name changes pending' : 'No pending changes'}
              </div>
              <div className="flex gap-4 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setSettingsSite(null)}
                  className="px-6 py-3 border border-transparent text-[0.6875rem] font-medium uppercase tracking-widest hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleCommitName}
                  disabled={!isNameDirty || isSavingName}
                  className="px-8 py-3 bg-black text-white dark:bg-white dark:text-black text-[0.6875rem] font-medium uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSavingName ? 'Saving...' : 'Commit Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
