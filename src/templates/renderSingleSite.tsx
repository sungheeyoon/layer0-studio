import React, { ComponentType } from 'react';
import { TemplateRendererProps, TemplateLibrary, DesignTokens, NavSectionProps } from './types';
import { tokensToCssVars } from '@/lib/template/design-tokens';
import { isSingleTemplate, deriveNav } from '@/domain/entities/template.entity';

interface RenderSingleSiteProps extends TemplateRendererProps {
  library: TemplateLibrary;
  className?: string;
  itemClassName?: (sectionId: string) => string;
  /**
   * Rich design tokens. When provided, the root div carries
   * `style={tokensToCssVars(designTokens, siteJson.globalStyles)}` so every
   * descendant `var(--color-*)` / `var(--font-*)` reference resolves to the
   * template's palette, with user globalStyles overrides applied on top.
   */
  designTokens?: DesignTokens;
}

/**
 * Renderer for a **Single** Site — iterates the Site's `sections[]` directly
 * (one continuous scroll) and looks each up in the template library by `type`.
 * Multi-mode rendering is a separate entrypoint (Phase 2). See ADR-0007.
 */
export function RenderSingleSite({
  siteJson,
  selectedSectionId,
  onSectionClick,
  library,
  className,
  itemClassName,
  designTokens,
}: RenderSingleSiteProps) {
  const sections = isSingleTemplate(siteJson) ? siteJson.sections : [];

  // nav = projection of the sections (anchor scroll). The wrapper `<div
  // id="section-${id}">` below is the anchor target. See ADR-0007 §3.1.
  const navItems = deriveNav(sections, (s) => `#section-${s.id}`);

  const rootStyle = designTokens
    ? tokensToCssVars(designTokens, siteJson.globalStyles)
    : undefined;

  return (
    <div className={className} style={rootStyle}>
      {sections.map((section) => {
        if (!section.visible) return null;

        const entry = library[section.type];
        if (!entry) {
          console.warn(`[RenderSingleSite] Component not found for type: ${section.type}`);
          return null;
        }
        const Component = entry.Component;
        const isSelected = selectedSectionId === section.id;

        // Inject the derived menu directly into the known nav section
        // (`type === 'nav'`); all other sections take plain section props.
        const inner =
          section.type === 'nav' ? (
            React.createElement(Component as ComponentType<NavSectionProps>, {
              section,
              isSelected,
              navItems,
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
      })}
    </div>
  );
}
