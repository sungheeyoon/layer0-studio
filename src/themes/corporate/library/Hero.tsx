import { ThemeSectionProps, SectionComponent } from '../../types';
import styles from '../corporate.module.css';

const Hero: SectionComponent = function Hero({ section }: ThemeSectionProps) {
  const { data } = section;
  const title = data['title']?.value || '';
  const subtitle = data['subtitle']?.value || '';
  const bgImage = data['backgroundImage']?.value || '';
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
};

Hero.meta = {
  componentKey: 'hero',
  category: 'hero',
  label: 'Corporate Hero',
  dataSchema: {
    title: { type: 'text', label: 'Main Title', required: true },
    subtitle: { type: 'text', label: 'Subtitle' },
    backgroundImage: { type: 'image', label: 'Background Image' },
    ctaText: { type: 'text', label: 'CTA Button Text' },
    ctaUrl: { type: 'url', label: 'CTA Button Link' }
  },
  previewImage: '/component-previews/corporate/hero.webp',
};

export default Hero;
