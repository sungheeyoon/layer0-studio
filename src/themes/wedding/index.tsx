import { ThemeRendererProps, ThemeLibrary } from '../types';
import { slots, defaultTemplateJson } from './slots';
import styles from './wedding.module.css';
import { weddingLibrary } from './library';
import { RenderComposition } from '../renderComposition';

export const library: ThemeLibrary = weddingLibrary;

export { slots, defaultTemplateJson };

export default function WeddingTheme(props: ThemeRendererProps) {
  return (
    <RenderComposition
      {...props}
      library={library}
      className={`${styles.themeRoot} ${styles.grain}`}
      itemClassName={(id) => props.selectedSectionId === id ? styles.selectedSlot : ''}
    />
  );
}
