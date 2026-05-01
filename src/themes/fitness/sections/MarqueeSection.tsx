import { ThemeSectionProps } from '../../types';
import styles from '../fitness.module.css';
import { StarIcon } from './icons';

export default function MarqueeSection({ section }: ThemeSectionProps) {
  const { data } = section;
  const items = [1, 2, 3, 4, 5, 6, 7, 8].map(n => data[`item${n}`]?.value).filter(Boolean);

  return (
    <section className="bg-[var(--f-lime)] py-4 overflow-hidden">
      <div className="overflow-hidden">
        <div className={styles.marqueeTrack}>
          {/* Segment A */}
          <div className="flex items-center gap-8 px-4">
            {items.map((item, i) => (
              <span key={i} className="flex items-center gap-8">
                <span className={`${styles.fontCondensed} font-black text-[13px] tracking-[.18em] uppercase text-[#080808] whitespace-nowrap`}>
                  {item}
                </span>
                <StarIcon size={12} className="text-[#080808] shrink-0" />
              </span>
            ))}
          </div>
          {/* Segment B */}
          <div className="flex items-center gap-8 px-4" aria-hidden="true">
            {items.map((item, i) => (
              <span key={`b-${i}`} className="flex items-center gap-8">
                <span className={`${styles.fontCondensed} font-black text-[13px] tracking-[.18em] uppercase text-[#080808] whitespace-nowrap`}>
                  {item}
                </span>
                <StarIcon size={12} className="text-[#080808] shrink-0" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
