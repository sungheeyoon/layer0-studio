import React, { ComponentType } from 'react';
import { ThemeRendererProps, ThemeSectionProps } from '../types';
import { slots, defaultTemplateJson } from './slots';
import NavSection from './sections/NavSection';
import HeroSection from './sections/HeroSection';
import MarqueeSection from './sections/MarqueeSection';
import ProgramsSection from './sections/ProgramsSection';
import FacilitySection from './sections/FacilitySection';
import TrainersSection from './sections/TrainersSection';
import TestimonialsSection from './sections/TestimonialsSection';
import JoinSection from './sections/JoinSection';
import FooterSection from './sections/FooterSection';
import styles from './fitness.module.css';

const sectionComponentMap: Record<string, ComponentType<ThemeSectionProps>> = {
  nav: NavSection,
  hero: HeroSection,
  marquee: MarqueeSection,
  programs: ProgramsSection,
  facility: FacilitySection,
  trainers: TrainersSection,
  testimonials: TestimonialsSection,
  join: JoinSection,
  footer: FooterSection,
};

export { slots, defaultTemplateJson };

export default function FitnessTheme({ siteJson, selectedSectionId, onSectionClick, activePageId }: ThemeRendererProps) {
  const page = activePageId
    ? siteJson.pages.find(p => p.id === activePageId)
    : siteJson.pages[0];
  const sections = page?.sections || [];

  return (
    <div className={styles.themeRoot}>
      {slots.map((slot) => {
        const section = sections.find((s) => s.type === slot.type);
        if (!section || !section.visible) return null;

        const Component = sectionComponentMap[slot.type];
        if (!Component) return null;

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
