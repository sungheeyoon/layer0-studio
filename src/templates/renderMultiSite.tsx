import React, { ComponentType } from 'react';
import { TemplateRendererProps, TemplateLibrary, DesignTokens, NavSectionProps } from './types';
import { tokensToCssVars } from '@/lib/template/design-tokens';
import {
  isMultiContent,
  deriveNav,
  deriveFooterNav,
  Section,
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
 * Renderer for a **Multi** Site — assembles `shared.header → active page's
 * sections → shared.footer` for one page at a time. The active page is chosen
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
  const { shared, pages } = content;

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

  const renderSection = (section: Section) => {
    if (!section.visible) return null;

    const entry = library[section.type];
    if (!entry) {
      console.warn(`[RenderMultiSite] Component not found for type: ${section.type}`);
      return null;
    }
    const Component = entry.Component;
    const isSelected = selectedSectionId === section.id;

    // Inject the derived page links into the known nav-driving sections: the
    // top nav (`type === 'nav'`, in shared.header) gets the in-nav pages; the
    // footer (`type === 'footer'`) gets the reachable-but-hidden pages. All
    // other sections take plain props. See PLAN_multipage §3.3 / §6 (E).
    const injected =
      section.type === 'nav' ? navItems : section.type === 'footer' ? footerItems : null;
    const inner =
      injected !== null ? (
        React.createElement(Component as ComponentType<NavSectionProps>, {
          section,
          isSelected,
          navItems: injected,
        })
      ) : (
        <Component section={section} isSelected={isSelected} />
      );

    return (
      <div
        key={section.id}
        id={`section-${section.id}`}
        {...(onSectionClick ? {
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            onSectionClick(section.id);
          }
        } : {})}
        className={itemClassName?.(section.id) || ''}
      >
        {inner}
      </div>
    );
  };

  return (
    <div className={className} style={rootStyle}>
      {shared.header.map(renderSection)}
      {activePage?.sections.map(renderSection)}
      {shared.footer.map(renderSection)}
    </div>
  );
}
