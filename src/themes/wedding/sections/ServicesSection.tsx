import { ThemeSectionProps } from '../../types';
import styles from '../wedding.module.css';
import { ArrowRightIcon, HeartIcon, GiftIcon } from './icons';

export default function ServicesSection({ section }: ThemeSectionProps) {
  const { data } = section;
  const eyebrow = data['eyebrow']?.value || '';
  const title = data['title']?.value || '';

  const service1 = {
    badge: data['service1Badge']?.value || '',
    title: data['service1Title']?.value || '',
    body: data['service1Body']?.value || '',
    image: data['service1Image']?.value || '',
  };
  const service2 = {
    title: data['service2Title']?.value || '',
    body: data['service2Body']?.value || '',
    image: data['service2Image']?.value || '',
  };
  const service3 = {
    title: data['service3Title']?.value || '',
    body: data['service3Body']?.value || '',
  };
  const service4 = {
    title: data['service4Title']?.value || '',
    body: data['service4Body']?.value || '',
  };
  const ctaCardTitle = data['ctaCardTitle']?.value || '';
  const ctaCardBody = data['ctaCardBody']?.value || '';
  const ctaCardButton = data['ctaCardButton']?.value || '';
  const ctaCardUrl = data['ctaCardUrl']?.value || '#';

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
              <div className={styles.photoOverlay} style={{ opacity: 1, background: 'linear-gradient(to top, rgba(10,9,8,0.85) 0%, rgba(10,9,8,0.4) 50%, transparent 100%)' }} />
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
                    background: 'rgba(232, 180, 184, 0.2)',
                    color: 'var(--w-blush, #e8b4b8)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderRadius: '9999px',
                    border: '1px solid rgba(232, 180, 184, 0.2)',
                    marginBottom: '0.75rem',
                    width: 'fit-content',
                  }}>
                    {service1.badge}
                  </span>
                )}
                <h3 style={{ color: '#f5f0eb', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem', wordBreak: 'keep-all' }}>
                  {service1.title}
                </h3>
                <p style={{ color: 'rgba(245, 240, 235, 0.6)', fontSize: '0.875rem', wordBreak: 'keep-all', margin: 0 }}>
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
              <div className={styles.photoOverlay} style={{ opacity: 1, background: 'linear-gradient(to top, rgba(10,9,8,0.85) 0%, rgba(10,9,8,0.3) 60%, transparent 100%)' }} />
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '1.75rem',
                zIndex: 2,
              }}>
                <h3 style={{ color: '#f5f0eb', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem', wordBreak: 'keep-all' }}>
                  {service2.title}
                </h3>
                <p style={{ color: 'rgba(245, 240, 235, 0.6)', fontSize: '0.875rem', wordBreak: 'keep-all', margin: 0 }}>
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
              <h3 style={{ color: '#f5f0eb', fontWeight: 700, marginBottom: '0.5rem', wordBreak: 'keep-all' }}>{service3.title}</h3>
              <p style={{ color: 'rgba(245, 240, 235, 0.5)', fontSize: '0.875rem', lineHeight: 1.65, wordBreak: 'keep-all', margin: 0 }}>{service3.body}</p>
            </div>
          )}

          {/* Service 4 */}
          {service4.title && (
            <div className={styles.cardBase}>
              <div className={`${styles.iconCircle} ${styles.iconCircleGold}`}>
                <GiftIcon size={20} />
              </div>
              <h3 style={{ color: '#f5f0eb', fontWeight: 700, marginBottom: '0.5rem', wordBreak: 'keep-all' }}>{service4.title}</h3>
              <p style={{ color: 'rgba(245, 240, 235, 0.5)', fontSize: '0.875rem', lineHeight: 1.65, wordBreak: 'keep-all', margin: 0 }}>{service4.body}</p>
            </div>
          )}

          {/* CTA card */}
          {ctaCardButton && (
            <div style={{
              background: 'var(--w-blush, #e8b4b8)',
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
                  color: '#0a0908',
                  lineHeight: 1.2,
                  marginBottom: '0.75rem',
                  wordBreak: 'keep-all',
                  whiteSpace: 'pre-line',
                }}>
                  {ctaCardTitle}
                </p>
                <p style={{ color: 'rgba(10, 9, 8, 0.6)', fontSize: '0.875rem', wordBreak: 'keep-all', margin: 0 }}>
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
}
