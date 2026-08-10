import React from 'react';
import { TemplateRendererProps, TemplateLibrary } from '../../types';
import styles from './legal.module.css';
import { legalDefaultLibrary } from './library';
import { RenderSingleSite } from '../../renderSingleSite';
import { defaultGlobalStyles } from './tokens';
import { ContentModel } from '@/domain/entities/template.entity';

export const library: TemplateLibrary = legalDefaultLibrary;

export const defaultContent: ContentModel = {
  mode: 'single',
  templateKey: 'legal-default',
  globalStyles: defaultGlobalStyles,
  blocks: [], // Empty skeleton; presets provide the sections
};

export default function LegalDefaultTemplate(props: TemplateRendererProps) {
  return (
    <RenderSingleSite
      {...props}
      library={library}
      className={styles.themeRoot}
      itemClassName={(id) => props.selectedSectionId === id ? styles.selectedSlot : ''}
    />
  );
}
