import React, { ComponentType } from 'react';
import { ThemeRendererProps, ThemeSectionProps, ThemeLibrary } from '../types';
import { slots, defaultTemplateJson } from './slots';
import NavSection from './sections/NavSection';
import HeroSection from './sections/HeroSection';
import MarqueeSection from './sections/MarqueeSection';
import ServicesSection from './sections/ServicesSection';
import SpaceSection from './sections/SpaceSection';
import WhySection from './sections/WhySection';
import TeamSection from './sections/TeamSection';
import TestimonialsSection from './sections/TestimonialsSection';
import BookingSection from './sections/BookingSection';
import FooterSection from './sections/FooterSection';
import styles from './medical.module.css';
import { buildLibraryFromSlots } from '../library/buildLibraryFromSlots';
import { RenderComposition } from '../renderComposition';

const sectionComponentMap: Record<string, ComponentType<ThemeSectionProps>> = {
  nav: NavSection,
  hero: HeroSection,
  marquee: MarqueeSection,
  services: ServicesSection,
  space: SpaceSection,
  why: WhySection,
  team: TeamSection,
  testimonials: TestimonialsSection,
  booking: BookingSection,
  footer: FooterSection,
};

export const library: ThemeLibrary = buildLibraryFromSlots(slots, sectionComponentMap, defaultTemplateJson);

export { slots, defaultTemplateJson };

export default function MedicalTheme(props: ThemeRendererProps) {
  return (
    <RenderComposition
      {...props}
      library={library}
      className={styles.themeRoot}
      itemClassName={(id) => props.selectedSectionId === id ? styles.selectedSlot : ''}
    />
  );
}
