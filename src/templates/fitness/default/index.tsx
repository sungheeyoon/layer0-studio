import React from 'react';
import { TemplateRendererProps, TemplateLibrary } from '../../types';
import styles from './fitness.module.css';
import { fitnessDefaultLibrary } from './library';
import { RenderSingleSite } from '../../renderSingleSite';
import { defaultGlobalStyles } from './tokens';
import { ContentModel } from '@/domain/entities/template.entity';

export const library: TemplateLibrary = fitnessDefaultLibrary;

export const defaultContent: ContentModel = {
  mode: 'single',
  templateKey: 'fitness-default',
  globalStyles: defaultGlobalStyles,
  sections: [], // Empty skeleton; presets provide the sections
};

export default function FitnessDefaultTemplate(props: TemplateRendererProps) {
  return (
    <RenderSingleSite
      {...props}
      library={library}
      className={styles.themeRoot}
      itemClassName={(id) => props.selectedSectionId === id ? styles.selectedSlot : ''}
    />
  );
}
