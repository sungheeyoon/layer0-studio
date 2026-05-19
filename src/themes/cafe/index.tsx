import React from 'react';
import { TemplateRendererProps, TemplateLibrary } from '../types';
import styles from './cafe.module.css';
import { cafeLibrary } from './library';
import { RenderComposition } from '../renderComposition';
import { defaultGlobalStyles } from './tokens';
import { TemplateJson } from '@/domain/entities/template.entity';

export const library: TemplateLibrary = cafeLibrary;

export const defaultTemplateJson: TemplateJson = {
  templateKey: 'cafe',
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

export default function CafeTheme(props: TemplateRendererProps) {
  return (
    <RenderComposition
      {...props}
      library={library}
      className={styles.themeRoot}
      itemClassName={(id) => props.selectedSectionId === id ? styles.selectedSlot : ''}
    />
  );
}
