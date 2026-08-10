import React from 'react';
import { TemplateRendererProps, TemplateLibrary } from '../../types';
import styles from './cafe.module.css';
import { cafeCozyLibrary } from './library';
import { RenderSingleSite } from '../../renderSingleSite';
import { defaultGlobalStyles } from './tokens';
import { ContentModel } from '@/domain/entities/template.entity';

export const library: TemplateLibrary = cafeCozyLibrary;

export const defaultContent: ContentModel = {
  mode: 'single',
  templateKey: 'cafe-cozy',
  globalStyles: defaultGlobalStyles,
  blocks: [], // Empty skeleton; presets provide the sections
};

export default function CafeCozyTemplate(props: TemplateRendererProps) {
  return (
    <RenderSingleSite
      {...props}
      library={library}
      className={styles.themeRoot}
      itemClassName={(id) => props.selectedSectionId === id ? styles.selectedSlot : ''}
    />
  );
}
