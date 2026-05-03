import React from 'react';
import { ThemeRendererProps, ThemeLibrary } from '../types';
import styles from './fitness.module.css';
import { fitnessLibrary } from './library';
import { RenderComposition } from '../renderComposition';
import { defaultGlobalStyles } from './tokens';
import { TemplateJson } from '@/domain/entities/template.entity';

export const library: ThemeLibrary = fitnessLibrary;

export const defaultTemplateJson: TemplateJson = {
  themeKey: 'fitness',
  globalStyles: defaultGlobalStyles,
  pages: [
    {
      id: 'home',
      title: 'Home',
      slug: '/',
      order: 0,
      sections: [], // Empty skeleton; presets provide composition
    },
  ],
};

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
