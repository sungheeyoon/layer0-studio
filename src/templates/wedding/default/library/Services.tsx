import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../wedding.module.css';
import { ArrowRightIcon, HeartIcon, GiftIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Services: SectionComponent = function Services({ section }: TemplateSectionProps) {
  const { fields } = section;
  const eyebrow = getFieldValue(fields, 'eyebrow') || '';
  const title = getFieldValue(fields, 'title') || '';

  const service1 = {
    badge: getFieldValue(fields, 'service1Badge') || '',
    title: getFieldValue(fields, 'service1Title') || '',
    body: getFieldValue(fields, 'service1Body') || '',
    image: getFieldValue(fields, 'service1Image') || '',
  };
  const service2 = {
    title: getFieldValue(fields, 'service2Title') || '',
    body: getFieldValue(fields, 'service2Body') || '',
    image: getFieldValue(fields, 'service2Image') || '',
  };
  const service3 = {
    title: getFieldValue(fields, 'service3Title') || '',
    body: getFieldValue(fields, 'service3Body') || '',
  };
  const service4 = {
    title: getFieldValue(fields, 'service4Title') || '',
    body: getFieldValue(fields, 'service4Body') || '',
  };
  const ctaCardTitle = getFieldValue(fields, 'ctaCardTitle') || '';
  const ctaCardBody = getFieldValue(fields, 'ctaCardBody') || '';
  const ctaCardButton = getFieldValue(fields, 'ctaCardButton') || '';
  const ctaCardUrl = getFieldValue(fields, 'ctaCardUrl') || '#';

  return (
    <section className={`${styles.section} ${styles.bgDark900} ${styles.dottedBg}`}>
      <div className={styles.sectionInner}>
        <div style={{ marginBottom: '3.5rem' }}>
          <div className={styles.dividerBlush} style={{ marginBottom: '1rem' }} />
          {eyebrow && <p className={styles.eyebrowLabel}>{eyebrow}</p>}
          <h2 className={styles.sectionTitle}>{title}</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '1rem',
        }}>
          {/* Service 1 — wide image card */}
          {service1.title && (
            <div className={styles.galleryItem} style={{ gridColumn: 'span 2 / span 2', minHeight: '18rem' }}>
              {service1.image && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={service1.image} alt={service1.title} loading="lazy" />
              )}
              <div className={styles.photoOverlay} style={{ opacity: 1, background: 'linear-gradient(to top, color-mix(in srgb, var(--w-bg) 85%, transparent) 0%, color-mix(in srgb, var(--w-bg) 40%, transparent) 50%, transparent 100%)' }} />
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '1.75rem',
                zIndex: 2,
              }}>
                {service1.badge && (
                  <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.625rem',
                    background: 'color-mix(in srgb, var(--w-blush) 20%, transparent)',
                    color: 'var(--w-blush, var(--w-blush))',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderRadius: '9999px',
                    border: '1px solid color-mix(in srgb, var(--w-blush) 20%, transparent)',
                    marginBottom: '0.75rem',
                    width: 'fit-content',
                  }}>
                    {service1.badge}
                  </span>
                )}
                <h3 style={{ color: 'var(--w-cream)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem', wordBreak: 'keep-all' }}>
                  {service1.title}
                </h3>
                <p style={{ color: 'color-mix(in srgb, var(--w-cream) 60%, transparent)', fontSize: '0.875rem', wordBreak: 'keep-all', margin: 0 }}>
                  {service1.body}
                </p>
              </div>
            </div>
          )}

          {/* Service 2 — tall image card */}
          {service2.title && (
            <div className={styles.galleryItem} style={{ gridRow: 'span 2 / span 2', minHeight: '18rem' }}>
              {service2.image && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={service2.image} alt={service2.title} loading="lazy" />
              )}
              <div className={styles.photoOverlay} style={{ opacity: 1, background: 'linear-gradient(to top, color-mix(in srgb, var(--w-bg) 85%, transparent) 0%, color-mix(in srgb, var(--w-bg) 30%, transparent) 60%, transparent 100%)' }} />
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '1.75rem',
                zIndex: 2,
              }}>
                <h3 style={{ color: 'var(--w-cream)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem', wordBreak: 'keep-all' }}>
                  {service2.title}
                </h3>
                <p style={{ color: 'color-mix(in srgb, var(--w-cream) 60%, transparent)', fontSize: '0.875rem', wordBreak: 'keep-all', margin: 0 }}>
                  {service2.body}
                </p>
              </div>
            </div>
          )}

          {/* Service 3 */}
          {service3.title && (
            <div className={styles.cardBase}>
              <div className={styles.iconCircle}>
                <HeartIcon size={20} />
              </div>
              <h3 style={{ color: 'var(--w-cream)', fontWeight: 700, marginBottom: '0.5rem', wordBreak: 'keep-all' }}>{service3.title}</h3>
              <p style={{ color: 'color-mix(in srgb, var(--w-cream) 50%, transparent)', fontSize: '0.875rem', lineHeight: 1.65, wordBreak: 'keep-all', margin: 0 }}>{service3.body}</p>
            </div>
          )}

          {/* Service 4 */}
          {service4.title && (
            <div className={styles.cardBase}>
              <div className={`${styles.iconCircle} ${styles.iconCircleGold}`}>
                <GiftIcon size={20} />
              </div>
              <h3 style={{ color: 'var(--w-cream)', fontWeight: 700, marginBottom: '0.5rem', wordBreak: 'keep-all' }}>{service4.title}</h3>
              <p style={{ color: 'color-mix(in srgb, var(--w-cream) 50%, transparent)', fontSize: '0.875rem', lineHeight: 1.65, wordBreak: 'keep-all', margin: 0 }}>{service4.body}</p>
            </div>
          )}

          {/* CTA card */}
          {ctaCardButton && (
            <div style={{
              background: 'var(--w-blush, var(--w-blush))',
              borderRadius: '1rem',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1.5rem',
            }}>
              <div>
                <p className={styles.fontDisplay} style={{
                  fontSize: '1.5rem',
                  fontWeight: 300,
                  color: 'var(--w-bg)',
                  lineHeight: 1.2,
                  marginBottom: '0.75rem',
                  wordBreak: 'keep-all',
                  whiteSpace: 'pre-line',
                }}>
                  {ctaCardTitle}
                </p>
                <p style={{ color: 'color-mix(in srgb, var(--w-bg) 60%, transparent)', fontSize: '0.875rem', wordBreak: 'keep-all', margin: 0 }}>
                  {ctaCardBody}
                </p>
              </div>
              <a href={ctaCardUrl} className={styles.btnDark} style={{ width: 'fit-content' }}>
                {ctaCardButton}
                <ArrowRightIcon size={16} />
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

Services.meta = {
  componentKey: 'services',
  category: 'features',
  label: 'Wedding Services',
  fieldsSchema: {
    eyebrow: { type: 'text', label: '상단 라벨' },
    title: { type: 'text', label: '타이틀', required: true },
    service1Badge: { type: 'text', label: '서비스 1 배지' },
    service1Title: { type: 'text', label: '서비스 1 제목' },
    service1Body: { type: 'textarea', label: '서비스 1 설명' },
    service1Image: { type: 'image', label: '서비스 1 이미지' },
    service2Title: { type: 'text', label: '서비스 2 제목' },
    service2Body: { type: 'textarea', label: '서비스 2 설명' },
    service2Image: { type: 'image', label: '서비스 2 이미지' },
    service3Title: { type: 'text', label: '서비스 3 제목' },
    service3Body: { type: 'textarea', label: '서비스 3 설명' },
    service4Title: { type: 'text', label: '서비스 4 제목' },
    service4Body: { type: 'textarea', label: '서비스 4 설명' },
    ctaCardTitle: { type: 'textarea', label: 'CTA 카드 타이틀' },
    ctaCardBody: { type: 'textarea', label: 'CTA 카드 본문' },
    ctaCardButton: { type: 'text', label: 'CTA 카드 버튼' },
    ctaCardUrl: { type: 'url', label: 'CTA 카드 링크' },
  },
  previewImage: '/component-previews/wedding/services.webp',
};

export default Services;
