import React, { ComponentType } from 'react';
import { ThemeRendererProps, ThemeSectionProps, ThemeLibrary } from '../types';
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
import { buildLibraryFromSlots } from '../library/buildLibraryFromSlots';
import { RenderComposition } from '../renderComposition';

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

export const library: ThemeLibrary = buildLibraryFromSlots(slots, sectionComponentMap, defaultTemplateJson);

export { slots, defaultTemplateJson };

export default function FitnessTheme(props: ThemeRendererProps) {
  return (
    <RenderComposition
      {...props}
      library={library}
      className={styles.themeRoot}
      itemClassName={(id) => props.selectedSectionId === id ? styles.selectedSlot : ''}
    />
  );
}
