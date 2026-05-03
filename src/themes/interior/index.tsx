import React, { ComponentType } from 'react';
import { ThemeRendererProps, ThemeSectionProps, ThemeLibrary } from '../types';
import { slots, defaultTemplateJson } from './slots';
import NavSection from './sections/NavSection';
import HeroSection from './sections/HeroSection';
import StatsSection from './sections/StatsSection';
import AboutSection from './sections/AboutSection';
import ServicesSection from './sections/ServicesSection';
import PortfolioSection from './sections/PortfolioSection';
import ProcessSection from './sections/ProcessSection';
import TestimonialsSection from './sections/TestimonialsSection';
import ContactSection from './sections/ContactSection';
import FooterSection from './sections/FooterSection';
import styles from './interior.module.css';
import { buildLibraryFromSlots } from '../library/buildLibraryFromSlots';
import { RenderComposition } from '../renderComposition';

const sectionComponentMap: Record<string, ComponentType<ThemeSectionProps>> = {
  nav: NavSection,
  hero: HeroSection,
  stats: StatsSection,
  about: AboutSection,
  services: ServicesSection,
  portfolio: PortfolioSection,
  process: ProcessSection,
  testimonials: TestimonialsSection,
  contact: ContactSection,
  footer: FooterSection,
};

export const library: ThemeLibrary = buildLibraryFromSlots(slots, sectionComponentMap, defaultTemplateJson);

export { slots, defaultTemplateJson };

export default function InteriorTheme(props: ThemeRendererProps) {
  return (
    <RenderComposition
      {...props}
      library={library}
      className={styles.themeRoot}
      itemClassName={(id) => props.selectedSectionId === id ? styles.selectedSlot : ''}
    />
  );
}
