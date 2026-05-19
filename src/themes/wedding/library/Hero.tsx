import { TemplateSectionProps, SectionComponent } from '../../types';
import styles from '../wedding.module.css';
import { ArrowDownIcon, HeartIcon } from '../sections/icons';
import { renderAccentTitle } from '../sections/title-parts';
import { getFieldValue } from '@/domain/entities/template.entity';

const Hero: SectionComponent = function Hero({ section }: TemplateSectionProps) {
  const { data } = section;
  const eyebrow = getFieldValue(data, 'eyebrow') || '';
  const title = getFieldValue(data, 'title') || '';
  const subtitle = getFieldValue(data, 'subtitle') || '';
  const ctaPrimaryText = getFieldValue(data, 'ctaPrimaryText') || '';
  const ctaPrimaryUrl = getFieldValue(data, 'ctaPrimaryUrl') || '#';
  const ctaSecondaryText = getFieldValue(data, 'ctaSecondaryText') || '';
  const ctaSecondaryUrl = getFieldValue(data, 'ctaSecondaryUrl') || '#';
  const bgImage = getFieldValue(data, 'backgroundImage') || '';

  const stats = [1, 2, 3]
    .map((n) => ({
      value: getFieldValue(data, `stat${n}Value`) || '',
      label: getFieldValue(data, `stat${n}Label`) || '',
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
};

Hero.meta = {
  componentKey: 'hero',
  category: 'hero',
  label: 'Wedding Hero',
  dataSchema: {
    eyebrow: { type: 'text', label: '상단 라벨' },
    title: { type: 'textarea', label: '메인 타이틀', required: true },
    subtitle: { type: 'textarea', label: '서브 타이틀' },
    ctaPrimaryText: { type: 'text', label: '주요 CTA 버튼' },
    ctaPrimaryUrl: { type: 'url', label: '주요 CTA 링크' },
    ctaSecondaryText: { type: 'text', label: '보조 CTA 버튼' },
    ctaSecondaryUrl: { type: 'url', label: '보조 CTA 링크' },
    backgroundImage: { type: 'image', label: '배경 이미지' },
    stat1Value: { type: 'text', label: '통계 1 수치' },
    stat1Label: { type: 'text', label: '통계 1 라벨' },
    stat2Value: { type: 'text', label: '통계 2 수치' },
    stat2Label: { type: 'text', label: '통계 2 라벨' },
    stat3Value: { type: 'text', label: '통계 3 수치' },
    stat3Label: { type: 'text', label: '통계 3 라벨' },
  },
  previewImage: '/component-previews/wedding/hero.webp',
};

export default Hero;
