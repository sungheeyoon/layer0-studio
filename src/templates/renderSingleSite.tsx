import React from 'react';
import { TemplateRendererProps, TemplateLibrary, DesignTokens } from './types';
import { tokensToCssVars } from '@/lib/template/design-tokens';
import { isSingleTemplate } from '@/domain/entities/template.entity';

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
            <Component
              section={section}
              isSelected={selectedSectionId === section.id}
            />
          </div>
        );
      })}
    </div>
  );
}
