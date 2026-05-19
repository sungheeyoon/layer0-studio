import { TemplateSectionProps, SectionComponent } from '../../types';
import styles from '../cafe.module.css';
import { StarIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Testimonials: SectionComponent = function Testimonials({ section }: TemplateSectionProps) {
  const { data } = section;
  const label = getFieldValue(data, 'label') || '손님 후기';
  const title = getFieldValue(data, 'title') || '이 공간에서\n느낀 것들';
  const ratingValue = getFieldValue(data, 'ratingValue') || '4.9';

  const reviews = [1, 2, 3, 4, 5, 6].map(n => ({
    body: getFieldValue(data, `r${n}Body`),
    author: getFieldValue(data, `r${n}Author`),
    meta: getFieldValue(data, `r${n}Meta`),
    mt: n % 2 === 0 ? 'md:mt-8' : '',
  })).filter(r => r.body);

  return (
    <section className="py-24 lg:py-32 bg-[var(--c-linen-dark)]" id="reviews">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-14 gap-6">
          <div className={`${styles.reveal} ${styles.revealIn}`}>
            <p className={`${styles.sectionLabel} mb-5`}>{label}</p>
            <h2
              className={`${styles.fontSerif} leading-[1.1] text-[var(--c-espresso)]`}
              style={{ fontSize: 'clamp(2.2rem, 4vw, 3.4rem)' }}
            >
              {title.split('\n').map((line, i) => (
                <span key={i}>{line}<br /></span>
              ))}
            </h2>
          </div>
          <div className={`${styles.reveal} ${styles.revealIn} flex items-center gap-3`}>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} size={18} className="text-[var(--c-terra)] fill-current" />
              ))}
            </div>
            <span className={`${styles.fontSerif} text-[var(--c-espresso)] text-[2.2rem] font-medium leading-none`}>
              {ratingValue}
            </span>
            <span className="text-[var(--c-dust)] text-sm">/ 5.0</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((r, i) => (
            <div key={i} className={`${styles.reveal} ${styles.revealIn} ${styles.reviewCard} p-7 ${r.mt}`}>
              <div className="flex gap-0.5 mb-5">
                {[...Array(5)].map((_, j) => (
                  <StarIcon key={j} size={13} className="text-[var(--c-terra)] fill-current" />
                ))}
              </div>
              <p className={`${styles.fontSerif} italic text-[var(--c-espresso-soft)] text-[1rem] leading-[1.8] mb-6 whitespace-pre-line`}>
                {r.body}
              </p>
              <div className="flex items-center gap-3 border-t border-[var(--c-linen-dark)] pt-4">
                <div className={`${styles.fontSerif} w-9 h-9 rounded-full bg-[var(--c-linen-dark)] flex items-center justify-center text-[var(--c-dust)] italic text-sm shrink-0`}>
                  {r.author?.charAt(0)}
                </div>
                <div>
                  <p className="text-[var(--c-espresso)] font-medium text-[13px]">{r.author}</p>
                  <p className="text-[var(--c-dust)] text-[11px]">{r.meta}</p>
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
  category: 'social',
  label: 'Guest Reviews',
  dataSchema: {
    label: { type: 'text', label: '섹션 라벨' },
    title: { type: 'textarea', label: '섹션 타이틀' },
    ratingValue: { type: 'text', label: '별점 수치' },
    r1Body: { type: 'textarea', label: '후기 1 본문', required: true },
    r1Author: { type: 'text', label: '후기 1 작성자' },
    r1Meta: { type: 'text', label: '후기 1 메타' },
    r2Body: { type: 'textarea', label: '후기 2 본문' },
    r2Author: { type: 'text', label: '후기 2 작성자' },
    r2Meta: { type: 'text', label: '후기 2 메타' },
    r3Body: { type: 'textarea', label: '후기 3 본문' },
    r3Author: { type: 'text', label: '후기 3 작성자' },
    r3Meta: { type: 'text', label: '후기 3 메타' },
    r4Body: { type: 'textarea', label: '후기 4 본문' },
    r4Author: { type: 'text', label: '후기 4 작성자' },
    r4Meta: { type: 'text', label: '후기 4 메타' },
    r5Body: { type: 'textarea', label: '후기 5 본문' },
    r5Author: { type: 'text', label: '후기 5 작성자' },
    r5Meta: { type: 'text', label: '후기 5 메타' },
    r6Body: { type: 'textarea', label: '후기 6 본문' },
    r6Author: { type: 'text', label: '후기 6 작성자' },
    r6Meta: { type: 'text', label: '후기 6 메타' },
  },
  previewImage: '/component-previews/cafe/testimonials.webp',
};

export default Testimonials;
