import React from 'react';
import { ThemeRendererProps, ThemeLibrary } from './types';

interface RenderCompositionProps extends ThemeRendererProps {
  library: ThemeLibrary;
  className?: string;
  itemClassName?: (sectionId: string) => string;
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
  itemClassName
}: RenderCompositionProps) {
  const page = activePageId
    ? siteJson.pages.find(p => p.id === activePageId)
    : siteJson.pages[0];
  
  const sections = page?.sections || [];

  return (
    <div className={className}>
      {sections.map((section) => {
        if (!section.visible) return null;

        const Component = library[section.type];
        if (!Component) {
          console.warn(`[RenderComposition] Component not found for type: ${section.type}`);
          return null;
        }

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
