import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../medical.module.css';
import { StarIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Testimonials: SectionComponent = function Testimonials({ section }: TemplateSectionProps) {
  const { fields } = section;
  const label = getFieldValue(fields, 'eyebrow') || '';
  const title = getFieldValue(fields, 'title') || '';
  const rating = getFieldValue(fields, 'rating') || '4.9';

  const reviews = [1, 2, 3].map(n => ({
    body: getFieldValue(fields, `review${n}Body`),
    author: getFieldValue(fields, `review${n}Author`),
    meta: getFieldValue(fields, `review${n}Meta`),
    mt: n === 2 ? 'md:mt-10' : '',
  })).filter(r => r.body);

  return (
    <section className="py-24 lg:py-32 bg-[var(--m-charcoal)]" id="reviews">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-14 gap-6">
          <div>
            <p className={`${styles.sectionLabel} mb-5`} style={{ color: 'var(--m-gold)' }}>{label}</p>
            <h2 className={`${styles.fontDisplay} text-[clamp(2rem,3.5vw,3.2rem)] font-light text-[var(--m-cream)] leading-[1.12] whitespace-pre-line`}>
              {title}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} size={18} className="text-[var(--m-gold)]" />
              ))}
            </div>
            <span className={`${styles.fontDisplay} text-3xl font-light text-[var(--m-cream)]`}>{rating}</span>
            <span className="text-[var(--m-cream)]/35 text-sm">/ 5.0</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((r, i) => (
            <div key={i} className={`bg-white border border-[var(--m-charcoal)]/07 p-7 hover:-translate-y-1 hover:shadow-2xl transition-all duration-500 ${r.mt}`}>
              <div className="flex gap-0.5 mb-5">
                {[...Array(5)].map((_, j) => (
                  <StarIcon key={j} size={13} className="text-[var(--m-gold)]" />
                ))}
              </div>
              <p className="text-[var(--m-charcoal-mid)] text-[14px] leading-[1.85] mb-6">
                {r.body}
              </p>
              <div className="flex items-center gap-3 border-t border-[var(--m-warm-light)] pt-4">
                <div className="w-9 h-9 rounded-full bg-[var(--m-cream-dark)] flex items-center justify-center text-[var(--m-warm-gray)] font-medium text-sm shrink-0">
                  {r.author?.charAt(0)}
                </div>
                <div>
                  <p className="text-[var(--m-charcoal)] font-medium text-sm">{r.author}</p>
                  <p className="text-[var(--m-warm-gray)] text-xs">{r.meta}</p>
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
  label: 'Medical Patient Reviews',
  fieldsSchema: {
    eyebrow: { type: 'text', label: '섹션 라벨' },
    title: { type: 'textarea', label: '섹션 타이틀', required: true },
    rating: { type: 'text', label: '별점' },
    review1Body: { type: 'textarea', label: '후기 1 본문' },
    review1Author: { type: 'text', label: '후기 1 작성자' },
    review1Meta: { type: 'text', label: '후기 1 메타' },
    review2Body: { type: 'textarea', label: '후기 2 본문' },
    review2Author: { type: 'text', label: '후기 2 작성자' },
    review2Meta: { type: 'text', label: '후기 2 메타' },
    review3Body: { type: 'textarea', label: '후기 3 본문' },
    review3Author: { type: 'text', label: '후기 3 작성자' },
    review3Meta: { type: 'text', label: '후기 3 메타' },
  },
  previewImage: '/component-previews/medical/testimonials.webp',
};

export default Testimonials;
