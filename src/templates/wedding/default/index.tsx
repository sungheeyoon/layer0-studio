import React from 'react';
import { TemplateRendererProps, TemplateLibrary } from '../../types';
import styles from './wedding.module.css';
import { weddingDefaultLibrary } from './library';
import { RenderComposition } from '../../renderComposition';
import { defaultGlobalStyles } from './tokens';
import { TemplateJson } from '@/domain/entities/template.entity';

export const library: TemplateLibrary = weddingDefaultLibrary;

export const defaultTemplateJson: TemplateJson = {
  templateKey: 'wedding-default',
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

export default function WeddingDefaultTemplate(props: TemplateRendererProps) {
  return (
    <RenderComposition
      {...props}
      library={library}
      className={`${styles.themeRoot} ${styles.grain}`}
      itemClassName={(id) => props.selectedSectionId === id ? styles.selectedSlot : ''}
    />
  );
}
