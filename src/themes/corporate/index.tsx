import { ComponentType, useMemo } from 'react';
import { ThemeRendererProps, ThemeSectionProps } from '../types';
import { slots, defaultTemplateJson } from './slots';
import HeroSection from './sections/HeroSection';
import GenericSection from './sections/GenericSection';
import AboutSection from './sections/AboutSection';
import FeaturesSection from './sections/FeaturesSection';
import ContactSection from './sections/ContactSection';
import FooterSection from './sections/FooterSection';
import styles from './corporate.module.css';

const sectionComponentMap: Record<string, ComponentType<ThemeSectionProps>> = {
  hero: HeroSection,
  about: AboutSection,
  features: FeaturesSection,
  contact: ContactSection,
  footer: FooterSection,
};

export { slots, defaultTemplateJson };

export default function CorporateTheme({ siteJson, selectedSectionId, onSectionClick, activePageId }: ThemeRendererProps) {
  const sections = useMemo(() => {
    if (siteJson.pages && siteJson.pages.length > 0) {
      const page = activePageId 
        ? siteJson.pages.find(p => p.id === activePageId) 
        : siteJson.pages[0];
      return page?.sections || [];
    }
    return siteJson.sections || [];
  }, [siteJson, activePageId]);

  return (
    <div className={styles.themeRoot}>
      {slots.map((slot) => {
        const section = sections.find((s) => s.type === slot.type);
        if (!section || !section.visible) return null;
        
        const Component = sectionComponentMap[slot.type] || GenericSection;

        return (
          <div
            key={section.id}
            id={`section-${section.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onSectionClick?.(section.id);
            }}
            className={selectedSectionId === section.id ? styles.selectedSlot : ''}
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
