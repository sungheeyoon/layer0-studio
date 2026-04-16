import { ComponentType } from 'react';
import { ThemeRendererProps, ThemeSectionProps } from '../types';
import { slots } from './slots';
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

export { slots };

export default function CorporateTheme({ siteJson, selectedSectionId, onSectionClick }: ThemeRendererProps) {
  return (
    <div className={styles.themeRoot}>
      {slots.map((slot) => {
        const section = siteJson.sections.find((s) => s.type === slot.type);
        if (!section || !section.visible) return null;
        
        const Component = sectionComponentMap[slot.type] || GenericSection;

        return (
          <div
            key={section.id}
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
