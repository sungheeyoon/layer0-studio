import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../legal.module.css';
import { StarIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Testimonials: SectionComponent = function Testimonials({ section }: TemplateSectionProps) {
  const { data } = section;
  const title = getFieldValue(data, 'title') || '';

  const reviews = [1, 2, 3].map(n => ({
    body: getFieldValue(data, `review${n}Body`) || '',
    author: getFieldValue(data, `review${n}Author`) || '',
    meta: getFieldValue(data, `review${n}Meta`) || '',
    featured: n === 2,
    avatar: getFieldValue(data, `review${n}Avatar`) || `https://i.pravatar.cc/150?u=legal_review_${n}`,
  }));

  return (
    <section className="py-24 md:py-32 px-4 bg-white">
      <div className={styles.container}>
        <div className="text-center mb-16">
          <div className={`${styles.sectionSep} mx-auto mb-4`}></div>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">Client Reviews</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--l-navy)] tracking-tight">
            {title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reviews.map((r, i) => (
            <div key={i} className={`rounded-2xl p-6 border transition-shadow hover:shadow-lg ${r.featured ? 'bg-[var(--l-navy)] text-white border-transparent' : 'bg-stone-50 border-stone-200 text-[var(--l-navy)]'}`}>
              <div className="flex mb-3 gap-0.5">
                {[...Array(5)].map((_, j) => (
                  <StarIcon key={j} size={14} className="text-amber-400" />
                ))}
              </div>
              <p className={`font-serif text-4xl leading-none opacity-60 mb-[-1rem] ${r.featured ? 'text-amber-400' : 'text-amber-600'}`}>&ldquo;</p>
              <p className={`text-sm leading-relaxed mb-5 ${r.featured ? 'text-blue-100/80' : 'text-stone-700'}`}>
                {r.body}
              </p>
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.avatar} alt={r.author} className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <p className={`text-sm font-bold ${r.featured ? 'text-white' : 'text-[var(--l-navy)]'}`}>{r.author}</p>
                  <p className={`text-xs ${r.featured ? 'text-blue-300/60' : 'text-stone-400'}`}>{r.meta}</p>
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
  label: 'Legal Testimonials',
  dataSchema: {
    title: { type: 'text', label: '섹션 타이틀', required: true },
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
  previewImage: '/component-previews/legal/testimonials.webp',
};

export default Testimonials;
