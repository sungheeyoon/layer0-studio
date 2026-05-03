import React, { ComponentType } from 'react';
import { ThemeRendererProps, ThemeSectionProps, ThemeLibrary } from '../types';
import { slots, defaultTemplateJson } from './slots';
import HeroSection from './sections/HeroSection';
import AboutSection from './sections/AboutSection';
import FeaturesSection from './sections/FeaturesSection';
import ContactSection from './sections/ContactSection';
import FooterSection from './sections/FooterSection';
import styles from './corporate.module.css';
import { buildLibraryFromSlots } from '../library/buildLibraryFromSlots';
import { RenderComposition } from '../renderComposition';

const sectionComponentMap: Record<string, ComponentType<ThemeSectionProps>> = {
  hero: HeroSection,
  about: AboutSection,
  features: FeaturesSection,
  contact: ContactSection,
  footer: FooterSection,
};

export const library: ThemeLibrary = buildLibraryFromSlots(slots, sectionComponentMap, defaultTemplateJson);

export { slots, defaultTemplateJson };

export default function CorporateTheme(props: ThemeRendererProps) {
  return (
    <RenderComposition
      {...props}
      library={library}
      className={styles.themeRoot}
      itemClassName={(id) => props.selectedSectionId === id ? styles.selectedSlot : ''}
    />
  );
}
