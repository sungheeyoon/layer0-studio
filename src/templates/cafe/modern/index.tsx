import React from 'react';
import { TemplateRendererProps, TemplateLibrary } from '../../types';
import styles from './cafe.module.css';
import { cafeModernLibrary } from './library';
import { RenderSingleSite } from '../../renderSingleSite';
import { defaultGlobalStyles } from './tokens';
import { ContentModel } from '@/domain/entities/template.entity';

export const library: TemplateLibrary = cafeModernLibrary;

export const defaultContent: ContentModel = {
  mode: 'single',
  templateKey: 'cafe-modern',
  globalStyles: defaultGlobalStyles,
  sections: [], // Empty skeleton; presets provide the sections
};

export default function CafeModernTemplate(props: TemplateRendererProps) {
  return (
    <RenderSingleSite
      {...props}
      library={library}
      className={styles.themeRoot}
      itemClassName={(id) => props.selectedSectionId === id ? styles.selectedSlot : ''}
    />
  );
}
