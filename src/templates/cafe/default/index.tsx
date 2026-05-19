import React from 'react';
import { TemplateRendererProps, TemplateLibrary } from '../../types';
import styles from './cafe.module.css';
import { cafeDefaultLibrary } from './library';
import { RenderComposition } from '../../renderComposition';
import { defaultGlobalStyles } from './tokens';
import { TemplateJson } from '@/domain/entities/template.entity';

export const library: TemplateLibrary = cafeDefaultLibrary;

export const defaultTemplateJson: TemplateJson = {
  templateKey: 'cafe-default',
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

export default function CafeDefaultTemplate(props: TemplateRendererProps) {
  return (
    <RenderComposition
      {...props}
      library={library}
      className={styles.themeRoot}
      itemClassName={(id) => props.selectedSectionId === id ? styles.selectedSlot : ''}
    />
  );
}
