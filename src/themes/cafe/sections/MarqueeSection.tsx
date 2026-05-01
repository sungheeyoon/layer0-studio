import { ThemeSectionProps } from '../../types';
import styles from '../cafe.module.css';
import { CoffeeIcon } from './icons';

export default function MarqueeSection({ section }: ThemeSectionProps) {
  const { data } = section;
  const items = [1, 2, 3, 4, 5, 6, 7, 8].map(n => data[`item${n}`]?.value).filter(Boolean);

  return (
    <section className="bg-[var(--c-espresso)] py-5 overflow-hidden">
      <div className="overflow-hidden">
        <div className={styles.marqueeTrack}>
          {/* Segment A */}
          <div className="flex items-center gap-10 px-5">
            {items.map((item, i) => (
              <span key={i} className="flex items-center gap-10">
                <span className={`${styles.fontSerif} italic text-[var(--c-linen)] opacity-50 text-[14px] whitespace-nowrap`}>
                  {item}
                </span>
                <CoffeeIcon size={13} className="text-[var(--c-terra)] shrink-0 fill-current" />
              </span>
            ))}
          </div>
          {/* Segment B */}
          <div className="flex items-center gap-10 px-5" aria-hidden="true">
            {items.map((item, i) => (
              <span key={`b-${i}`} className="flex items-center gap-10">
                <span className={`${styles.fontSerif} italic text-[var(--c-linen)] opacity-50 text-[14px] whitespace-nowrap`}>
                  {item}
                </span>
                <CoffeeIcon size={13} className="text-[var(--c-terra)] shrink-0 fill-current" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
