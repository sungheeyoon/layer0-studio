import { ThemeRendererProps, ThemeLibrary } from '../types';
import { slots, defaultTemplateJson } from './slots';
import styles from './legal.module.css';
import { legalLibrary } from './library';
import { RenderComposition } from '../renderComposition';

export const library: ThemeLibrary = legalLibrary;

export { slots, defaultTemplateJson };

export default function LegalTheme(props: ThemeRendererProps) {
  return (
    <RenderComposition
      {...props}
      library={library}
      className={styles.themeRoot}
      itemClassName={(id) => props.selectedSectionId === id ? styles.selectedSlot : ''}
    />
  );
}
