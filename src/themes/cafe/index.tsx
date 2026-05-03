import React, { ComponentType } from 'react';
import { ThemeRendererProps, ThemeSectionProps, ThemeLibrary } from '../types';
import { slots, defaultTemplateJson } from './slots';
import NavSection from './sections/NavSection';
import HeroSection from './sections/HeroSection';
import MarqueeSection from './sections/MarqueeSection';
import MenuSection from './sections/MenuSection';
import StorySection from './sections/StorySection';
import SpaceSection from './sections/SpaceSection';
import TestimonialsSection from './sections/TestimonialsSection';
import VisitSection from './sections/VisitSection';
import FooterSection from './sections/FooterSection';
import styles from './cafe.module.css';
import { buildLibraryFromSlots } from '../library/buildLibraryFromSlots';
import { RenderComposition } from '../renderComposition';

const sectionComponentMap: Record<string, ComponentType<ThemeSectionProps>> = {
  nav: NavSection,
  hero: HeroSection,
  marquee: MarqueeSection,
  menu: MenuSection,
  story: StorySection,
  space: SpaceSection,
  testimonials: TestimonialsSection,
  visit: VisitSection,
  footer: FooterSection,
};

export const library: ThemeLibrary = buildLibraryFromSlots(slots, sectionComponentMap, defaultTemplateJson);

export { slots, defaultTemplateJson };

export default function CafeTheme(props: ThemeRendererProps) {
  return (
    <RenderComposition
      {...props}
      library={library}
      className={styles.themeRoot}
      itemClassName={(id) => props.selectedSectionId === id ? styles.selectedSlot : ''}
    />
  );
}
