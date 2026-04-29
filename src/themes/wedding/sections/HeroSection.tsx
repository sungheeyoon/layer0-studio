import { ThemeSectionProps } from '../../types';
import styles from '../wedding.module.css';
import { ArrowDownIcon, HeartIcon } from './icons';
import { renderAccentTitle } from './title-parts';

export default function HeroSection({ section }: ThemeSectionProps) {
  const { data } = section;
  const eyebrow = data['eyebrow']?.value || '';
  const title = data['title']?.value || '';
  const subtitle = data['subtitle']?.value || '';
  const ctaPrimaryText = data['ctaPrimaryText']?.value || '';
  const ctaPrimaryUrl = data['ctaPrimaryUrl']?.value || '#';
  const ctaSecondaryText = data['ctaSecondaryText']?.value || '';
  const ctaSecondaryUrl = data['ctaSecondaryUrl']?.value || '#';
  const bgImage = data['backgroundImage']?.value || '';

  const stats = [1, 2, 3]
    .map((n) => ({
      value: data[`stat${n}Value`]?.value || '',
      label: data[`stat${n}Label`]?.value || '',
    }))
    .filter((s) => s.value || s.label);

  return (
    <section className={styles.heroSection}>
      {bgImage && (
        <div className={styles.heroBg}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bgImage} alt="" />
          <div className={styles.heroOverlay} />
        </div>
      )}
      <div className={styles.heroContent}>
        <div style={{ maxWidth: '48rem' }}>
          {eyebrow && (
            <div className={styles.lineOrnament} style={{ marginBottom: '2rem', maxWidth: '20rem' }}>
              {eyebrow}
            </div>
          )}
          <h1 className={styles.heroTitle}>
            {renderAccentTitle(title, styles.heroAccent)}
          </h1>
          {subtitle && <p className={styles.heroSubtitle}>{subtitle}</p>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {ctaPrimaryText && (
              <a href={ctaPrimaryUrl} className={styles.btnBlush}>
                <HeartIcon size={16} />
                {ctaPrimaryText}
              </a>
            )}
            {ctaSecondaryText && (
              <a href={ctaSecondaryUrl} className={styles.btnGhost}>
                {ctaSecondaryText}
                <ArrowDownIcon size={16} />
              </a>
            )}
          </div>
        </div>

        {stats.length > 0 && (
          <div className={styles.heroStats}>
            {stats.map((s, i) => (
              <div key={i}>
                <p className={styles.statNum}>{s.value}</p>
                <p className={styles.statLabel}>{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
