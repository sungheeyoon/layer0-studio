import { ThemeRendererProps, ThemeLibrary } from '../types';
import { slots, defaultTemplateJson } from './slots';
import styles from './medical.module.css';
import { medicalLibrary } from './library';
import { RenderComposition } from '../renderComposition';

export const library: ThemeLibrary = medicalLibrary;

export { slots, defaultTemplateJson };

export default function MedicalTheme(props: ThemeRendererProps) {
  return (
    <RenderComposition
      {...props}
      library={library}
      className={styles.themeRoot}
      itemClassName={(id) => props.selectedSectionId === id ? styles.selectedSlot : ''}
    />
  );
}
