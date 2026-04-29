import React, { ComponentType } from 'react';
import { ThemeRendererProps, ThemeSectionProps } from '../types';
import { slots, defaultTemplateJson } from './slots';
import NavSection from './sections/NavSection';
import HeroSection from './sections/HeroSection';
import PhilosophySection from './sections/PhilosophySection';
import ServicesSection from './sections/ServicesSection';
import GallerySection from './sections/GallerySection';
import ProcessSection from './sections/ProcessSection';
import PricingSection from './sections/PricingSection';
import TestimonialsSection from './sections/TestimonialsSection';
import FaqSection from './sections/FaqSection';
import ContactSection from './sections/ContactSection';
import FooterSection from './sections/FooterSection';
import styles from './wedding.module.css';

const sectionComponentMap: Record<string, ComponentType<ThemeSectionProps>> = {
  nav: NavSection,
  hero: HeroSection,
  philosophy: PhilosophySection,
  services: ServicesSection,
  gallery: GallerySection,
  process: ProcessSection,
  pricing: PricingSection,
  testimonials: TestimonialsSection,
  faq: FaqSection,
  contact: ContactSection,
  footer: FooterSection,
};

export { slots, defaultTemplateJson };

export default function WeddingTheme({ siteJson, selectedSectionId, onSectionClick, activePageId }: ThemeRendererProps) {
  const page = activePageId
    ? siteJson.pages.find((p) => p.id === activePageId)
    : siteJson.pages[0];
  const sections = page?.sections || [];

  return (
    <div className={`${styles.themeRoot} ${styles.grain}`}>
      {slots.map((slot) => {
        const section = sections.find((s) => s.type === slot.type);
        if (!section || !section.visible) return null;

        const Component = sectionComponentMap[slot.type];
        if (!Component) return null;

        return (
          <div
            key={section.id}
            id={`section-${section.id}`}
            {...(onSectionClick
              ? {
                  onClick: (e: React.MouseEvent) => {
                    e.stopPropagation();
                    onSectionClick(section.id);
                  },
                }
              : {})}
            className={selectedSectionId === section.id ? styles.selectedSlot : ''}
          >
            <Component section={section} isSelected={selectedSectionId === section.id} />
          </div>
        );
      })}
    </div>
  );
}
