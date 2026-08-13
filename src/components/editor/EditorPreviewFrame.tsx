'use client';

import React, { useEffect, useLayoutEffect, useRef, useState, type ComponentType } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { TemplateRendererProps } from '@/templates/types';
import type { ContentModel } from '@/domain/entities/template.entity';

/**
 * Fixed desktop viewport the preview renders at, then `transform: scale()`-d
 * *down* to fit the editor's preview panel. Rendering inline in the panel would
 * resolve `vh`/breakpoints against the (smaller) panel, not a real screen — the
 * iframe gives us a real 1440×900 desktop viewport regardless of panel size.
 *
 * Both dimensions are fixed on purpose: the preview is a proportionally correct
 * *miniature* of a desktop browser window, not a panel-shaped one. `100vh` inside
 * the frame is 900 logical px — the same fraction of the fold a real desktop
 * visitor sees — so heroes crop identically.
 *
 * - `scale = min(panelW / 1440, panelH / 900, 1)` — contain-fit, uniform (never
 *   distorts) and capped at 1 so a wide monitor never *magnifies* past 1:1.
 *   Leftover panel space becomes letterbox margin around the centered frame.
 * - The iframe keeps its own 1440×900 viewport, so it stays the *only* scroller
 *   (no double/outer scrollbar) — scrolling it mirrors scrolling a real window.
 */
export type PreviewViewport = 'desktop' | 'mobile';

export const PREVIEW_VIEWPORTS: Record<PreviewViewport, { width: number; height: number }> = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};

const CLONE_MARKER = 'data-editor-preview-clone';

interface EditorPreviewFrameProps {
  /** The dynamically-loaded template renderer (Single or Multi — same interface). */
  TemplateRenderer: ComponentType<TemplateRendererProps>;
  content: ContentModel;
  selectedSectionId: string | null;
  activePageId?: string;
  onSectionClick: (sectionId: string) => void;
  /** `--theme-*` custom properties — set on the iframe `<body>` so the template's
   *  `var(--theme-*)` references resolve inside the frame. */
  themeVariables: React.CSSProperties;
  viewport: PreviewViewport;
}

/**
 * Mirror the parent document's stylesheets into the iframe head. The editor
 * already renders the template inline elsewhere, so every Tailwind utility +
 * CSS-module class the template needs is already present in the parent document
 * — cloning guarantees style parity. Re-clone wholesale on any head mutation to
 * pick up Turbopack's dev HMR / dynamically-imported template CSS. Next emits
 * root-relative `<link href>` (resolves against origin even with no base URL) and
 * inline `<style>` (text copied verbatim), so both survive the clone.
 */
function syncHeadStyles(targetDoc: Document) {
  const targetHead = targetDoc.head;
  const sources = Array.from(document.head.querySelectorAll<HTMLElement>('style, link[rel="stylesheet"]'));
  const existing = Array.from(targetHead.querySelectorAll<HTMLElement>(`[${CLONE_MARKER}]`));
  const scrollTop = Math.max(targetDoc.documentElement.scrollTop, targetDoc.body.scrollTop);
  const scrollLeft = Math.max(targetDoc.documentElement.scrollLeft, targetDoc.body.scrollLeft);

  sources.forEach((source, index) => {
    const current = existing[index];
    const desired = source.cloneNode(true) as HTMLElement;
    desired.setAttribute(CLONE_MARKER, '');

    if (!current) {
      targetHead.appendChild(desired);
      return;
    }

    if (current.tagName !== desired.tagName) {
      current.replaceWith(desired);
      return;
    }

    // Reconcile in place. Removing every stylesheet before cloning the new set
    // briefly collapses the iframe document; browsers clamp its scroll position
    // to zero during that unstyled frame. Keeping unchanged nodes also avoids
    // re-downloading linked CSS after an unrelated Next.js head update.
    for (const attribute of Array.from(current.attributes)) {
      if (!desired.hasAttribute(attribute.name)) current.removeAttribute(attribute.name);
    }
    for (const attribute of Array.from(desired.attributes)) {
      if (current.getAttribute(attribute.name) !== attribute.value) {
        current.setAttribute(attribute.name, attribute.value);
      }
    }
    if (current.textContent !== desired.textContent) current.textContent = desired.textContent;
  });

  existing.slice(sources.length).forEach((node) => node.remove());

  // CSS updates can legitimately change document height. Restore the user's
  // position after layout settles instead of letting an intermediate short
  // layout pull the preview back to the top.
  requestAnimationFrame(() => {
    targetDoc.documentElement.scrollTop = scrollTop;
    targetDoc.documentElement.scrollLeft = scrollLeft;
    targetDoc.body.scrollTop = scrollTop;
    targetDoc.body.scrollLeft = scrollLeft;
  });
}

export default function EditorPreviewFrame({
  TemplateRenderer,
  content,
  selectedSectionId,
  activePageId,
  onSectionClick,
  themeVariables,
  viewport,
}: EditorPreviewFrameProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const rootRef = useRef<Root | null>(null);
  const renderedPageRef = useRef<string | undefined>(activePageId);
  const [ready, setReady] = useState(false);
  const [panel, setPanel] = useState({ w: 0, h: 0 });

  // Contain-fit the fixed desktop viewport into the panel (uniform — never
  // distorts), capped at 1:1 so a wide panel doesn't magnify. See header comment.
  const logicalViewport = PREVIEW_VIEWPORTS[viewport];
  const scale =
    panel.w && panel.h
      ? Math.min(
          panel.w / logicalViewport.width,
          panel.h / logicalViewport.height,
          1,
        )
      : 1;

  // ── Measure the panel to size & scale the canvas ──────────────────────────
  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const update = () => setPanel({ w: wrapper.clientWidth, h: wrapper.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, []);

  // ── One-time iframe setup: styles, click-guard, dedicated React root ───────
  // A srcless same-origin iframe's `about:blank` document is available
  // synchronously by the time this effect runs, and its `load` event may have
  // already fired before React attached a handler — so init directly here (an
  // `initedRef` guard keeps it idempotent if `load` also fires).
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let inited = false;
    let rafId = 0;
    let styleObserver: MutationObserver | null = null;
    let clickGuard: ((e: MouseEvent) => void) | null = null;
    let mount: HTMLDivElement | null = null;

    const init = () => {
      const doc = iframe.contentDocument;
      if (inited || !doc || !doc.body) return;
      inited = true;

      doc.documentElement.style.height = '100%';
      doc.body.style.margin = '0';

      const scheduleSync = () => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => syncHeadStyles(doc));
      };
      syncHeadStyles(doc);
      styleObserver = new MutationObserver(scheduleSync);
      styleObserver.observe(document.head, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      // Block all anchor activation in the editor preview — both `#`-anchor
      // scroll and `href` navigation (a click should only select the section).
      clickGuard = (e: MouseEvent) => {
        if ((e.target as HTMLElement).closest('a')) e.preventDefault();
      };
      doc.addEventListener('click', clickGuard, true);

      mount = doc.createElement('div');
      doc.body.appendChild(mount);
      rootRef.current = createRoot(mount);
      setReady(true);
    };

    init();
    iframe.addEventListener('load', init);

    return () => {
      iframe.removeEventListener('load', init);
      cancelAnimationFrame(rafId);
      styleObserver?.disconnect();
      if (clickGuard) iframe.contentDocument?.removeEventListener('click', clickGuard, true);
      const root = rootRef.current;
      const mountNode = mount;
      rootRef.current = null;
      // Defer unmount so it never runs during the parent's render/commit.
      setTimeout(() => {
        root?.unmount();
        mountNode?.remove();
      }, 0);
    };
  }, []);

  // ── Push props into the dedicated root on every change (live edit) ─────────
  useEffect(() => {
    if (!ready || !rootRef.current) return;
    const doc = iframeRef.current?.contentDocument;
    const preserveScroll = renderedPageRef.current === activePageId;
    const scrollTop = doc
      ? Math.max(doc.documentElement.scrollTop, doc.body.scrollTop)
      : 0;
    const scrollLeft = doc
      ? Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft)
      : 0;
    renderedPageRef.current = activePageId;
    if (doc) {
      Object.entries(themeVariables).forEach(([key, value]) => {
        doc.body.style.setProperty(key, String(value));
      });
    }
    rootRef.current.render(
      <TemplateRenderer
        content={content}
        selectedSectionId={selectedSectionId}
        onSectionClick={onSectionClick}
        activePageId={activePageId}
      />,
    );
    if (doc) {
      requestAnimationFrame(() => {
        const nextTop = preserveScroll ? scrollTop : 0;
        const nextLeft = preserveScroll ? scrollLeft : 0;
        doc.documentElement.scrollTop = nextTop;
        doc.documentElement.scrollLeft = nextLeft;
        doc.body.scrollTop = nextTop;
        doc.body.scrollLeft = nextLeft;
      });
    }
  }, [
    ready,
    TemplateRenderer,
    content,
    selectedSectionId,
    activePageId,
    onSectionClick,
    themeVariables,
  ]);

  return (
    // No outer scroll — the scaled canvas is letterboxed inside the panel and the
    // iframe is the only scroller.
    <div ref={wrapperRef} className="flex h-full w-full items-center justify-center overflow-hidden">
      {/* Placeholder = the *scaled* canvas footprint, floored so sub-pixel
          rounding never exceeds the panel. */}
      <div
        style={{
          width: Math.floor(logicalViewport.width * scale),
          height: Math.floor(logicalViewport.height * scale),
        }}
        className="shrink-0 overflow-hidden rounded-md shadow-2xl"
      >
        <iframe
          ref={iframeRef}
          title="preview"
          style={{
            width: logicalViewport.width,
            height: logicalViewport.height,
            border: 0,
            backgroundColor: 'white',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        />
      </div>
    </div>
  );
}
