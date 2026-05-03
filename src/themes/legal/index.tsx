import React, { ComponentType } from 'react';
import { ThemeRendererProps, ThemeSectionProps, ThemeLibrary } from '../types';
import { slots, defaultTemplateJson } from './slots';
import NavSection from './sections/NavSection';
import HeroSection from './sections/HeroSection';
import TrustStripSection from './sections/TrustStripSection';
import ServicesSection from './sections/ServicesSection';
import AboutSection from './sections/AboutSection';
import TeamSection from './sections/TeamSection';
import ProcessSection from './sections/ProcessSection';
import TestimonialsSection from './sections/TestimonialsSection';
import FaqSection from './sections/FaqSection';
import ContactSection from './sections/ContactSection';
import FooterSection from './sections/FooterSection';
import styles from './legal.module.css';
import { buildLibraryFromSlots } from '../library/buildLibraryFromSlots';
import { RenderComposition } from '../renderComposition';

const sectionComponentMap: Record<string, ComponentType<ThemeSectionProps>> = {
  nav: NavSection,
  hero: HeroSection,
  'trust-strip': TrustStripSection,
  services: ServicesSection,
  about: AboutSection,
  team: TeamSection,
  process: ProcessSection,
  testimonials: TestimonialsSection,
  faq: FaqSection,
  contact: ContactSection,
  footer: FooterSection,
};

export const library: ThemeLibrary = buildLibraryFromSlots(slots, sectionComponentMap, defaultTemplateJson);

export { slots, defaultTemplateJson };

export default function LegalTheme(props: ThemeRendererProps) {
  return (
    <RenderComposition
      {...props}
      library={library}
      className={styles.themeRoot}
      itemClassName={(id) => props.selectedSectionId === id ? styles.selectedSlot : ''}
    />
  );
}
