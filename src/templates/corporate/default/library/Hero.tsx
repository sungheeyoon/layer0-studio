import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../corporate.module.css';
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

const heroSchema = {
  title: { type: 'text', label: 'Main Title', required: true },
  subtitle: { type: 'text', label: 'Subtitle' },
  backgroundImage: { type: 'image', label: 'Background Image' },
  ctaText: { type: 'text', label: 'CTA Button Text' },
  ctaUrl: { type: 'url', label: 'CTA Button Link' },
} as const satisfies FieldsSchema;

type HeroContent = ValuesOf<typeof heroSchema>;

const Hero: SectionComponent = function Hero({ section }: TemplateSectionProps) {
  const content = section.fields as HeroContent;
  const title = content.title || '';
  const subtitle = content.subtitle || '';
  const bgImage = content.backgroundImage?.url || '';
  const ctaText = content.ctaText || '';
  const ctaUrl = content.ctaUrl || '#';

  return (
    <div
      className={styles.heroSection}
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : undefined,
      }}
    >
      {bgImage && <div className="absolute inset-0 bg-black/40" />}
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle} style={bgImage ? { color: 'var(--corp-on-image-fg)' } : {}}>
          {title}
        </h1>
        {subtitle && (
          <p className={styles.heroSubtitle} style={bgImage ? { color: 'var(--corp-on-image-fg-muted)' } : {}}>
            {subtitle}
          </p>
        )}
        {ctaText && (
          <a href={ctaUrl} className={styles.ctaButton} style={bgImage ? { color: 'var(--corp-on-image-fg)', borderColor: 'var(--corp-on-image-fg)' } : {}}>
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
  fieldsSchema: heroSchema,
  previewImage: '/component-previews/corporate/hero.webp',
};

export default Hero;
