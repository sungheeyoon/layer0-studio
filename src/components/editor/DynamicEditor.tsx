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
import { useLocale, useDictionary } from '@/lib/i18n/provider';
import {
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Globe,
  GlobeLock,
  ToggleLeft,
  ToggleRight,
  Pin,
  PlusCircle,
  Trash2,
  ExternalLink,
  CircleAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DynamicEditorProps {
  site: UserSite;
}

export default function DynamicEditor({ site }: DynamicEditorProps) {
  const locale = useLocale();
  const t = useDictionary().editor;
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
            setActionError(getSiteError(result.error, locale, t.saveFailedFallback));
          }
        }
      } else if (result && 'updatedAt' in result) {
        applySuccessfulSave(result.updatedAt);
      }
    }, 4000);
  }, [site.id, applySuccessfulSave, locale, t.saveFailedFallback]);

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
          setLoadingError(t.loadError.timeout);
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
            setLoadingError(`${t.loadError.notFoundPrefix}${siteJson.templateKey}${t.loadError.notFoundSuffix}`);
          }
        }
      } catch (err) {
        clearTimeout(timeoutId);
        if (mounted) {
          setLoadingError(t.loadError.failed);
          console.error('Theme load error:', err);
        }
      }
    };
    fetchTheme();
    return () => { mounted = false; };
  }, [siteJson.templateKey, t.loadError]);

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
        setActionError(getSiteError(result.error, locale, t.saveFailedFallback));
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
        setActionError(getSiteError(saveResult.error, locale, t.saveFailedFallback));
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
        setActionError(getSiteError(result.error, locale, t.publishFailedFallback));
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
      <AlertDialog open={conflictDetected} onOpenChange={setConflictDetected}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.conflict.title}</AlertDialogTitle>
            <AlertDialogDescription>{t.conflict.body}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.conflict.keepEditing}</AlertDialogCancel>
            <AlertDialogAction onClick={() => window.location.reload()}>
              {t.conflict.reload}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Left Panel */}
      <section className="flex w-[280px] min-w-[280px] shrink-0 flex-col overflow-hidden border border-border bg-card">
        {/* Tab Switcher */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'content' | 'design')}
          className="gap-0 border-b border-border p-2"
        >
          <TabsList variant="line" className="w-full">
            <TabsTrigger value="content">{t.tabs.content}</TabsTrigger>
            <TabsTrigger value="design">{t.tabs.design}</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex-grow overflow-y-auto p-6">
          {activeTab === 'content' ? (
            <div className="space-y-8">
              {/* Pages (Multi only) — page management: reorder + 2-axis + label */}
              {isMulti && (
                <div>
                  <h3 className="mb-4 text-sm font-semibold text-foreground">
                    {t.pages.heading}
                  </h3>
                  <ul className="space-y-3">
                    {pages.map((page, index) => {
                      const isActive = page.id === activePageId;
                      return (
                        <li
                          key={page.id}
                          className={`rounded-md border p-3 transition-colors ${isActive ? 'border-primary bg-primary/5' : 'border-border'
                            }`}
                        >
                          {/* Row 1: reorder · page name (switch context) · routable */}
                          <div className="flex items-center gap-2">
                            <span className="-my-1 flex shrink-0 flex-col">
                              <button
                                type="button"
                                aria-label={t.pages.moveUp}
                                disabled={index === 0}
                                onClick={() => handleMoveNavItem(page.id, 'up')}
                                className="leading-none text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-20"
                              >
                                <ChevronUp className="size-4" />
                              </button>
                              <button
                                type="button"
                                aria-label={t.pages.moveDown}
                                disabled={index === pages.length - 1}
                                onClick={() => handleMoveNavItem(page.id, 'down')}
                                className="leading-none text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-20"
                              >
                                <ChevronDown className="size-4" />
                              </button>
                            </span>

                            <button
                              type="button"
                              onClick={() => handleSelectPage(page.id)}
                              className={`flex-grow text-left text-sm transition-colors ${isActive ? 'font-medium text-primary' : page.visible ? 'text-foreground' : 'text-muted-foreground'
                                }`}
                            >
                              {page.nav.label || '(untitled page)'}
                            </button>

                            <button
                              type="button"
                              aria-label={page.visible ? t.pages.makeUnroutable : t.pages.makeRoutable}
                              title={page.visible ? t.pages.routableTitle : t.pages.unroutableTitle}
                              onClick={() => handleToggleNavItemVisible(page.id)}
                              className={`shrink-0 transition-colors ${page.visible ? 'text-foreground hover:text-primary' : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                              {page.visible ? <Globe className="size-4" /> : <GlobeLock className="size-4" />}
                            </button>
                          </div>

                          {/* Row 2: nav projection (2nd axis) — in-menu toggle + page name */}
                          <div className="mt-2 flex items-center gap-2 pl-1">
                            <button
                              type="button"
                              aria-label={page.nav.visible ? t.pages.removeFromMenu : t.pages.addToMenu}
                              title={page.nav.visible ? t.pages.inTopNavTitle : t.pages.notInTopNavTitle}
                              onClick={() => handleToggleNavItemNavVisible(page.id)}
                              className={`shrink-0 transition-colors ${page.nav.visible ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                              {page.nav.visible ? <ToggleRight className="size-5" /> : <ToggleLeft className="size-5" />}
                            </button>
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {t.sections.menu}
                            </span>
                            <Input
                              value={page.nav.label}
                              onChange={(e) => handleRelabelNavItem(page.id, e.target.value)}
                              placeholder={t.pages.namePlaceholder}
                              className="h-8 flex-grow"
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
                <h3 className="mb-4 text-sm font-semibold text-foreground">
                  {isMulti ? (
                    <>
                      {t.sections.sectionsLabel}{' '}
                      <span className="font-normal text-muted-foreground">· {activePage?.nav.label ?? ''}</span>
                    </>
                  ) : (
                    t.sections.hierarchy
                  )}
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
                            className={`flex-grow text-left text-sm transition-colors ${isSelected ? 'font-medium text-primary' : section.visible ? 'text-foreground' : 'text-muted-foreground'
                              }`}
                          >
                            {section.type.charAt(0).toUpperCase() + section.type.slice(1).replace(/-/g, ' ')}
                          </button>
                          <button
                            type="button"
                            aria-label={section.visible ? t.sections.hide : t.sections.show}
                            title={section.visible ? t.sections.visibleOnPage : t.sections.hiddenFromPage}
                            onClick={() => handleToggleSectionVisible(section.id)}
                            className={`shrink-0 transition-colors ${section.visible ? 'text-foreground hover:text-primary' : 'text-muted-foreground hover:text-foreground'
                              }`}
                          >
                            {section.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
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
                        className={`rounded-md border p-3 transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                      >
                        {/* Row 1: reorder · name · page visibility */}
                        <div className="flex items-center gap-2">
                          {pinned ? (
                            <span
                              className="shrink-0 text-muted-foreground"
                              title={section.type === 'nav' ? t.sections.pinnedTop : t.sections.pinnedBottom}
                            >
                              <Pin className="size-3.5" />
                            </span>
                          ) : (
                            <span className="-my-1 flex shrink-0 flex-col">
                              <button
                                type="button"
                                aria-label={t.sections.moveUp}
                                disabled={index <= firstReorderable}
                                onClick={() => handleMoveNavItem(section.id, 'up')}
                                className="leading-none text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-20"
                              >
                                <ChevronUp className="size-4" />
                              </button>
                              <button
                                type="button"
                                aria-label={t.sections.moveDown}
                                disabled={index >= lastReorderable}
                                onClick={() => handleMoveNavItem(section.id, 'down')}
                                className="leading-none text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-20"
                              >
                                <ChevronDown className="size-4" />
                              </button>
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedSectionId(section.id)}
                            className={`flex-grow text-left text-sm transition-colors ${isSelected ? 'font-medium text-primary' : section.visible ? 'text-foreground' : 'text-muted-foreground'
                              }`}
                          >
                            {section.type.charAt(0).toUpperCase() + section.type.slice(1).replace(/-/g, ' ')}
                          </button>

                          <button
                            type="button"
                            aria-label={section.visible ? t.sections.hide : t.sections.show}
                            title={section.visible ? t.sections.visibleOnPage : t.sections.hiddenFromPage}
                            onClick={() => handleToggleNavItemVisible(section.id)}
                            className={`shrink-0 transition-colors ${section.visible ? 'text-foreground hover:text-primary' : 'text-muted-foreground hover:text-foreground'
                              }`}
                          >
                            {section.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                          </button>
                        </div>

                        {/* Row 2: nav projection (2nd axis) — in-menu toggle + label */}
                        <div className="mt-2 flex items-center gap-2 pl-1">
                          <button
                            type="button"
                            aria-label={section.nav.visible ? t.sections.removeFromMenu : t.sections.addToMenu}
                            title={section.nav.visible ? t.sections.inNavMenuTitle : t.sections.notInNavMenuTitle}
                            onClick={() => handleToggleNavItemNavVisible(section.id)}
                            className={`shrink-0 transition-colors ${section.nav.visible ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                              }`}
                          >
                            {section.nav.visible ? <ToggleRight className="size-5" /> : <ToggleLeft className="size-5" />}
                          </button>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {t.sections.menu}
                          </span>
                          <Input
                            value={section.nav.label}
                            onChange={(e) => handleRelabelNavItem(section.id, e.target.value)}
                            disabled={!section.nav.visible}
                            placeholder={t.sections.menuLabelPlaceholder}
                            className="h-8 flex-grow"
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
                  <h3 className="mb-4 text-sm font-semibold text-foreground">
                    {t.parameters}{' '}
                    <span className="font-normal text-muted-foreground">· {selectedSection.type}</span>
                  </h3>
                  <div className="space-y-6">
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
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-foreground">
                {t.design.globalHeading}
              </h3>
              <GlobalStylesEditor
                globalStyles={siteJson.globalStyles}
                onChange={handleGlobalStyleChange}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="shrink-0 border-t border-border bg-muted/40 p-6">
          <div className="mb-3 flex h-4 items-center text-xs">
            {autoSaveStatus === 'saving' && (
              <span className="text-muted-foreground">{t.autosave.saving}</span>
            )}
            {autoSaveStatus === 'saved' && (
              <span className="text-success">{t.autosave.saved}</span>
            )}
            {autoSaveStatus === 'error' && (
              <span className="text-warning">{t.autosave.failed}</span>
            )}
            {isDirty && autoSaveStatus === 'idle' && (
              <span className="text-muted-foreground">{t.autosave.unsaved}</span>
            )}
          </div>
          {actionError && (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs leading-relaxed text-destructive">
              {actionError}
            </div>
          )}
          <Button
            onClick={handlePublish}
            disabled={publishing || saving}
            size="lg"
            className="w-full"
          >
            {publishing ? t.actions.publishing : saving ? t.actions.saving : t.actions.publish}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="outline"
            className="mt-2 w-full"
          >
            {saving ? t.actions.saving : t.actions.saveDraft}
          </Button>

          {publishedUrl === 'NO_DOMAIN' && (
            <div className="mt-4 rounded-md border border-warning/30 bg-warning/10 p-4 text-center text-xs leading-relaxed text-warning">
              {t.published.line1}
              <a href="/dashboard/domains" className="mx-1 font-medium underline hover:text-warning/80">
                {t.published.setDomainLink}
              </a>
              {t.published.line2}
            </div>
          )}
          {publishedUrl && publishedUrl !== 'NO_DOMAIN' && (
            <Button asChild variant="outline" className="mt-4 w-full">
              <a href={publishedUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
                {t.published.viewSite}
              </a>
            </Button>
          )}
        </div>
      </section>

      {/* Right Panel: Live Preview */}
      <section className="relative flex flex-grow flex-col overflow-hidden border border-border bg-muted/30 p-6">
        <div className="absolute left-3 top-3 z-10 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
          {t.preview.label}
        </div>

        <div className="flex-grow transform-gpu overflow-y-auto">
          <div
            style={themeVariables}
            className="min-h-full bg-white shadow-2xl"
            onClickCapture={handlePreviewLinkGuard}
          >
            {loadingError ? (
              <div className="flex h-[50vh] flex-col items-center justify-center p-8 text-center">
                <CircleAlert className="mb-4 size-10 text-destructive" />
                <p className="mb-2 font-medium text-destructive">{t.loadError.heading}</p>
                <p className="max-w-xs text-sm text-muted-foreground">{loadingError}</p>
              </div>
            ) : TemplateRenderer ? (
              <TemplateRenderer
                siteJson={siteJson}
                selectedSectionId={selectedSectionId}
                onSectionClick={handleSectionClick}
                activePageId={activePageId}
              />
            ) : (
              <div className="flex h-[50vh] animate-pulse items-center justify-center text-sm text-muted-foreground">
                {t.preview.loadingRenderer}
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
  const t = useDictionary().editor;
  const [isUploading, setIsUploading] = useState(false);

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
      onError(`${t.field.uploadFailedPrefix}${err instanceof Error ? err.message : 'Unknown error'}`);
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
    <div className="space-y-2">
      <Label>{field.label}</Label>

      {field.type === 'textarea' ? (
        <Textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : field.type === 'color' ? (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="size-9 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-1"
          />
          <Input
            className="font-mono"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      ) : field.type === 'select' ? (
        <Select value={value} onValueChange={(v) => onChange(v)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((opt: string) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : field.type === 'image' ? (
        <div className="space-y-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value, undefined)}
            placeholder="https://images.unsplash.com/..."
            disabled={isUploading}
          />
          <Input
            type="file"
            accept="image/jpeg, image/png, image/webp, image/gif"
            className="cursor-pointer text-xs file:mr-2 file:cursor-pointer"
            onChange={handleUpload}
            disabled={isUploading}
          />
          {isUploading && (
            <p className="animate-pulse text-xs text-primary">{t.field.uploading}</p>
          )}
          {value && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt={field.label}
              className="mt-1 h-24 w-full rounded-md border border-border object-cover"
            />
          )}
        </div>
      ) : (
        <Input
          type={field.type === 'number' ? 'number' : field.type === 'url' ? 'url' : 'text'}
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
  const t = useDictionary().editor;
  const items = field.items || [];

  const handleAddItem = () => {
    if (!itemSchema) return;
    if (maxItems !== undefined && items.length >= maxItems) {
      onError(`${t.field.maxItemsErrorPrefix}${maxItems}${t.field.maxItemsErrorSuffix}`);
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
      onError(`${t.field.minItemsErrorPrefix}${minItems}${t.field.minItemsErrorSuffix}`);
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
        <Label className="text-primary">
          {field.label} ({items.length}{maxItems !== undefined ? ` / ${maxItems}` : ''})
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleAddItem}
          disabled={maxItems !== undefined && items.length >= maxItems}
          className="text-primary hover:text-primary"
          title={maxItems !== undefined && items.length >= maxItems ? `${t.field.maxReachedPrefix}${maxItems}${t.field.maxReachedSuffix}` : t.field.addItem}
        >
          <PlusCircle className="size-5" />
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item._key.type !== 'array' ? item._key.value : index}
            className="group/item relative rounded-md border border-border bg-muted/40 p-4"
          >
            <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover/item:opacity-100">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => handleMoveItem(index, 'up')}
                className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
              >
                <ChevronUp className="size-4" />
              </button>
              <button
                type="button"
                disabled={index === items.length - 1}
                onClick={() => handleMoveItem(index, 'down')}
                className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
              >
                <ChevronDown className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                disabled={minItems !== undefined && items.length <= minItems}
                className="text-muted-foreground transition-colors hover:text-destructive disabled:cursor-not-allowed disabled:opacity-30"
                title={minItems !== undefined && items.length <= minItems ? `${t.field.minRequiredPrefix}${minItems}${t.field.minRequiredSuffix}` : t.field.delete}
              >
                <Trash2 className="size-4" />
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
          <div className="rounded-md border border-dashed border-border py-8 text-center">
            <p className="text-sm text-muted-foreground">{t.field.noItems}</p>
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={handleAddItem}
              className="mt-1 h-auto text-primary"
            >
              {t.field.addFirstItem}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
