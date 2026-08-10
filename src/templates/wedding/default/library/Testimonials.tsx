import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../wedding.module.css';
import { StarIcon } from '../sections/icons';
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

const testimonialsSchema = {
  eyebrow: { type: 'text', label: '상단 라벨' },
  title: { type: 'text', label: '타이틀', required: true },
  review1Body: { type: 'textarea', label: '후기 1 본문' },
  review1Author: { type: 'text', label: '후기 1 작성자' },
  review1Meta: { type: 'text', label: '후기 1 메타' },
  review1Avatar: { type: 'image', label: '후기 1 아바타' },
  review2Body: { type: 'textarea', label: '후기 2 본문' },
  review2Author: { type: 'text', label: '후기 2 작성자' },
  review2Meta: { type: 'text', label: '후기 2 메타' },
  review2Avatar: { type: 'image', label: '후기 2 아바타' },
  review3Body: { type: 'textarea', label: '후기 3 본문' },
  review3Author: { type: 'text', label: '후기 3 작성자' },
  review3Meta: { type: 'text', label: '후기 3 메타' },
  review3Avatar: { type: 'image', label: '후기 3 아바타' },
  ratingScore: { type: 'text', label: '평균 만족도 점수' },
  ratingNote: { type: 'textarea', label: '평균 만족도 설명' },
} as const satisfies FieldsSchema;

type TestimonialsContent = ValuesOf<typeof testimonialsSchema>;

const Testimonials: SectionComponent = function Testimonials({ section }: TemplateSectionProps) {
  const content = section.fields as TestimonialsContent;
  const eyebrow = content.eyebrow || '';
  const title = content.title || '';
  const ratingScore = content.ratingScore || '';
  const ratingNote = content.ratingNote || '';

  const reviews = ([1, 2, 3] as const)
    .map((n) => ({
      body: content[`review${n}Body`] || '',
      author: content[`review${n}Author`] || '',
      meta: content[`review${n}Meta`] || '',
      avatar: content[`review${n}Avatar`]?.url || '',
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
                background: r.featured ? 'color-mix(in srgb, var(--w-blush) 8%, transparent)' : 'var(--w-surface-2, var(--w-surface-2))',
                border: r.featured ? '1px solid color-mix(in srgb, var(--w-blush) 15%, transparent)' : '1px solid color-mix(in srgb, white 6%, transparent)',
                borderRadius: '1rem',
                padding: '1.75rem',
              }}
            >
              <div style={{ display: 'flex', gap: '0.125rem', marginBottom: '1rem', color: 'var(--w-blush, var(--w-blush))' }}>
                {([0, 1, 2, 3, 4] as const).map((s) => <StarIcon key={s} size={14} />)}
              </div>
              <p className={`${styles.reviewQuote} ${r.featured ? styles.reviewQuoteFeatured : ''}`}>
                &ldquo;
              </p>
              <p style={{
                fontSize: '0.875rem',
                color: r.featured ? 'color-mix(in srgb, var(--w-cream) 70%, transparent)' : 'color-mix(in srgb, var(--w-cream) 60%, transparent)',
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
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--w-cream)', margin: 0 }}>{r.author}</p>
                  <p style={{ fontSize: '0.75rem', color: r.featured ? 'color-mix(in srgb, var(--w-cream) 40%, transparent)' : 'color-mix(in srgb, var(--w-cream) 30%, transparent)', margin: 0 }}>
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
            background: 'var(--w-surface, var(--w-surface))',
            borderRadius: '1rem',
            border: '1px solid color-mix(in srgb, white 5%, transparent)',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <p className={styles.statNum} style={{ color: 'var(--w-blush, var(--w-blush))', fontSize: '3rem' }}>
                  {ratingScore}
                </p>
                <div style={{ display: 'flex', gap: '0.125rem', justifyContent: 'center', marginTop: '0.5rem', marginBottom: '0.25rem', color: 'var(--w-blush, var(--w-blush))' }}>
                  {([0, 1, 2, 3, 4] as const).map((s) => <StarIcon key={s} size={14} />)}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'color-mix(in srgb, var(--w-cream) 30%, transparent)', margin: 0 }}>평균 만족도</p>
              </div>
              {ratingNote && (
                <p style={{
                  color: 'color-mix(in srgb, var(--w-cream) 50%, transparent)',
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
};

Testimonials.meta = {
  componentKey: 'testimonials',
  category: 'content',
  label: 'Wedding Testimonials',
  fieldsSchema: testimonialsSchema,
  previewImage: '/component-previews/wedding/testimonials.webp',
};

export default Testimonials;
