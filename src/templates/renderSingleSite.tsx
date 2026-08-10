import React, { ComponentType } from 'react';
import { TemplateRendererProps, TemplateLibrary, DesignTokens, NavBlockProps } from './types';
import { tokensToCssVars } from '@/lib/template/design-tokens';
import { isSingleContent, deriveNav } from '@/domain/entities/template.entity';

interface RenderSingleSiteProps extends TemplateRendererProps {
  library: TemplateLibrary;
  className?: string;
  itemClassName?: (sectionId: string) => string;
  /**
   * Rich design tokens. When provided, the root div carries
   * `style={tokensToCssVars(designTokens, content.globalStyles)}` so every
   * descendant `var(--color-*)` / `var(--font-*)` reference resolves to the
   * template's palette, with user globalStyles overrides applied on top.
   */
  designTokens?: DesignTokens;
}

/**
 * Renderer for a **Single** Site — iterates the Site's `blocks[]` directly
 * (one continuous scroll) and looks each up in the template library by `type`.
 * Multi-mode rendering is a separate entrypoint (Phase 2). See ADR-0007.
 */
export function RenderSingleSite({
  content,
  selectedSectionId,
  onSectionClick,
  library,
  className,
  itemClassName,
  designTokens,
}: RenderSingleSiteProps) {
  const blocks = isSingleContent(content) ? content.blocks : [];

  const navItems = deriveNav(blocks, (block) => `#section-${block.id}`);

  const rootStyle = designTokens
    ? tokensToCssVars(designTokens, content.globalStyles)
    : undefined;

  return (
    <div className={className} style={rootStyle}>
      {blocks.map((block) => {
        if (!block.visible) return null;

        const entry = library[block.type];
        if (!entry) {
          console.warn(`[RenderSingleSite] Component not found for type: ${block.type}`);
          return null;
        }
        const Component = entry.Component;
        const isSelected = selectedSectionId === block.id;

        // Inject the derived menu into the Block whose permanent componentKey
        // is `nav`; all other Blocks receive ordinary Block props.
        const inner =
          block.type === 'nav' ? (
            React.createElement(Component as ComponentType<NavBlockProps>, {
              block,
              isSelected,
              navItems,
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
      })}
    </div>
  );
}
