import { ThemeSectionProps } from '../../types';
import styles from '../cafe.module.css';
import { StarIcon } from './icons';

export default function TestimonialsSection({ section }: ThemeSectionProps) {
  const { data } = section;
  const label = data['label']?.value || '손님 후기';
  const title = data['title']?.value || '이 공간에서\n느낀 것들';
  const ratingValue = data['ratingValue']?.value || '4.9';

  const reviews = [1, 2, 3, 4, 5, 6].map(n => ({
    body: data[`r${n}Body`]?.value,
    author: data[`r${n}Author`]?.value,
    meta: data[`r${n}Meta`]?.value,
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
}
