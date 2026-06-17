'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { UserSite } from '@/domain/entities/user-site.entity';
import {
  TemplateJson,
  TemplateGlobalStyles,
  TemplateField,
  TemplateSection,
  ArrayTemplateField,
  isSingleTemplate,
  isMultiTemplate,
  allSections,
} from '@/domain/entities/template.entity';
import {
  MoveDirection,
  isSinglePinned,
  moveNavItem,
  toggleNavItemVisible,
  toggleNavItemNavVisible,
  relabelNavItem,
} from '@/domain/entities/ordered-nav-list';
import { saveSiteJsonAction, publishSiteAction, initUploadAction, confirmUploadAction } from '@/app/(authenticated)/dashboard/editor/actions';
import GlobalStylesEditor from './GlobalStylesEditor';
import { loadTemplate } from '@/templates/registry';
import { SectionDataSchema, TemplateModule } from '@/templates/types';
import { createClient } from '@/utils/supabase/client';
import { getSiteError, isStaleConflict } from '@/lib/errors/messages';
import { injectKeys, stripKeys } from '@/lib/template/keys';

interface DynamicEditorProps {
  site: UserSite;
}

export default function DynamicEditor({ site }: DynamicEditorProps) {
  const [siteJson, setSiteJson] = useState<TemplateJson>(() => injectKeys(site.siteJson));
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');

  const isMulti = isMultiTemplate(siteJson);

  // Multi sites edit one page at a time (page tabs switch the context). The
  // active page also drives the live preview (`activePageId` → renderer).
  const [activePageId, setActivePageId] = useState<string | undefined>(() =>
    isMultiTemplate(site.siteJson) ? site.siteJson.pages[0]?.id : undefined,
  );

  // Single sites carry their sections directly (one continuous scroll); they
  // own the rich per-section nav controls (#41).
  const singleSections = useMemo(
    () => (isSingleTemplate(siteJson) ? siteJson.sections : []),
    [siteJson],
  );

  // Multi page-management source: array order = nav order.
  const pages = useMemo(
    () => (isMultiTemplate(siteJson) ? siteJson.pages : []),
    [siteJson],
  );
  const activePage = useMemo(
    () => pages.find((p) => p.id === activePageId) ?? pages[0],
    [pages, activePageId],
  );

  // The sections shown in the Hierarchy / Parameters panel: Single → its
  // sections; Multi → shared header + the active page's sections + shared footer
  // (so the brand, page body and footer of the previewed page are all editable).
  const sections = useMemo<TemplateSection[]>(() => {
    if (isSingleTemplate(siteJson)) return siteJson.sections;
    if (isMultiTemplate(siteJson) && activePage) {
      return [...siteJson.shared.header, ...activePage.sections, ...siteJson.shared.footer];
    }
    return [];
  }, [siteJson, activePage]);

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    sections[0]?.id ?? null
  );

  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const lastSaveRef = useRef<number>(0);

  const [isDirty, setIsDirty] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [conflictDetected, setConflictDetected] = useState(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const siteJsonRef = useRef(siteJson);
  const knownUpdatedAtRef = useRef<string>(site.updatedAt);

  useEffect(() => { siteJsonRef.current = siteJson; }, [siteJson]);

  useEffect(() => () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); }, []);

  useEffect(() => {
    if (autoSaveStatus !== 'saved') return;
    const t = setTimeout(() => setAutoSaveStatus('idle'), 3000);
    return () => clearTimeout(t);
  }, [autoSaveStatus]);

  useEffect(() => {
    const guard = (e: BeforeUnloadEvent) => { if (isDirty) e.preventDefault(); };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [isDirty]);

  const applySuccessfulSave = useCallback((updatedAt: string) => {
    knownUpdatedAtRef.current = updatedAt;
    setIsDirty(false);
    setAutoSaveStatus('saved');
    lastSaveRef.current = Date.now();
  }, []);

  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    setIsDirty(true);
    setAutoSaveStatus('idle');
    autoSaveTimerRef.current = setTimeout(async () => {
      setAutoSaveStatus('saving');
      const result = await saveSiteJsonAction(site.id, stripKeys(siteJsonRef.current), knownUpdatedAtRef.current);
      if (result && 'error' in result) {
        if (isStaleConflict(result)) {
          setConflictDetected(true);
        } else {
          setAutoSaveStatus('error');
          if (result.error === 'INVALID_TEMPLATE_JSON') {
            setActionError(getSiteError(result.error, '저장에 실패했습니다.'));
          }
        }
      } else if (result && 'updatedAt' in result) {
        applySuccessfulSave(result.updatedAt);
      }
    }, 4000);
  }, [site.id, applySuccessfulSave]);

  const [templateModule, setTemplateModule] = useState<TemplateModule | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let loaded = false;
    const fetchTheme = async () => {
      setLoadingError(null);
      setTemplateModule(null);

      const timeoutId = setTimeout(() => {
        if (mounted && !loaded) {
          setLoadingError('Theme loading timed out. Please check your connection or theme configuration.');
        }
      }, 10000);

      try {
        const mod = await loadTemplate(siteJson.templateKey || 'corporate-default');
        clearTimeout(timeoutId);
        if (mounted) {
          if (mod) {
            loaded = true;
            setTemplateModule(mod);
          } else {
            setLoadingError(`Theme "${siteJson.templateKey}" not found.`);
          }
        }
      } catch (err) {
        clearTimeout(timeoutId);
        if (mounted) {
          setLoadingError('Failed to load theme renderer.');
          console.error('Theme load error:', err);
        }
      }
    };
    fetchTheme();
    return () => { mounted = false; };
  }, [siteJson.templateKey]);

  const TemplateRenderer = templateModule?.default;

  const selectedSection = sections.find((s) => s.id === selectedSectionId) ?? null;

  const updateSiteJson = useCallback((updater: (json: TemplateJson) => void) => {
    setSiteJson((prev) => {
      const updated = structuredClone(prev);
      updater(updated);
      return updated;
    });
    scheduleAutoSave();
  }, [scheduleAutoSave]);

  const handleFieldChange = useCallback(
    (sectionId: string, fieldKey: string, value: string | ArrayTemplateField['items'], assetId?: string) => {
      updateSiteJson((json) => {
        const section = allSections(json).find(s => s.id === sectionId);
        if (section && section.data[fieldKey]) {
          const field = section.data[fieldKey];
          if (field.type === 'array' && Array.isArray(value)) {
            field.items = value;
          } else if (field.type !== 'array' && typeof value === 'string') {
            field.value = value;
            if (assetId !== undefined && field.type === 'image') {
              field.assetId = assetId;
            }
          }
        }
      });
    },
    [updateSiteJson]
  );

  const handleGlobalStyleChange = useCallback(
    (key: keyof TemplateGlobalStyles, value: string) => {
      updateSiteJson((json) => {
        json.globalStyles[key] = value;
      });
    },
    [updateSiteJson]
  );

  // ── Nav-list edits (reorder / 2-axis visibility / nav label) ──────────────
  // The write-side mirror of `deriveNav`: one set of handlers for both Site
  // Types, delegating to the mode-agnostic `ordered-nav-list` module (Single
  // operates on `sections` with the nav/footer pin rule, Multi on `pages`).
  // See ADR-0007 §D4 + PLAN §5.

  // Reorderable band = the contiguous middle (Single pins live at the extremes).
  const [firstReorderable, lastReorderable] = useMemo(() => {
    let first = -1;
    let last = -1;
    singleSections.forEach((s, i) => {
      if (isSinglePinned(s)) return;
      if (first === -1) first = i;
      last = i;
    });
    return [first, last] as const;
  }, [singleSections]);

  const handleMoveNavItem = useCallback(
    (id: string, direction: MoveDirection) => {
      updateSiteJson((json) => moveNavItem(json, id, direction));
    },
    [updateSiteJson],
  );

  const handleToggleNavItemVisible = useCallback(
    (id: string) => {
      updateSiteJson((json) => toggleNavItemVisible(json, id));
    },
    [updateSiteJson],
  );

  const handleToggleNavItemNavVisible = useCallback(
    (id: string) => {
      updateSiteJson((json) => toggleNavItemNavVisible(json, id));
    },
    [updateSiteJson],
  );

  const handleRelabelNavItem = useCallback(
    (id: string, label: string) => {
      updateSiteJson((json) => relabelNavItem(json, id, label));
    },
    [updateSiteJson],
  );

  // Multi inner-section visibility (shared header/footer + page sections). These
  // are base sections with no nav, so they stay outside the nav-list module.
  const handleToggleSectionVisible = useCallback(
    (sectionId: string) => {
      updateSiteJson((json) => {
        const section = allSections(json).find((s) => s.id === sectionId);
        if (section) section.visible = !section.visible;
      });
    },
    [updateSiteJson],
  );

  // ── Multi-mode page selection (UI-only — switches the edited/previewed page).
  const handleSelectPage = useCallback((pageId: string) => {
    setActivePageId(pageId);
    setActiveTab('content');
    // Re-anchor the section selection to the newly active page's view.
    const json = siteJsonRef.current;
    if (isMultiTemplate(json)) {
      const page = json.pages.find((p) => p.id === pageId);
      setSelectedSectionId(
        json.shared.header[0]?.id ?? page?.sections[0]?.id ?? json.shared.footer[0]?.id ?? null,
      );
    }
  }, []);

  const handleSave = async () => {
    const now = Date.now();
    if (now - lastSaveRef.current < 2000) return;
    lastSaveRef.current = now;

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    setActionError(null);
    setSaving(true);
    const result = await saveSiteJsonAction(site.id, stripKeys(siteJson), knownUpdatedAtRef.current);
    if (result && 'error' in result) {
      if (isStaleConflict(result)) {
        setConflictDetected(true);
      } else {
        setActionError(getSiteError(result.error, `Save failed: ${result.error}`));
      }
    } else if (result && 'updatedAt' in result) {
      applySuccessfulSave(result.updatedAt);
    }
    setSaving(false);
  };

  const handlePublish = async () => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    setActionError(null);
    setSaving(true);
    const saveResult = await saveSiteJsonAction(site.id, stripKeys(siteJson), knownUpdatedAtRef.current);
    if (saveResult && 'error' in saveResult) {
      // Any save failure must abort the publish — otherwise we'd publish stale
      // content and silently drop the user's unsaved edit.
      if (isStaleConflict(saveResult)) {
        setConflictDetected(true);
      } else {
        setActionError(getSiteError(saveResult.error, `저장 실패: ${saveResult.error}`));
      }
      setSaving(false);
      return;
    } else if (saveResult && 'updatedAt' in saveResult) {
      applySuccessfulSave(saveResult.updatedAt);
    }
    setPublishing(true);
    const result = await publishSiteAction(site.id, knownUpdatedAtRef.current);

    if (result && 'error' in result) {
      if (isStaleConflict(result)) {
        setConflictDetected(true);
      } else {
        setActionError(getSiteError(result.error, `발행 실패: ${result.error}`));
      }
    } else {
      // Publish bumps updated_at; keep the token fresh for the next save.
      if ('updatedAt' in result) applySuccessfulSave(result.updatedAt);
      if (site.domain) {
        setPublishedUrl(`/site/${site.domain}`);
      } else {
        setPublishedUrl('NO_DOMAIN');
      }
    }
    setPublishing(false);
    setSaving(false);
  };

  const handleSectionClick = useCallback((sectionId: string) => {
    setSelectedSectionId(sectionId);
    setActiveTab('content');
  }, []);

  // Inside the editor the rendered template's links must stay inert — Multi page
  // links (and Single anchors) shouldn't navigate the editor away. Neutralise
  // their default in the capture phase (next/link honours e.defaultPrevented);
  // the click still bubbles to section selection. Page switching uses the tabs.
  const handlePreviewLinkGuard = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('a')) {
      e.preventDefault();
    }
  }, []);

  const themeVariables = useMemo(() => ({
    '--theme-primary': siteJson.globalStyles.primaryColor,
    '--theme-secondary': siteJson.globalStyles.secondaryColor,
    '--theme-font-family': siteJson.globalStyles.fontFamily,
    '--theme-font-size': siteJson.globalStyles.fontSize,
  } as React.CSSProperties), [siteJson.globalStyles]);

  useEffect(() => {
    if (selectedSectionId) {
      const element = document.getElementById(`section-${selectedSectionId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedSectionId]);

  return (
    <>
      {/* Conflict Modal */}
      {conflictDetected && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-outline-variant p-8 max-w-sm w-full mx-4 shadow-2xl">
            <span className="material-symbols-outlined text-amber-500 text-3xl mb-4 block">sync_problem</span>
            <h2 className="font-['Inter'] font-medium text-sm tracking-widest uppercase text-on-surface mb-3">
              Conflict Detected
            </h2>
            <p className="font-['Inter'] font-light text-xs text-outline leading-relaxed mb-6">
              This site was saved from another tab or device. Reloading will load the latest version — your current unsaved changes will be lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-primary text-on-primary h-10 font-['Inter'] font-medium text-[0.6875rem] tracking-[0.2em] uppercase hover:brightness-110 transition-all"
              >
                Reload
              </button>
              <button
                onClick={() => setConflictDetected(false)}
                className="flex-1 border border-outline h-10 font-['Inter'] font-light text-[0.6875rem] tracking-[0.1em] uppercase hover:bg-surface-container transition-colors"
              >
                Keep Editing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Left Panel */}
      <section className="w-[280px] min-w-[280px] shrink-0 flex flex-col border border-outline-variant bg-surface overflow-hidden">
        {/* Tab Switcher */}
        <div className="flex border-b border-outline-variant">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex-1 py-4 text-[0.6875rem] tracking-[0.2em] uppercase font-medium transition-colors ${activeTab === 'content' ? 'text-primary border-b-2 border-primary' : 'text-outline hover:text-primary'
              }`}
          >
            Content
          </button>
          <button
            onClick={() => setActiveTab('design')}
            className={`flex-1 py-4 text-[0.6875rem] tracking-[0.2em] uppercase font-medium transition-colors ${activeTab === 'design' ? 'text-primary border-b-2 border-primary' : 'text-outline hover:text-primary'
              }`}
          >
            Design
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 custom-scrollbar">
          {activeTab === 'content' ? (
            <div className="space-y-12">
              {/* Pages (Multi only) — page management: reorder + 2-axis + label */}
              {isMulti && (
                <div>
                  <h3 className="font-['Inter'] font-medium text-[0.6875rem] tracking-[0.1em] uppercase text-primary mb-6">
                    Pages
                  </h3>
                  <ul className="space-y-3">
                    {pages.map((page, index) => {
                      const isActive = page.id === activePageId;
                      return (
                        <li
                          key={page.id}
                          className={`border p-3 transition-colors ${isActive ? 'border-primary bg-primary/5' : 'border-outline-variant'
                            }`}
                        >
                          {/* Row 1: reorder · page name (switch context) · routable */}
                          <div className="flex items-center gap-2">
                            <span className="flex flex-col shrink-0 -my-1">
                              <button
                                type="button"
                                aria-label="Move page up"
                                disabled={index === 0}
                                onClick={() => handleMoveNavItem(page.id, 'up')}
                                className="text-outline hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed leading-none"
                              >
                                <span className="material-symbols-outlined text-sm">arrow_upward</span>
                              </button>
                              <button
                                type="button"
                                aria-label="Move page down"
                                disabled={index === pages.length - 1}
                                onClick={() => handleMoveNavItem(page.id, 'down')}
                                className="text-outline hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed leading-none"
                              >
                                <span className="material-symbols-outlined text-sm">arrow_downward</span>
                              </button>
                            </span>

                            <button
                              type="button"
                              onClick={() => handleSelectPage(page.id)}
                              className={`flex-grow text-left font-['Inter'] font-light text-xs tracking-wider transition-colors ${isActive ? 'text-primary font-medium' : page.visible ? 'text-on-surface' : 'text-outline'
                                }`}
                            >
                              {page.nav.label || '(untitled page)'}
                            </button>

                            <button
                              type="button"
                              aria-label={page.visible ? 'Make page unroutable' : 'Make page routable'}
                              title={page.visible ? 'Routable' : 'Returns 404 (data kept)'}
                              onClick={() => handleToggleNavItemVisible(page.id)}
                              className={`shrink-0 transition-colors ${page.visible ? 'text-on-surface hover:text-primary' : 'text-outline hover:text-primary'
                                }`}
                            >
                              <span className="material-symbols-outlined text-lg">
                                {page.visible ? 'public' : 'public_off'}
                              </span>
                            </button>
                          </div>

                          {/* Row 2: nav projection (2nd axis) — in-menu toggle + page name */}
                          <div className="mt-2 flex items-center gap-2 pl-1">
                            <button
                              type="button"
                              aria-label={page.nav.visible ? 'Remove from menu' : 'Add to menu'}
                              title={page.nav.visible ? 'Shown in top nav' : 'Hidden from top nav'}
                              onClick={() => handleToggleNavItemNavVisible(page.id)}
                              className={`shrink-0 transition-colors ${page.nav.visible ? 'text-primary' : 'text-outline hover:text-primary'
                                }`}
                            >
                              <span className="material-symbols-outlined text-base">
                                {page.nav.visible ? 'toggle_on' : 'toggle_off'}
                              </span>
                            </button>
                            <span className="font-['Inter'] text-[0.5625rem] tracking-[0.15em] uppercase text-outline shrink-0">
                              Menu
                            </span>
                            <input
                              type="text"
                              value={page.nav.label}
                              onChange={(e) => handleRelabelNavItem(page.id, e.target.value)}
                              placeholder="Page name"
                              className="flex-grow min-w-0 bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-0.5 font-['Inter'] font-light text-[0.6875rem] transition-colors"
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Hierarchy */}
              <div>
                <h3 className="font-['Inter'] font-medium text-[0.6875rem] tracking-[0.1em] uppercase text-primary mb-6">
                  {isMulti ? `Sections // ${activePage?.nav.label ?? ''}` : 'Hierarchy'}
                </h3>
                {isMulti ? (
                  <ul className="space-y-2">
                    {sections.map((section) => {
                      const isSelected = selectedSectionId === section.id;
                      return (
                        <li
                          key={section.id}
                          className="flex items-center gap-2"
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedSectionId(section.id)}
                            className={`flex-grow text-left font-['Inter'] font-light text-xs tracking-wider transition-colors ${isSelected ? 'text-primary font-medium' : section.visible ? 'text-on-surface' : 'text-outline'
                              }`}
                          >
                            {section.type.charAt(0).toUpperCase() + section.type.slice(1).replace(/-/g, ' ')}
                          </button>
                          <button
                            type="button"
                            aria-label={section.visible ? 'Hide section' : 'Show section'}
                            title={section.visible ? 'Visible on page' : 'Hidden from page'}
                            onClick={() => handleToggleSectionVisible(section.id)}
                            className={`shrink-0 transition-colors ${section.visible ? 'text-on-surface hover:text-primary' : 'text-outline hover:text-primary'
                              }`}
                          >
                            <span className="material-symbols-outlined text-lg">
                              {section.visible ? 'visibility' : 'visibility_off'}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                <ul className="space-y-3">
                  {singleSections.map((section, index) => {
                    const pinned = isSinglePinned(section);
                    const isSelected = selectedSectionId === section.id;
                    return (
                      <li
                        key={section.id}
                        className={`border p-3 transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'border-outline-variant'
                          }`}
                      >
                        {/* Row 1: reorder · name · page visibility */}
                        <div className="flex items-center gap-2">
                          {pinned ? (
                            <span
                              className="material-symbols-outlined text-outline text-sm shrink-0"
                              title={section.type === 'nav' ? 'Pinned to top' : 'Pinned to bottom'}
                            >
                              push_pin
                            </span>
                          ) : (
                            <span className="flex flex-col shrink-0 -my-1">
                              <button
                                type="button"
                                aria-label="Move section up"
                                disabled={index <= firstReorderable}
                                onClick={() => handleMoveNavItem(section.id, 'up')}
                                className="text-outline hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed leading-none"
                              >
                                <span className="material-symbols-outlined text-sm">arrow_upward</span>
                              </button>
                              <button
                                type="button"
                                aria-label="Move section down"
                                disabled={index >= lastReorderable}
                                onClick={() => handleMoveNavItem(section.id, 'down')}
                                className="text-outline hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed leading-none"
                              >
                                <span className="material-symbols-outlined text-sm">arrow_downward</span>
                              </button>
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedSectionId(section.id)}
                            className={`flex-grow text-left font-['Inter'] font-light text-xs tracking-wider transition-colors ${isSelected ? 'text-primary font-medium' : section.visible ? 'text-on-surface' : 'text-outline'
                              }`}
                          >
                            {section.type.charAt(0).toUpperCase() + section.type.slice(1).replace(/-/g, ' ')}
                          </button>

                          <button
                            type="button"
                            aria-label={section.visible ? 'Hide section' : 'Show section'}
                            title={section.visible ? 'Visible on page' : 'Hidden from page'}
                            onClick={() => handleToggleNavItemVisible(section.id)}
                            className={`shrink-0 transition-colors ${section.visible ? 'text-on-surface hover:text-primary' : 'text-outline hover:text-primary'
                              }`}
                          >
                            <span className="material-symbols-outlined text-lg">
                              {section.visible ? 'visibility' : 'visibility_off'}
                            </span>
                          </button>
                        </div>

                        {/* Row 2: nav projection (2nd axis) — in-menu toggle + label */}
                        <div className="mt-2 flex items-center gap-2 pl-1">
                          <button
                            type="button"
                            aria-label={section.nav.visible ? 'Remove from menu' : 'Add to menu'}
                            title={section.nav.visible ? 'Shown in nav menu' : 'Hidden from nav menu'}
                            onClick={() => handleToggleNavItemNavVisible(section.id)}
                            className={`shrink-0 transition-colors ${section.nav.visible ? 'text-primary' : 'text-outline hover:text-primary'
                              }`}
                          >
                            <span className="material-symbols-outlined text-base">
                              {section.nav.visible ? 'toggle_on' : 'toggle_off'}
                            </span>
                          </button>
                          <span className="font-['Inter'] text-[0.5625rem] tracking-[0.15em] uppercase text-outline shrink-0">
                            Menu
                          </span>
                          <input
                            type="text"
                            value={section.nav.label}
                            onChange={(e) => handleRelabelNavItem(section.id, e.target.value)}
                            disabled={!section.nav.visible}
                            placeholder="Menu label"
                            className="flex-grow min-w-0 bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-0.5 font-['Inter'] font-light text-[0.6875rem] disabled:opacity-40 transition-colors"
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
                )}
              </div>

              {/* Parameters */}
              {selectedSection && (
                <div>
                  <h3 className="font-['Inter'] font-medium text-[0.6875rem] tracking-[0.1em] uppercase text-primary mb-6">
                    Parameters // {selectedSection.type}
                  </h3>
                  <div className="space-y-8">
                    {Object.entries(selectedSection.data)
                      .filter(([, field]) => field.editable !== false)
                      .map(([fieldKey, field]) => {
                        const schema = templateModule?.library[selectedSection.type]?.meta.dataSchema[fieldKey];
                        return (
                          <DynamicField
                            key={`${selectedSection.id}-${fieldKey}`}
                            field={field}
                            itemSchema={schema?.itemSchema}
                            minItems={schema?.minItems}
                            maxItems={schema?.maxItems}
                            onChange={(val, aid) => handleFieldChange(selectedSection.id, fieldKey, val, aid)}
                            onError={setActionError}
                          />
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-12">
              <h3 className="font-['Inter'] font-medium text-[0.6875rem] tracking-[0.1em] uppercase text-primary mb-6">
                Global Design
              </h3>
              <GlobalStylesEditor
                globalStyles={siteJson.globalStyles}
                onChange={handleGlobalStyleChange}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-outline-variant bg-surface-container-low">
          <div className="mb-3 h-4 flex items-center">
            {autoSaveStatus === 'saving' && (
              <span className="text-[10px] tracking-widest uppercase text-outline animate-pulse">Saving…</span>
            )}
            {autoSaveStatus === 'saved' && (
              <span className="text-[10px] tracking-widest uppercase text-green-600">✓ Saved</span>
            )}
            {autoSaveStatus === 'error' && (
              <span className="text-[10px] tracking-widest uppercase text-amber-600">Auto-save failed — save manually</span>
            )}
            {isDirty && autoSaveStatus === 'idle' && (
              <span className="text-[10px] tracking-widest uppercase text-outline">● Unsaved changes</span>
            )}
          </div>
          {actionError && (
            <div className="mb-4 px-3 py-2 text-[10px] uppercase tracking-widest text-error border border-error/30 bg-error/5 leading-relaxed">
              {actionError}
            </div>
          )}
          <button
            onClick={handlePublish}
            disabled={publishing || saving}
            className="w-full bg-primary text-on-primary h-12 font-['Inter'] font-medium text-[0.6875rem] tracking-[0.2em] uppercase flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:brightness-110"
          >
            {publishing ? 'Publishing...' : saving ? 'Saving...' : 'Publish Changes'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full border border-outline mt-2 h-10 font-['Inter'] font-light text-[0.6875rem] tracking-[0.1em] uppercase hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>

          {publishedUrl === 'NO_DOMAIN' && (
            <div className="mt-4 p-4 text-[10px] uppercase tracking-widest text-amber-600 border border-amber-300 bg-amber-50 leading-relaxed text-center">
              Published!
              <a href="/dashboard/domains" className="underline ml-1 font-bold hover:text-amber-800 transition-colors">
                Set a domain in Domains
              </a>
              to go live.
            </div>
          )}
          {publishedUrl && publishedUrl !== 'NO_DOMAIN' && (
            <a
              href={publishedUrl}
              target="_blank"
              className="mt-4 flex items-center justify-center gap-2 p-4 text-[10px] uppercase tracking-widest text-green-700 border border-green-300 bg-green-50 hover:bg-green-100 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">open_in_new</span>
              View Published Site
            </a>
          )}
        </div>
      </section>

      {/* Right Panel: Live Preview */}
      <section className="flex-grow bg-surface-container-lowest relative blueprint-grid border border-outline-variant overflow-hidden flex flex-col p-6">
        <div className="absolute top-0 left-0 bg-primary text-on-primary px-3 py-1.5 text-[10px] font-medium tracking-[0.15em] z-50">
          LIVE PREVIEW
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar transform-gpu">
          <div
            style={themeVariables}
            className="min-h-full bg-white shadow-2xl"
            onClickCapture={handlePreviewLinkGuard}
          >
            {loadingError ? (
              <div className="flex flex-col items-center justify-center h-[50vh] p-8 text-center">
                <span className="material-symbols-outlined text-error text-4xl mb-4">error</span>
                <p className="text-error font-medium mb-2">Theme Load Error</p>
                <p className="text-outline text-sm max-w-xs">{loadingError}</p>
              </div>
            ) : TemplateRenderer ? (
              <TemplateRenderer
                siteJson={siteJson}
                selectedSectionId={selectedSectionId}
                onSectionClick={handleSectionClick}
                activePageId={activePageId}
              />
            ) : (
              <div className="flex items-center justify-center h-[50vh] text-outline font-light text-sm tracking-widest uppercase animate-pulse">
                Loading Theme Renderer...
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

// ─── Dynamic Field Input ──────────────────────────────────────────────────

interface DynamicFieldProps {
  field: TemplateField;
  itemSchema?: SectionDataSchema;
  minItems?: number;
  maxItems?: number;
  onChange: (value: string | ArrayTemplateField['items'], assetId?: string) => void;
  onError: (msg: string) => void;
}

function DynamicField({ field, itemSchema, minItems, maxItems, onChange, onError }: DynamicFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const baseInputClass =
    "w-full bg-transparent border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 pb-1 font-['Inter'] font-light text-xs transition-colors";

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const initRes = await initUploadAction(file.name, file.type, file.size);
      if ('error' in initRes) throw new Error(initRes.error || 'Failed to initialize upload');

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from('user_assets')
        .upload(initRes.uploadPath, file);

      if (uploadError) throw new Error(uploadError.message);

      const confirmRes = await confirmUploadAction(initRes.assetId, initRes.uploadPath);
      if ('error' in confirmRes) throw new Error(confirmRes.error || 'Failed to confirm upload');

      onChange(confirmRes.publicUrl, initRes.assetId);
    } catch (err: unknown) {
      onError(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('[ASSET_UPLOAD_ERROR]', err);
    } finally {
      setIsUploading(false);
    }
  };

  if (field.type === 'array') {
    return (
      <ArrayField
        field={field}
        itemSchema={itemSchema}
        minItems={minItems}
        maxItems={maxItems}
        onChange={onChange}
        onError={onError}
      />
    );
  }

  const value = field.value || '';

  return (
    <div className="relative group">
      <label className="block font-['Inter'] font-light text-[0.625rem] tracking-[0.1em] uppercase text-outline mb-2 group-focus-within:text-primary transition-colors">
        {field.label}
      </label>

      {field.type === 'textarea' ? (
        <textarea
          className={`${baseInputClass} resize-none`}
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : field.type === 'color' ? (
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 border border-outline-variant overflow-hidden"
            style={{ backgroundColor: value }}
          >
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-12 h-12 -ml-3 -mt-3 cursor-pointer opacity-0"
            />
          </div>
          <input
            type="text"
            className={baseInputClass}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      ) : field.type === 'select' ? (
        <select
          className={baseInputClass}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {field.options.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : field.type === 'image' ? (
        <div>
          <input
            type="text"
            className={baseInputClass}
            value={value}
            onChange={(e) => onChange(e.target.value, undefined)}
            placeholder="https://images.unsplash.com/..."
            disabled={isUploading}
          />
          <div className="mt-2">
            <input
              type="file"
              accept="image/jpeg, image/png, image/webp, image/gif"
              className="text-xs max-w-full"
              onChange={handleUpload}
              disabled={isUploading}
            />
          </div>
          {isUploading && (
            <div className="text-xs text-primary animate-pulse mt-1">Uploading...</div>
          )}
          {value && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt={field.label}
              className="mt-3 w-full h-24 object-cover grayscale opacity-60 border border-outline-variant hover:grayscale-0 hover:opacity-100 transition-all duration-500"
            />
          )}
        </div>
      ) : (
        <input
          type={field.type === 'number' ? 'number' : field.type === 'url' ? 'url' : 'text'}
          className={baseInputClass}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

function ArrayField({
  field,
  itemSchema,
  minItems,
  maxItems,
  onChange,
  onError,
}: {
  field: ArrayTemplateField;
  itemSchema?: SectionDataSchema;
  minItems?: number;
  maxItems?: number;
  onChange: (value: ArrayTemplateField['items']) => void;
  onError: (msg: string) => void;
}) {
  const items = field.items || [];

  const handleAddItem = () => {
    if (!itemSchema) return;
    if (maxItems !== undefined && items.length >= maxItems) {
      onError(`Maximum ${maxItems} items allowed`);
      return;
    }

    const newItem: Record<string, TemplateField> = {
      _key: { type: 'text', value: Math.random().toString(36).slice(2), label: '_key', editable: false },
    };

    // Initialize fields based on itemSchema
    Object.entries(itemSchema).forEach(([key, schema]) => {
      if (schema.type === 'array') {
        newItem[key] = { type: 'array', label: schema.label, items: [] };
      } else if (schema.type === 'image') {
        newItem[key] = { type: 'image', label: schema.label, value: '' };
      } else if (schema.type === 'select') {
        newItem[key] = { type: 'select', label: schema.label, value: schema.options?.[0] || '', options: schema.options || [] };
      } else {
        newItem[key] = { type: schema.type as 'text' | 'textarea' | 'url' | 'color' | 'number', label: schema.label, value: '' };
      }
    });

    onChange([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (minItems !== undefined && items.length <= minItems) {
      onError(`Minimum ${minItems} items required`);
      return;
    }
    const next = [...items];
    next.splice(index, 1);
    onChange(next);
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const next = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    onChange(next);
  };

  const handleItemFieldChange = (index: number, fieldKey: string, value: string | ArrayTemplateField['items'], assetId?: string) => {
    const next = structuredClone(items);
    const field = next[index][fieldKey];
    if (field.type === 'array' && Array.isArray(value)) {
      field.items = value;
    } else if (field.type !== 'array' && typeof value === 'string') {
      field.value = value;
      if (assetId !== undefined && field.type === 'image') {
        field.assetId = assetId;
      }
    }
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block font-['Inter'] font-medium text-[0.6875rem] tracking-[0.1em] uppercase text-primary">
          {field.label} ({items.length}{maxItems !== undefined ? ` / ${maxItems}` : ''})
        </label>
        <button
          onClick={handleAddItem}
          disabled={maxItems !== undefined && items.length >= maxItems}
          className="text-primary hover:text-primary/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title={maxItems !== undefined && items.length >= maxItems ? `Max ${maxItems} reached` : 'Add Item'}
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
        </button>
      </div>

      <div className="space-y-6">
        {items.map((item, index) => (
          <div
            key={item._key.type !== 'array' ? item._key.value : index}
            className="p-4 bg-surface-container-low border border-outline-variant relative group/item"
          >
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
              <button
                disabled={index === 0}
                onClick={() => handleMoveItem(index, 'up')}
                className="text-outline hover:text-primary disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-sm">arrow_upward</span>
              </button>
              <button
                disabled={index === items.length - 1}
                onClick={() => handleMoveItem(index, 'down')}
                className="text-outline hover:text-primary disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-sm">arrow_downward</span>
              </button>
              <button
                onClick={() => handleRemoveItem(index)}
                disabled={minItems !== undefined && items.length <= minItems}
                className="text-outline hover:text-error transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title={minItems !== undefined && items.length <= minItems ? `Min ${minItems} required` : 'Delete'}
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>

            <div className="space-y-6 pt-2">
              {Object.entries(item)
                .filter(([key, f]) => key !== '_key' && f.editable !== false)
                .map(([fKey, f]) => (
                  <DynamicField
                    key={fKey}
                    field={f}
                    itemSchema={itemSchema?.[fKey]?.itemSchema}
                    minItems={itemSchema?.[fKey]?.minItems}
                    maxItems={itemSchema?.[fKey]?.maxItems}
                    onChange={(val, aid) => handleItemFieldChange(index, fKey, val, aid)}
                    onError={onError}
                  />
                ))}
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="py-8 border border-dashed border-outline-variant text-center">
            <p className="text-[10px] uppercase tracking-widest text-outline">No items yet</p>
            <button
              onClick={handleAddItem}
              className="mt-2 text-primary text-[10px] uppercase tracking-widest font-medium hover:underline"
            >
              + Add first item
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
