import React, { ComponentType } from 'react';
import { TemplateRendererProps, TemplateLibrary, DesignTokens, NavBlockProps } from './types';
import { tokensToCssVars } from '@/lib/template/design-tokens';
import {
  isMultiContent,
  deriveNav,
  deriveFooterNav,
  Block,
  Page,
} from '@/domain/entities/template.entity';

interface RenderMultiSiteProps extends TemplateRendererProps {
  library: TemplateLibrary;
  className?: string;
  itemClassName?: (sectionId: string) => string;
  /** See renderSingleSite — rich tokens injected as CSS custom properties. */
  designTokens?: DesignTokens;
}

/**
 * Renderer for a **Multi** Site — assembles `chrome.header → active page's
 * blocks → chrome.footer` for one page at a time. The active page is chosen
 * by `activePageId` (the route resolves it from the slug); it falls back to the
 * first page (the home page reached at the empty slug). See ADR-0007 / PLAN §3.
 *
 * nav = projection of the **pages** (page-link navigation, not anchors): the
 * home page links to `basePath`, every other page to `${basePath}/${slug}`.
 */
export function RenderMultiSite({
  content,
  selectedSectionId,
  onSectionClick,
  activePageId,
  basePath = '',
  library,
  className,
  itemClassName,
  designTokens,
}: RenderMultiSiteProps) {
  if (!isMultiContent(content)) return null;
  const { chrome, pages } = content;

  // First page = home (served at the empty slug); others at `${basePath}/${slug}`.
  const homeId = pages[0]?.id;
  const hrefOf = (p: Page) =>
    p.id === homeId ? basePath || '/' : `${basePath}/${p.slug}`;
  const navItems = deriveNav(pages, hrefOf);
  // Footer links the reachable-but-not-in-top-nav pages (privacy/terms).
  const footerItems = deriveFooterNav(pages, hrefOf);

  const activePage =
    pages.find((p) => p.id === activePageId) ?? pages[0];

  const rootStyle = designTokens
    ? tokensToCssVars(designTokens, content.globalStyles)
    : undefined;

  const renderBlock = (block: Block) => {
    if (!block.visible) return null;

    const entry = library[block.type];
    if (!entry) {
      console.warn(`[RenderMultiSite] Component not found for type: ${block.type}`);
      return null;
    }
    const Component = entry.Component;
    const isSelected = selectedSectionId === block.id;

    // Inject the derived page links into the known nav-driving blocks: the
    // top nav (`type === 'nav'`, in chrome.header) gets header-menu pages; the
    // footer (`type === 'footer'`) gets explicit footer-menu pages. All other
    // Blocks take ordinary props.
    const injected =
      block.type === 'nav' ? navItems : block.type === 'footer' ? footerItems : null;
    const inner =
      injected !== null ? (
        React.createElement(Component as ComponentType<NavBlockProps>, {
          block,
          isSelected,
          navItems: injected,
        })
      ) : (
        <Component block={block} isSelected={isSelected} />
      );

    return (
      <div
        key={block.id}
        id={`section-${block.id}`}
        {...(onSectionClick ? {
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            onSectionClick(block.id);
          }
        } : {})}
        className={itemClassName?.(block.id) || ''}
      >
        {inner}
      </div>
    );
  };

  return (
    <div className={className} style={rootStyle}>
      {chrome.header.map(renderBlock)}
      {activePage?.blocks.map(renderBlock)}
      {chrome.footer.map(renderBlock)}
    </div>
  );
}
