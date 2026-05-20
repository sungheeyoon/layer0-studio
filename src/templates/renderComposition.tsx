import React from 'react';
import { TemplateRendererProps, TemplateLibrary, DesignTokens } from './types';
import { tokensToCssVars } from '@/lib/template/design-tokens';

interface RenderCompositionProps extends TemplateRendererProps {
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
 * Generic renderer for the Composition model.
 *
 * Instead of iterating over 'slots', it iterates over the actual 'sections'
 * defined in the siteJson and looks them up in the library.
 */
export function RenderComposition({
  siteJson,
  selectedSectionId,
  onSectionClick,
  activePageId,
  library,
  className,
  itemClassName,
  designTokens,
}: RenderCompositionProps) {
  const page = activePageId
    ? siteJson.pages.find(p => p.id === activePageId)
    : siteJson.pages[0];

  const sections = page?.sections || [];

  const rootStyle = designTokens
    ? tokensToCssVars(designTokens, siteJson.globalStyles)
    : undefined;

  return (
    <div className={className} style={rootStyle}>
      {sections.map((section) => {
        if (!section.visible) return null;

        const entry = library[section.type];
        if (!entry) {
          console.warn(`[RenderComposition] Component not found for type: ${section.type}`);
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
