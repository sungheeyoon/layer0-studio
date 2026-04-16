import { ThemeSectionProps } from '../../types';
import styles from '../corporate.module.css';

export default function HeroSection({ section }: ThemeSectionProps) {
  const { data } = section;
  const title = data['title']?.value || data['heading']?.value || '';
  const subtitle = data['subtitle']?.value || '';
  const bgImage = data['backgroundImage']?.value || data['image']?.value || '';
  const ctaText = data['ctaText']?.value || '';
  const ctaUrl = data['ctaUrl']?.value || '#';

  return (
    <div
      className={styles.heroSection}
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : undefined,
      }}
    >
      {bgImage && <div className="absolute inset-0 bg-black/40" />}
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle} style={bgImage ? { color: '#fff' } : {}}>
          {title}
        </h1>
        {subtitle && (
          <p className={styles.heroSubtitle} style={bgImage ? { color: '#eee' } : {}}>
            {subtitle}
          </p>
        )}
        {ctaText && (
          <a href={ctaUrl} className={styles.ctaButton} style={bgImage ? { color: '#fff', borderColor: '#fff' } : {}}>
            {ctaText}
          </a>
        )}
      </div>
    </div>
  );
}
