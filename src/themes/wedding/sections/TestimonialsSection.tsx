import { ThemeSectionProps } from '../../types';
import styles from '../wedding.module.css';
import { StarIcon } from './icons';

export default function TestimonialsSection({ section }: ThemeSectionProps) {
  const { data } = section;
  const eyebrow = data['eyebrow']?.value || '';
  const title = data['title']?.value || '';
  const ratingScore = data['ratingScore']?.value || '';
  const ratingNote = data['ratingNote']?.value || '';

  const reviews = [1, 2, 3]
    .map((n) => ({
      body: data[`review${n}Body`]?.value || '',
      author: data[`review${n}Author`]?.value || '',
      meta: data[`review${n}Meta`]?.value || '',
      avatar: data[`review${n}Avatar`]?.value || '',
      featured: n === 2,
    }))
    .filter((r) => r.body);

  return (
    <section className={`${styles.section} ${styles.bgDark900}`} id="reviews">
      <div className={styles.sectionInner}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          {eyebrow && <div className={styles.lineOrnament} style={{ marginBottom: '2rem', justifyContent: 'center' }}>{eyebrow}</div>}
          <h2 className={styles.sectionTitle}>{title}</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          gap: '1.25rem',
        }}>
          {reviews.map((r, i) => (
            <div
              key={i}
              style={{
                background: r.featured ? 'rgba(232, 180, 184, 0.08)' : 'var(--w-surface-2, #1e1b18)',
                border: r.featured ? '1px solid rgba(232, 180, 184, 0.15)' : '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '1rem',
                padding: '1.75rem',
              }}
            >
              <div style={{ display: 'flex', gap: '0.125rem', marginBottom: '1rem', color: 'var(--w-blush, #e8b4b8)' }}>
                {[0, 1, 2, 3, 4].map((s) => <StarIcon key={s} size={14} />)}
              </div>
              <p className={`${styles.reviewQuote} ${r.featured ? styles.reviewQuoteFeatured : ''}`}>
                &ldquo;
              </p>
              <p style={{
                fontSize: '0.875rem',
                color: r.featured ? 'rgba(245, 240, 235, 0.7)' : 'rgba(245, 240, 235, 0.6)',
                lineHeight: 1.65,
                wordBreak: 'keep-all',
                marginBottom: '1.5rem',
              }}>
                {r.body}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {r.avatar && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={r.avatar} alt="" style={{ width: '2.25rem', height: '2.25rem', borderRadius: '9999px', objectFit: 'cover' }} loading="lazy" />
                )}
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f5f0eb', margin: 0 }}>{r.author}</p>
                  <p style={{ fontSize: '0.75rem', color: r.featured ? 'rgba(245, 240, 235, 0.4)' : 'rgba(245, 240, 235, 0.3)', margin: 0 }}>
                    {r.meta}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {(ratingScore || ratingNote) && (
          <div style={{
            marginTop: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem',
            padding: '1.75rem',
            background: 'var(--w-surface, #13110f)',
            borderRadius: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <p className={styles.statNum} style={{ color: 'var(--w-blush, #e8b4b8)', fontSize: '3rem' }}>
                  {ratingScore}
                </p>
                <div style={{ display: 'flex', gap: '0.125rem', justifyContent: 'center', marginTop: '0.5rem', marginBottom: '0.25rem', color: 'var(--w-blush, #e8b4b8)' }}>
                  {[0, 1, 2, 3, 4].map((s) => <StarIcon key={s} size={14} />)}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'rgba(245, 240, 235, 0.3)', margin: 0 }}>평균 만족도</p>
              </div>
              {ratingNote && (
                <p style={{
                  color: 'rgba(245, 240, 235, 0.5)',
                  fontSize: '0.875rem',
                  wordBreak: 'keep-all',
                  maxWidth: '20rem',
                  margin: 0,
                }}>
                  {ratingNote}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
