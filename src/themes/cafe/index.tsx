import React from 'react';
import { ThemeRendererProps, ThemeLibrary } from '../types';
import { slots, defaultTemplateJson } from './slots';
import styles from './cafe.module.css';
import { cafeLibrary } from './library';
import { RenderComposition } from '../renderComposition';

export const library: ThemeLibrary = cafeLibrary;

export { slots, defaultTemplateJson };

export default function CafeTheme(props: ThemeRendererProps) {
  return (
    <RenderComposition
      {...props}
      library={library}
      className={styles.themeRoot}
      itemClassName={(id) => props.selectedSectionId === id ? styles.selectedSlot : ''}
    />
  );
}
