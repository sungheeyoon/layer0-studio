import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../fitness.module.css';
import { StarIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Testimonials: SectionComponent = function Testimonials({ section }: TemplateSectionProps) {
  const { fields } = section;
  const label = getFieldValue(fields, 'eyebrow') || '멤버 후기';
  const title = getFieldValue(fields, 'title') || '결과가\n모든 걸\n말합니다';
  const ratingValue = getFieldValue(fields, 'ratingValue') || '4.9';
  const ratingLabel = getFieldValue(fields, 'ratingLabel') || 'Google 리뷰 기준 • 894개 후기';

  const reviews = [1, 2, 3, 4, 5, 6].map(n => ({
    body: getFieldValue(fields, `r${n}Body`),
    author: getFieldValue(fields, `r${n}Author`),
    meta: getFieldValue(fields, `r${n}Meta`),
    mt: n % 2 === 0 ? 'md:mt-8' : '',
  })).filter(r => r.body);

  return (
    <section className="py-24 lg:py-32 bg-[var(--f-surface)] border-y border-[var(--f-border)]" id="reviews">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-14 gap-6">
          <div>
            <p className={`${styles.sectionLabel} mb-5`}>{label}</p>
            <h2
              className={`${styles.fontCondensed} font-black uppercase text-[var(--f-snow)] leading-[.92]`}
              style={{ fontSize: 'clamp(2.8rem, 5vw, 4.5rem)' }}
            >
              {title.split('\n').map((line, i) => (
                <span key={i}>{line}<br /></span>
              ))}
            </h2>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} size={20} className="text-[var(--f-lime)]" />
              ))}
            </div>
            <p className={`${styles.fontCondensed} font-black text-[var(--f-snow)] text-[2.5rem] leading-none`}>
              {ratingValue} <span className="text-[var(--f-soft)] text-[1.2rem]">/ 5.0</span>
            </p>
            <p className="text-[var(--f-soft)] text-[12px] tracking-wide">{ratingLabel}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((r, i) => (
            <div key={i} className={`${styles.reviewCard} p-7 ${r.mt}`}>
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <StarIcon key={j} size={13} className="text-[var(--f-lime)]" />
                ))}
              </div>
              <p className="text-[var(--f-soft)] text-[14px] leading-[1.85] mb-6">
                {r.body}
              </p>
              <div className="flex items-center gap-3 border-t border-[var(--f-border)] pt-4">
                <div className={`${styles.fontCondensed} w-9 h-9 bg-[var(--f-panel)] border border-[var(--f-border)] flex items-center justify-center font-black text-[var(--f-lime)] text-sm shrink-0`}>
                  {r.author?.charAt(0)}
                </div>
                <div>
                  <p className="text-[var(--f-snow)] font-semibold text-[13px]">{r.author}</p>
                  <p className="text-[var(--f-muted)] text-[11px]">{r.meta}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

Testimonials.meta = {
  componentKey: 'testimonials',
  category: 'content',
  label: 'Fitness Testimonials',
  fieldsSchema: {
    eyebrow: { type: 'text', label: '섹션 라벨' },
    title: { type: 'textarea', label: '섹션 타이틀', required: true },
    ratingValue: { type: 'text', label: '별점 수치' },
    ratingLabel: { type: 'text', label: '별점 라벨' },
    r1Body: { type: 'textarea', label: '후기 1 본문' },
    r1Author: { type: 'text', label: '후기 1 작성자' },
    r1Meta: { type: 'text', label: '후기 1 메타' },
    r2Body: { type: 'textarea', label: '후기 2 본문' },
    r2Author: { type: 'text', label: '후기 2 작성자' },
    r2Meta: { type: 'text', label: '후기 2 메타' },
    r3Body: { type: 'textarea', label: '후기 3 본문' },
    r3Author: { type: 'text', label: '후기 3 작성자' },
    r3Meta: { type: 'text', label: '후기 3 메타' },
  },
  previewImage: '/component-previews/fitness/testimonials.webp',
};

export default Testimonials;
