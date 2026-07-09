import React from 'react';
import { TemplateRendererProps, TemplateLibrary } from '../../types';
import styles from './wedding.module.css';
import { weddingDefaultLibrary } from './library';
import { RenderSingleSite } from '../../renderSingleSite';
import { defaultGlobalStyles } from './tokens';
import { ContentModel } from '@/domain/entities/template.entity';

export const library: TemplateLibrary = weddingDefaultLibrary;

export const defaultTemplateJson: ContentModel = {
  mode: 'single',
  templateKey: 'wedding-default',
  globalStyles: defaultGlobalStyles,
  sections: [], // Empty skeleton; presets provide the sections
};

export default function WeddingDefaultTemplate(props: TemplateRendererProps) {
  return (
    <RenderSingleSite
      {...props}
      library={library}
      className={`${styles.themeRoot} ${styles.grain}`}
      itemClassName={(id) => props.selectedSectionId === id ? styles.selectedSlot : ''}
    />
  );
}
