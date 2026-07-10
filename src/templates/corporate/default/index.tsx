import React from 'react';
import { TemplateRendererProps, TemplateLibrary } from '../../types';
import styles from './corporate.module.css';
import { corporateDefaultLibrary } from './library';
import { RenderSingleSite } from '../../renderSingleSite';
import { defaultGlobalStyles } from './tokens';
import { ContentModel } from '@/domain/entities/template.entity';

export const library: TemplateLibrary = corporateDefaultLibrary;

export const defaultContent: ContentModel = {
  mode: 'single',
  templateKey: 'corporate-default',
  globalStyles: defaultGlobalStyles,
  sections: [], // Empty skeleton; presets provide the sections
};

export default function CorporateDefaultTemplate(props: TemplateRendererProps) {
  return (
    <RenderSingleSite
      {...props}
      library={library}
      className={styles.themeRoot}
      itemClassName={(id) => props.selectedSectionId === id ? styles.selectedSlot : ''}
    />
  );
}
