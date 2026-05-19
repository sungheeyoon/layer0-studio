import { TemplateSectionProps, SectionComponent } from '../../types';
import styles from '../corporate.module.css';
import { getFieldValue } from '@/domain/entities/template.entity';

const Hero: SectionComponent = function Hero({ section }: TemplateSectionProps) {
  const { data } = section;
  const title = getFieldValue(data, 'title') || '';
  const subtitle = getFieldValue(data, 'subtitle') || '';
  const bgImage = getFieldValue(data, 'backgroundImage') || '';
  const ctaText = getFieldValue(data, 'ctaText') || '';
  const ctaUrl = getFieldValue(data, 'ctaUrl') || '#';

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
