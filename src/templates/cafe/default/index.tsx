import React from 'react';
import { TemplateRendererProps, TemplateLibrary } from '../../types';
import styles from './cafe.module.css';
import { cafeDefaultLibrary } from './library';
import { RenderSingleSite } from '../../renderSingleSite';
import { defaultGlobalStyles, designTokens } from './tokens';
import { TemplateJson } from '@/domain/entities/template.entity';

export const library: TemplateLibrary = cafeDefaultLibrary;

export const defaultTemplateJson: TemplateJson = {
  mode: 'single',
  templateKey: 'cafe-default',
  globalStyles: defaultGlobalStyles,
  sections: [], // Empty skeleton; presets provide the sections
};

export default function CafeDefaultTemplate(props: TemplateRendererProps) {
  return (
    <RenderSingleSite
      {...props}
      library={library}
      className={styles.themeRoot}
      designTokens={designTokens}
      itemClassName={(id) => props.selectedSectionId === id ? styles.selectedSlot : ''}
    />
  );
}
