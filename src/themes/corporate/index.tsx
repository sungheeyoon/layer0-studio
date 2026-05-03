import { ThemeRendererProps, ThemeLibrary } from '../types';
import { slots, defaultTemplateJson } from './slots';
import styles from './corporate.module.css';
import { corporateLibrary } from './library';
import { RenderComposition } from '../renderComposition';

export const library: ThemeLibrary = corporateLibrary;

export { slots, defaultTemplateJson };

export default function CorporateTheme(props: ThemeRendererProps) {
  return (
    <RenderComposition
      {...props}
      library={library}
      className={styles.themeRoot}
      itemClassName={(id) => props.selectedSectionId === id ? styles.selectedSlot : ''}
    />
  );
}
