import { ThemeSectionProps } from '../../types';
import styles from '../fitness.module.css';
import { StarIcon } from './icons';

export default function TestimonialsSection({ section }: ThemeSectionProps) {
  const { data } = section;
  const label = data['label']?.value || '멤버 후기';
  const title = data['title']?.value || '결과가\n모든 걸\n말합니다';
  const ratingValue = data['ratingValue']?.value || '4.9';
  const ratingLabel = data['ratingLabel']?.value || 'Google 리뷰 기준 • 894개 후기';

  const reviews = [1, 2, 3, 4, 5, 6].map(n => ({
    body: data[`r${n}Body`]?.value,
    author: data[`r${n}Author`]?.value,
    meta: data[`r${n}Meta`]?.value,
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
}
