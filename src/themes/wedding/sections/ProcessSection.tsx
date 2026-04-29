import { ThemeSectionProps } from '../../types';
import styles from '../wedding.module.css';
import { ChatIcon, NotebookIcon, PaletteIcon, SparkleIcon } from './icons';

const STEP_ICONS = [
  <ChatIcon key="1" size={24} />,
  <NotebookIcon key="2" size={24} />,
  <PaletteIcon key="3" size={24} />,
  <SparkleIcon key="4" size={24} />,
];

export default function ProcessSection({ section }: ThemeSectionProps) {
  const { data } = section;
  const eyebrow = data['eyebrow']?.value || '';
  const title = data['title']?.value || '';
  const ctaText = data['ctaText']?.value || '';
  const ctaUrl = data['ctaUrl']?.value || '#';
  const ctaNote = data['ctaNote']?.value || '';

  const steps = [1, 2, 3, 4]
    .map((n) => ({
      title: data[`step${n}Title`]?.value || '',
      body: data[`step${n}Body`]?.value || '',
    }))
    .filter((s) => s.title);

  return (
    <section className={`${styles.section} ${styles.bgDark900}`}>
      <div className={styles.sectionInnerNarrow}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          {eyebrow && <div className={styles.lineOrnament} style={{ marginBottom: '2rem', justifyContent: 'center' }}>{eyebrow}</div>}
          <h2 className={styles.sectionTitle}>{title}</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: '1.5rem',
        }}>
          {steps.map((step, i) => {
            const isLast = i === steps.length - 1;
            return (
              <div key={i} style={{ textAlign: 'center' }}>
                <div className={`${styles.stepCircle} ${isLast ? styles.stepCircleGold : ''}`}>
                  {STEP_ICONS[i]}
                </div>
                <p className={`${styles.stepNumber} ${isLast ? styles.stepNumberGold : ''}`}>
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 style={{ color: '#f5f0eb', fontWeight: 700, marginBottom: '0.5rem', wordBreak: 'keep-all' }}>
                  {step.title}
                </h3>
                <p style={{ color: 'rgba(245, 240, 235, 0.4)', fontSize: '0.875rem', lineHeight: 1.65, wordBreak: 'keep-all', margin: 0 }}>
                  {step.body}
                </p>
              </div>
            );
          })}
        </div>

        {ctaText && (
          <div style={{ marginTop: '4rem', textAlign: 'center' }}>
            <a href={ctaUrl} className={styles.btnBlush}>
              {ctaText}
            </a>
            {ctaNote && (
              <p style={{ fontSize: '0.75rem', color: 'rgba(245, 240, 235, 0.3)', marginTop: '0.75rem' }}>
                {ctaNote}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
