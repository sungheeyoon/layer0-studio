import React from 'react';
import { TemplateRendererProps, TemplateLibrary } from '../../types';
import styles from './interior.module.css';
import { interiorDefaultLibrary } from './library';
import { RenderSingleSite } from '../../renderSingleSite';
import { defaultGlobalStyles } from './tokens';
import { ContentModel } from '@/domain/entities/template.entity';

export const library: TemplateLibrary = interiorDefaultLibrary;

export const defaultTemplateJson: ContentModel = {
  mode: 'single',
  templateKey: 'interior-default',
  globalStyles: defaultGlobalStyles,
  sections: [], // Empty skeleton; presets provide the sections
};

export default function InteriorDefaultTemplate(props: TemplateRendererProps) {
  return (
    <RenderSingleSite
      {...props}
      library={library}
      className={styles.themeRoot}
      itemClassName={(id) => props.selectedSectionId === id ? styles.selectedSlot : ''}
    />
  );
}
