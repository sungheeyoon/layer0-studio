import { ThemeSectionProps } from '../../types';
import styles from '../wedding.module.css';
import { ArrowRightIcon } from './icons';
import { renderAccentTitle } from './title-parts';

export default function PhilosophySection({ section }: ThemeSectionProps) {
  const { data } = section;
  const eyebrow = data['eyebrow']?.value || '';
  const title = data['title']?.value || '';
  const body = data['body']?.value || '';
  const ctaText = data['ctaText']?.value || '';
  const ctaUrl = data['ctaUrl']?.value || '#';

  return (
    <section className={`${styles.section} ${styles.bgDark800}`}>
      <div className={styles.sectionInnerProse} style={{ textAlign: 'center' }}>
        {eyebrow && <div className={styles.lineOrnament} style={{ marginBottom: '2.5rem', justifyContent: 'center' }}>{eyebrow}</div>}
        <h2 className={styles.sectionTitleDisplay} style={{ marginBottom: '2rem' }}>
          {renderAccentTitle(title, styles.titleAccent)}
        </h2>
        {body && (
          <p style={{
            color: 'rgba(245, 240, 235, 0.5)',
            lineHeight: 1.7,
            fontSize: '1.0625rem',
            wordBreak: 'keep-all',
            maxWidth: '40rem',
            margin: '0 auto',
          }}>
            {body}
          </p>
        )}
        {ctaText && (
          <div style={{ marginTop: '2.5rem' }}>
            <a href={ctaUrl} className={styles.btnBlush}>
              {ctaText}
              <ArrowRightIcon size={16} />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
