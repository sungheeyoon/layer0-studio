import React from 'react';
import { ThemeRendererProps, ThemeLibrary } from '../types';
import styles from './legal.module.css';
import { legalLibrary } from './library';
import { RenderComposition } from '../renderComposition';
import { defaultGlobalStyles } from './tokens';
import { TemplateJson } from '@/domain/entities/template.entity';

export const library: ThemeLibrary = legalLibrary;

export const defaultTemplateJson: TemplateJson = {
  themeKey: 'legal',
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
