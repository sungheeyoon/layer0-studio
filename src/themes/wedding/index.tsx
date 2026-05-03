import React, { ComponentType } from 'react';
import { ThemeRendererProps, ThemeSectionProps, ThemeLibrary } from '../types';
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
import { buildLibraryFromSlots } from '../library/buildLibraryFromSlots';
import { RenderComposition } from '../renderComposition';

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

export const library: ThemeLibrary = buildLibraryFromSlots(slots, sectionComponentMap, defaultTemplateJson);

export { slots, defaultTemplateJson };

export default function WeddingTheme(props: ThemeRendererProps) {
  return (
    <RenderComposition
      {...props}
      library={library}
      className={`${styles.themeRoot} ${styles.grain}`}
      itemClassName={(id) => props.selectedSectionId === id ? styles.selectedSlot : ''}
    />
  );
}
