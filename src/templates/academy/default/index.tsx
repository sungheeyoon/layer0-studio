import React from 'react';
import { TemplateRendererProps, TemplateLibrary } from '../../types';
import styles from './academy.module.css';
import { academyDefaultLibrary } from './library';
import { RenderSingleSite } from '../../renderSingleSite';
import { defaultGlobalStyles, designTokens } from './tokens';
import { ContentModel } from '@/domain/entities/template.entity';

export const library: TemplateLibrary = academyDefaultLibrary;

export const defaultContent: ContentModel = {
  mode: 'single',
  templateKey: 'academy-default',
  globalStyles: defaultGlobalStyles,
  blocks: [], // Empty skeleton; presets provide the sections
};

export default function AcademyDefaultTemplate(props: TemplateRendererProps) {
  return (
    <RenderSingleSite
      {...props}
      library={library}
      className={styles.themeRoot}
      designTokens={designTokens}
      itemClassName={(id) => (props.selectedSectionId === id ? styles.selectedSlot : '')}
    />
  );
}
