'use client';

import React, { useEffect, useLayoutEffect, useRef, useState, type ComponentType } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { TemplateRendererProps } from '@/templates/types';
import type { ContentModel } from '@/domain/entities/template.entity';

/**
 * Fixed desktop *width* the preview renders at, then `transform: scale()`-d to
 * fill the editor's preview panel. Rendering inline in the panel would resolve
 * `vh`/breakpoints against the (smaller) panel, not a real screen — the iframe
 * gives us a real 1440-wide desktop viewport regardless of panel size, and the
 * layout/breakpoints are always the consistent 1440 desktop view.
 *
 * - `scale = panelWidth / 1440` fills the panel width. It may exceed 1 on a wide
 *   monitor (the canvas is magnified) — `transform: scale()` is uniform, so this
 *   never distorts/stretches; the 1440 layout just renders larger.
 * - The iframe *height* is derived as `panelHeight / scale` so the scaled canvas
 *   exactly fills the panel height. That keeps the iframe the *only* scroller (no
 *   double/outer scrollbar regardless of scale) and makes `100vh` track the
 *   visible preview, so the hero fills the frame like a real browser window.
 */
const VIEWPORT_WIDTH = 1440;
const FALLBACK_HEIGHT = 900;

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
  targetHead.querySelectorAll(`[${CLONE_MARKER}]`).forEach((n) => n.remove());
  document.head
    .querySelectorAll('style, link[rel="stylesheet"]')
    .forEach((node) => {
      const clone = node.cloneNode(true) as HTMLElement;
      clone.setAttribute(CLONE_MARKER, '');
      targetHead.appendChild(clone);
    });
}

export default function EditorPreviewFrame({
  TemplateRenderer,
  content,
  selectedSectionId,
  activePageId,
  onSectionClick,
  themeVariables,
}: EditorPreviewFrameProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const rootRef = useRef<Root | null>(null);
  const [ready, setReady] = useState(false);
  const [panel, setPanel] = useState({ w: 0, h: 0 });

  // Scale to fill the panel width (uniform — never distorts; see header comment).
  const scale = panel.w ? panel.w / VIEWPORT_WIDTH : 1;
  // Derive the iframe's logical height so the scaled canvas fills the panel height
  // exactly → the iframe is the only scroller (no outer/double scrollbar).
  const frameHeight = panel.h ? Math.round(panel.h / scale) : FALLBACK_HEIGHT;

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
    // No outer scroll — the scaled canvas fills the panel and the iframe is the
    // only scroller.
    <div ref={wrapperRef} className="flex h-full w-full justify-center overflow-hidden">
      {/* Placeholder = the *scaled* canvas footprint (width floored so sub-pixel
          rounding never exceeds the panel; height = full panel height). */}
      <div
        style={{ width: Math.floor(VIEWPORT_WIDTH * scale), height: panel.h || FALLBACK_HEIGHT * scale }}
        className="shrink-0 shadow-2xl"
      >
        <iframe
          ref={iframeRef}
          title="preview"
          style={{
            width: VIEWPORT_WIDTH,
            height: frameHeight,
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
