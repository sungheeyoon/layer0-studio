'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { UserSite } from '@/domain/entities/user-site.entity';
import {
  ContentModel,
  GlobalStyles,
  Block,
  isSingleContent,
  isMultiContent,
  allBlocks,
} from '@/domain/entities/template.entity';
import {
  isSinglePinned,
  reorderNavItem,
  toggleNavItemVisible,
  toggleSingleMenu,
  setPageMenuPlacement,
  relabelMenuItem,
  renamePage,
  type MenuPlacement,
} from '@/domain/entities/ordered-nav-list';
import { setFieldValue, type FieldValue } from '@/domain/entities/field-edit';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { saveContentAction, publishSiteAction } from '@/app/(authenticated)/dashboard/editor/actions';
import GlobalStylesEditor from './GlobalStylesEditor';
import EditorPreviewFrame from './EditorPreviewFrame';
import { SectionFields } from './SectionFields';
import { loadTemplate } from '@/templates/registry';
import { TemplateModule } from '@/templates/types';
import { getSiteError } from '@/lib/errors/messages';
import { nextSaveDelay } from '@/lib/editor/autosave-schedule';
import { createWriteQueue } from '@/lib/editor/write-queue';
import {
  flushWithRetry,
  TRANSPORT_FAILURE_CODE,
  type SaveOutcome,
} from '@/lib/editor/flush-retry';
import {
  indexIssues,
  EMPTY_ISSUE_INDEX,
  type IssueIndex,
} from '@/lib/editor/content-issues';
import { validateContent } from '@/lib/template/validate';
import { globalStylesToThemeVars } from '@/lib/template/design-tokens';
import { useLocale, useDictionary } from '@/lib/i18n/provider';
import {
  GripVertical,
  Eye,
  EyeOff,
  Globe,
  GlobeLock,
  ToggleLeft,
  ToggleRight,
  Pin,
  ExternalLink,
  CircleAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  // No `injectKeys` any more: array items carry a real, persisted `id`
  // (ADR-0016 §4-4), so there is nothing to stamp on at load or strip off at
  // save. The clone keeps the server-rendered prop out of reach of any edit.
  const [content, setContent] = useState<ContentModel>(() => structuredClone(site.content));
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');

  const isMulti = isMultiContent(content);

  // Multi sites edit one page at a time (page tabs switch the context). The
  // active page also drives the live preview (`activePageId` → renderer).
  const [activePageId, setActivePageId] = useState<string | undefined>(() =>
    isMultiContent(site.content) ? site.content.pages[0]?.id : undefined,
  );

  // Single Sites carry Blocks directly in one continuous scroll.
  const singleSections = useMemo(
    () => (isSingleContent(content) ? content.blocks : []),
    [content],
  );

  // Multi page-management source: array order = nav order.
  const pages = useMemo(
    () => (isMultiContent(content) ? content.pages : []),
    [content],
  );
  const activePage = useMemo(
    () => pages.find((p) => p.id === activePageId) ?? pages[0],
    [pages, activePageId],
  );

  // Blocks shown in the Hierarchy / Parameters panel: Single → its Blocks;
  // Multi → Chrome header + active Page Blocks + Chrome footer.
  // (so the brand, page body and footer of the previewed page are all editable).
  const displayedBlocks = useMemo<Block[]>(() => {
    if (isSingleContent(content)) return content.blocks;
    if (isMultiContent(content) && activePage) {
      return [...content.chrome.header, ...activePage.blocks, ...content.chrome.footer];
    }
    return [];
  }, [content, activePage]);

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    displayedBlocks[0]?.id ?? null
  );

  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [isDirty, setIsDirty] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [conflictDetected, setConflictDetected] = useState(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** When the oldest edit not yet handed to a request arrived — anchors MAX_WAIT. */
  const pendingSinceRef = useRef<number | null>(null);
  const contentRef = useRef(content);
  const knownUpdatedAtRef = useRef<string>(site.updatedAt);
  const mountedRef = useRef(true);

  useEffect(() => { contentRef.current = content; }, [content]);

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

  // Every write to this Site — auto-save, Save draft, Publish, unmount flush —
  // goes through one queue, so two of our own requests never race on the same
  // `expectedUpdatedAt`. See `write-queue.ts` and ADR-0015 §3.
  const enqueueWrite = useRef(createWriteQueue()).current;

  /**
   * One save attempt. Reads the content and the concurrency token at *execution*
   * time rather than enqueue time, so a queued save always ships the newest edit
   * and a token freshened by whatever ran ahead of it.
   *
   * Never throws. A Server Action rejects on transport failure, and this runs in
   * places — a timer callback, an unmount cleanup — with no caller to catch it.
   */
  const runSave = useCallback(async (): Promise<SaveOutcome> => {
    try {
      const result = await saveContentAction(
        site.id,
        contentRef.current,
        knownUpdatedAtRef.current,
      );
      if ('error' in result) return { ok: false, code: result.error };
      knownUpdatedAtRef.current = result.updatedAt;
      return { ok: true, updatedAt: result.updatedAt };
    } catch (err) {
      // A throw here means the request never got an answer — the server's own
      // failures come back as `{ error }`. Tag it apart from `UNKNOWN` so the
      // unmount flush can tell "worth retrying" from "will fail identically".
      console.error('[editor] save request failed:', err);
      return { ok: false, code: TRANSPORT_FAILURE_CODE };
    }
  }, [site.id]);

  const enqueueSave = useCallback(() => enqueueWrite(runSave), [enqueueWrite, runSave]);

  /**
   * Stand down the debounce because the caller is taking over the save. Clearing
   * the timer alone is not enough — the MAX_WAIT anchor has to go with it, or the
   * next edit inherits a deadline measured from an edit that has already shipped.
   */
  const cancelScheduledSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    pendingSinceRef.current = null;
  }, []);

  const runAutoSave = useCallback(async () => {
    autoSaveTimerRef.current = null;
    pendingSinceRef.current = null;
    setAutoSaveStatus('saving');
    const outcome = await enqueueSave();
    if (!mountedRef.current) return;
    if (outcome.ok) {
      setIsDirty(false);
      setAutoSaveStatus('saved');
    } else if (outcome.code === 'STALE_VERSION') {
      setAutoSaveStatus('idle');
      setConflictDetected(true);
    } else {
      // Every failure gets the banner, not just INVALID_TEMPLATE_JSON. A failed
      // auto-save used to show one 12px grey line and nothing else, which is how
      // a save that stopped working stayed unnoticed.
      setAutoSaveStatus('error');
      setActionError(getSiteError(outcome.code, locale, t.saveFailedFallback));
    }
  }, [enqueueSave, locale, t.saveFailedFallback]);

  const scheduleAutoSave = useCallback(() => {
    const now = Date.now();
    if (pendingSinceRef.current === null) pendingSinceRef.current = now;
    setIsDirty(true);
    setAutoSaveStatus('idle');
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(
      () => { void runAutoSave(); },
      nextSaveDelay(pendingSinceRef.current, now),
    );
  }, [runAutoSave]);

  const enqueueSaveRef = useRef(enqueueSave);
  useEffect(() => { enqueueSaveRef.current = enqueueSave; }, [enqueueSave]);

  // Unmount flush — the loss path ADR-0015 §2 closes. Leaving by the chrome's
  // back Link (SPA navigation) or the browser Back button unmounts this without
  // ever firing `beforeunload`, and the old cleanup only cleared the timer, so
  // the pending edit died in silence. The page survives both, so an un-awaited
  // request still completes.
  //
  // A live debounce timer is the precise signal for "edits exist that no request
  // has picked up yet": every edit reschedules it, every dispatch clears it.
  //
  // Un-awaited, because there is no surface left to report a failure on — but
  // no longer fire-and-forget. A transport failure here used to be the one
  // recoverable loss nobody could see, so `flushWithRetry` re-sends it a bounded
  // number of times through the same queue. `STALE_VERSION` is still dropped in
  // silence, deliberately: retrying it would overwrite the other tab (ADR-0004).
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (!autoSaveTimerRef.current) return;
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
      void flushWithRetry(() => enqueueSaveRef.current()).then((outcome) => {
        if (!outcome.ok) console.error('[editor] unmount flush failed:', outcome.code);
      });
    };
  }, []);

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
        const mod = await loadTemplate(content.templateKey || 'corporate-default');
        clearTimeout(timeoutId);
        if (mounted) {
          if (mod) {
            loaded = true;
            setTemplateModule(mod);
          } else {
            setLoadingError(`${t.loadError.notFoundPrefix}${content.templateKey}${t.loadError.notFoundSuffix}`);
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
  }, [content.templateKey, t.loadError]);

  const TemplateRenderer = templateModule?.default;

  // The same rules the server runs, run here so a Warning rule surfaces under the
  // field that caused it rather than as a slightly wrong colour on the published
  // Site (ADR-0015 §5). `validateContent` is pure and imports nothing but types,
  // so this is the identical function — not a second copy of the rules that could
  // drift out of step. Only `warnings` is read: this reports, it never blocks.
  const issueIndex = useMemo<IssueIndex>(() => {
    if (!templateModule) return EMPTY_ISSUE_INDEX;
    const { warnings } = validateContent(content, {
      templateLibrary: templateModule.library,
      // The Template's own background is the reference the polarity rule needs:
      // its text tokens are tuned for that luminance and do not follow the user.
      templateDefaultBackground: templateModule.defaultContent.globalStyles.backgroundColor,
    });
    return indexIssues(warnings);
  }, [content, templateModule]);

  const updateContent = useCallback((updater: (json: ContentModel) => void) => {
    setContent((prev) => {
      const updated = structuredClone(prev);
      updater(updated);
      return updated;
    });
    scheduleAutoSave();
  }, [scheduleAutoSave]);

  const handleFieldChange = useCallback(
    (sectionId: string, fieldKey: string, value: FieldValue) => {
      updateContent((json) => setFieldValue(json, sectionId, fieldKey, value));
    },
    [updateContent]
  );

  const handleGlobalStyleChange = useCallback(
    (key: keyof GlobalStyles, value: string) => {
      updateContent((json) => {
        json.globalStyles[key] = value;
      });
    },
    [updateContent]
  );

  // ── Ordered Block/Page and menu edits ──────────────────────────────────────

  // Drag-and-drop reorder (replaces the old up/down buttons). One handler for
  // both Site Types — `reorderNavItem` dispatches to Blocks (Single, with the
  // nav/footer pin rule) or pages (Multi). Pins are excluded from the sortable
  // list, so they never move.
  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        updateContent((json) => reorderNavItem(json, String(active.id), String(over.id)));
      }
    },
    [updateContent],
  );

  const handleToggleNavItemVisible = useCallback(
    (id: string) => {
      updateContent((json) => toggleNavItemVisible(json, id));
    },
    [updateContent],
  );

  const handleToggleSingleMenu = useCallback(
    (id: string) => {
      updateContent((json) => {
        if (!isSingleContent(json)) return;
        const block = json.blocks.find((item) => item.id === id);
        if (!block) return;
        toggleSingleMenu(json, id, block.menu?.label || templateModule?.library[block.type]?.meta.label || block.type);
      });
    },
    [updateContent, templateModule],
  );

  const handleRelabelMenuItem = useCallback(
    (id: string, label: string) => {
      updateContent((json) => relabelMenuItem(json, id, label));
    },
    [updateContent],
  );

  const handlePageMenuPlacement = useCallback((id: string, placement: MenuPlacement) => {
    updateContent((json) => setPageMenuPlacement(json, id, placement));
  }, [updateContent]);

  const handleRenamePage = useCallback((id: string, name: string) => {
    updateContent((json) => renamePage(json, id, name));
  }, [updateContent]);

  // Multi inner-Block visibility stays outside the Page-menu mutation module.
  const handleToggleSectionVisible = useCallback(
    (sectionId: string) => {
      updateContent((json) => {
        const section = allBlocks(json).find((s) => s.id === sectionId);
        if (section) section.visible = !section.visible;
      });
    },
    [updateContent],
  );

  // ── Multi-mode page selection (UI-only — switches the edited/previewed page).
  const handleSelectPage = useCallback((pageId: string) => {
    setActivePageId(pageId);
    setActiveTab('content');
    // Re-anchor the section selection to the newly active page's view.
    const json = contentRef.current;
    if (isMultiContent(json)) {
      const page = json.pages.find((p) => p.id === pageId);
      setSelectedSectionId(
        json.chrome.header[0]?.id ?? page?.blocks[0]?.id ?? json.chrome.footer[0]?.id ?? null,
      );
    }
  }, []);

  // No throttle guard here any more — the old 2-second one keyed off the last
  // *successful* save, so it let a click through while an auto-save was still in
  // flight (the self-conflict this queue removes) and swallowed the click right
  // after one succeeded. The disabled button covers double-clicks.
  const handleSave = async () => {
    cancelScheduledSave();
    setActionError(null);
    setSaving(true);
    const outcome = await enqueueSave();
    if (!mountedRef.current) return;
    if (outcome.ok) {
      setIsDirty(false);
      setAutoSaveStatus('saved');
    } else if (outcome.code === 'STALE_VERSION') {
      setConflictDetected(true);
    } else {
      setActionError(getSiteError(outcome.code, locale, t.saveFailedFallback));
    }
    setSaving(false);
  };

  const handlePublish = async () => {
    cancelScheduledSave();
    setActionError(null);
    setSaving(true);

    // Save and publish enter the queue as ONE task. Splitting them would let a
    // queued auto-save land in between, bumping `updated_at` and making the
    // publish's own token stale.
    const outcome = await enqueueWrite(async (): Promise<SaveOutcome & { phase: 'save' | 'publish' }> => {
      const saved = await runSave();
      // Any save failure must abort the publish — otherwise we'd publish stale
      // content and silently drop the user's unsaved edit.
      if (!saved.ok) return { ...saved, phase: 'save' };
      if (mountedRef.current) setPublishing(true);
      try {
        const result = await publishSiteAction(site.id, knownUpdatedAtRef.current);
        // `?? 'UNKNOWN'` because publishSiteAction's union includes its own
        // RATE_LIMITED branch, which widens `error` to `string | undefined`.
        if ('error' in result) return { ok: false, code: result.error ?? 'UNKNOWN', phase: 'publish' };
        // Publish bumps updated_at; keep the token fresh for the next write.
        knownUpdatedAtRef.current = result.updatedAt;
        return { ok: true, updatedAt: result.updatedAt, phase: 'publish' };
      } catch (err) {
        console.error('[editor] publish request failed:', err);
        return { ok: false, code: TRANSPORT_FAILURE_CODE, phase: 'publish' };
      }
    });

    if (!mountedRef.current) return;
    if (outcome.ok) {
      setIsDirty(false);
      setAutoSaveStatus('saved');
      setPublishedUrl(site.domain ? `/site/${site.domain}` : 'NO_DOMAIN');
    } else if (outcome.code === 'STALE_VERSION') {
      setConflictDetected(true);
    } else {
      setActionError(
        getSiteError(
          outcome.code,
          locale,
          outcome.phase === 'save' ? t.saveFailedFallback : t.publishFailedFallback,
        ),
      );
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
  const themeVariables = useMemo(
    () => globalStylesToThemeVars(content.globalStyles) as React.CSSProperties,
    [content.globalStyles],
  );

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
      <section className="flex w-[320px] min-w-[320px] shrink-0 flex-col overflow-hidden border border-border bg-card">
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
                  <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={pages.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                      <ul className="space-y-3">
                        {pages.map((page) => {
                          const isActive = page.id === activePageId;
                          return (
                            <SortableRow
                              key={page.id}
                              id={page.id}
                              className={(isDragging) =>
                                `rounded-md border p-3 transition-colors ${isActive ? 'border-primary bg-primary/5' : 'border-border'} ${isDragging ? 'shadow-lg' : ''}`
                              }
                            >
                              {({ attributes, listeners }) => (
                                <>
                                  {/* Row 1: drag · page name (switch context) · routable */}
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      aria-label={t.blocks.reorder}
                                      className="-ml-1 shrink-0 cursor-grab touch-none text-muted-foreground transition-colors hover:text-foreground active:cursor-grabbing"
                                      {...attributes}
                                      {...listeners}
                                    >
                                      <GripVertical className="size-4" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleSelectPage(page.id)}
                                      className={`flex-grow text-left text-sm transition-colors ${isActive ? 'font-medium text-primary' : page.visible ? 'text-foreground' : 'text-muted-foreground'
                                        }`}
                                    >
                                      {page.name || '(untitled page)'}
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

                                  {/* Row 2: menu placement and menu label, independent from page name. */}
                                  <div className="mt-2 flex items-center gap-2 pl-1">
                                    <select
                                      aria-label="Menu placement"
                                      value={!page.menu ? 'none' : page.menu.placement === 'footer' ? 'footer' : 'header'}
                                      onChange={(event) => handlePageMenuPlacement(page.id, event.target.value as MenuPlacement)}
                                      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                                    >
                                      <option value="none">None</option>
                                      <option value="header">Header</option>
                                      <option value="footer">Footer</option>
                                    </select>
                                    <Input
                                      value={page.menu?.label ?? ''}
                                      onChange={(e) => handleRelabelMenuItem(page.id, e.target.value)}
                                      disabled={!page.menu}
                                      placeholder={t.pages.namePlaceholder}
                                      className="h-8 flex-grow"
                                    />
                                  </div>
                                  <Input
                                    value={page.name}
                                    onChange={(event) => handleRenamePage(page.id, event.target.value)}
                                    placeholder={t.pages.namePlaceholder}
                                    className="mt-2 h-8"
                                  />
                                </>
                              )}
                            </SortableRow>
                          );
                        })}
                      </ul>
                    </SortableContext>
                  </DndContext>
                </div>
              )}

              {/* Hierarchy */}
              <div>
                <h3 className="mb-4 text-sm font-semibold text-foreground">
                  {isMulti ? (
                    <>
                      {t.blocks.blocksLabel}{' '}
                      <span className="font-normal text-muted-foreground">· {activePage?.name ?? ''}</span>
                    </>
                  ) : (
                    t.blocks.hierarchy
                  )}
                </h3>
                {isMulti ? (
                  <ul className="space-y-3">
                    {displayedBlocks.map((section) => {
                      const isSelected = selectedSectionId === section.id;
                      return (
                        <li
                          key={section.id}
                          className={`rounded-md border transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'border-border'
                            }`}
                        >
                          <div className="flex items-center gap-2 p-3">
                            <button
                              type="button"
                              onClick={() => setSelectedSectionId(isSelected ? null : section.id)}
                              className={`flex-grow text-left text-sm transition-colors ${isSelected ? 'font-medium text-primary' : section.visible ? 'text-foreground' : 'text-muted-foreground'
                                }`}
                            >
                              {section.type.charAt(0).toUpperCase() + section.type.slice(1).replace(/-/g, ' ')}
                            </button>
                            <button
                              type="button"
                              aria-label={section.visible ? t.blocks.hide : t.blocks.show}
                              title={section.visible ? t.blocks.visibleOnPage : t.blocks.hiddenFromPage}
                              onClick={() => handleToggleSectionVisible(section.id)}
                              className={`shrink-0 transition-colors ${section.visible ? 'text-foreground hover:text-primary' : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                              {section.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                            </button>
                          </div>
                          {isSelected && (
                            <div className="border-t border-border p-3">
                              <SectionFields
                                section={section}
                                schema={templateModule?.library[section.type]?.meta.fieldsSchema}
                                onFieldChange={handleFieldChange}
                                onError={setActionError}
                                issues={issueIndex.fields}
                              />
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={singleSections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                    <ul className="space-y-3">
                      {singleSections.map((section) => {
                        const pinned = isSinglePinned(section);
                        const isSelected = selectedSectionId === section.id;
                        return (
                          <SortableRow
                            key={section.id}
                            id={section.id}
                            disabled={pinned}
                            className={(isDragging) =>
                              `rounded-md border p-3 transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'border-border'} ${isDragging ? 'shadow-lg' : ''}`
                            }
                          >
                            {({ attributes, listeners }) => (
                              <>
                                {/* Row 1: drag/pin · name · page visibility */}
                                <div className="flex items-center gap-2">
                                  {pinned ? (
                                    <span
                                      className="shrink-0 text-muted-foreground"
                                      title={section.type === 'nav' ? t.blocks.pinnedTop : t.blocks.pinnedBottom}
                                    >
                                      <Pin className="size-3.5" />
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      aria-label={t.blocks.reorder}
                                      className="-ml-1 shrink-0 cursor-grab touch-none text-muted-foreground transition-colors hover:text-foreground active:cursor-grabbing"
                                      {...attributes}
                                      {...listeners}
                                    >
                                      <GripVertical className="size-4" />
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => setSelectedSectionId(isSelected ? null : section.id)}
                                    className={`flex-grow text-left text-sm transition-colors ${isSelected ? 'font-medium text-primary' : section.visible ? 'text-foreground' : 'text-muted-foreground'
                                      }`}
                                  >
                                    {section.type.charAt(0).toUpperCase() + section.type.slice(1).replace(/-/g, ' ')}
                                  </button>

                                  <button
                                    type="button"
                                    aria-label={section.visible ? t.blocks.hide : t.blocks.show}
                                    title={section.visible ? t.blocks.visibleOnPage : t.blocks.hiddenFromPage}
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
                                    aria-label={section.menu ? t.blocks.removeFromMenu : t.blocks.addToMenu}
                                    title={section.menu ? t.blocks.inNavMenuTitle : t.blocks.notInNavMenuTitle}
                                    onClick={() => handleToggleSingleMenu(section.id)}
                                    className={`shrink-0 transition-colors ${section.menu ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                      }`}
                                  >
                                    {section.menu ? <ToggleRight className="size-5" /> : <ToggleLeft className="size-5" />}
                                  </button>
                                  <span className="shrink-0 text-xs text-muted-foreground">
                                    {t.blocks.menu}
                                  </span>
                                  <Input
                                    value={section.menu?.label ?? ''}
                                    onChange={(e) => handleRelabelMenuItem(section.id, e.target.value)}
                                    disabled={!section.menu}
                                    placeholder={t.blocks.menuLabelPlaceholder}
                                    className="h-8 flex-grow"
                                  />
                                </div>

                                {/* Accordion: editable fields, inline under the selected section */}
                                {isSelected && (
                                  <div className="mt-3 border-t border-border pt-3">
                                    <SectionFields
                                      section={section}
                                      schema={templateModule?.library[section.type]?.meta.fieldsSchema}
                                      onFieldChange={handleFieldChange}
                                      onError={setActionError}
                                      issues={issueIndex.fields}
                                    />
                                  </div>
                                )}
                              </>
                            )}
                          </SortableRow>
                        );
                      })}
                    </ul>
                  </SortableContext>
                </DndContext>
                )}
              </div>

            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-foreground">
                {t.design.globalHeading}
              </h3>
              <GlobalStylesEditor
                globalStyles={content.globalStyles}
                onChange={handleGlobalStyleChange}
                issues={issueIndex.globalStyles}
                templateDefaults={templateModule?.defaultContent.globalStyles}
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
              <a href="/dashboard/projects" className="mx-1 font-medium underline hover:text-warning/80">
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
      <section className="relative flex flex-grow flex-col overflow-hidden border border-border bg-muted/30 p-3">
        <div className="absolute left-3 top-3 z-10 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
          {t.preview.label}
        </div>

        <div className="flex-grow overflow-hidden">
          {loadingError ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <CircleAlert className="mb-4 size-10 text-destructive" />
              <p className="mb-2 font-medium text-destructive">{t.loadError.heading}</p>
              <p className="max-w-xs text-sm text-muted-foreground">{loadingError}</p>
            </div>
          ) : TemplateRenderer ? (
            <EditorPreviewFrame
              TemplateRenderer={TemplateRenderer}
              content={content}
              selectedSectionId={selectedSectionId}
              activePageId={activePageId}
              onSectionClick={handleSectionClick}
              themeVariables={themeVariables}
            />
          ) : (
            <div className="flex h-full animate-pulse items-center justify-center text-sm text-muted-foreground">
              {t.preview.loadingRenderer}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

/**
 * A sortable `<li>` for the hierarchy / pages lists. Owns the @dnd-kit wiring
 * (transform/transition + drag state) and exposes the drag-handle props via a
 * render prop, so the rich item content stays inline in the editor (closing over
 * its handlers). `disabled` keeps Single's pinned nav/footer out of the drag.
 */
function SortableRow({
  id,
  disabled,
  className,
  children,
}: {
  id: string;
  disabled?: boolean;
  className?: string | ((isDragging: boolean) => string);
  children: (handle: {
    attributes: React.HTMLAttributes<HTMLElement>;
    listeners: Record<string, (event: unknown) => void> | undefined;
    isDragging: boolean;
  }) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : undefined,
    zIndex: isDragging ? 20 : undefined,
    position: isDragging ? 'relative' : undefined,
  };
  return (
    <li
      ref={setNodeRef}
      style={style}
      className={typeof className === 'function' ? className(isDragging) : className}
    >
      {children({ attributes: attributes as React.HTMLAttributes<HTMLElement>, listeners: listeners as Record<string, (event: unknown) => void> | undefined, isDragging })}
    </li>
  );
}
