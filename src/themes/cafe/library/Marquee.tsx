import { ThemeSectionProps, SectionComponent } from '../../types';
import styles from '../cafe.module.css';
import { CoffeeIcon } from '../sections/icons';

const Marquee: SectionComponent = function Marquee({ section }: ThemeSectionProps) {
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
};

Marquee.meta = {
  componentKey: 'marquee',
  category: 'feature',
  label: 'Ticker Strip',
  dataSchema: {
    item1: { type: 'text', label: '항목 1' },
    item2: { type: 'text', label: '항목 2' },
    item3: { type: 'text', label: '항목 3' },
    item4: { type: 'text', label: '항목 4' },
    item5: { type: 'text', label: '항목 5' },
    item6: { type: 'text', label: '항목 6' },
    item7: { type: 'text', label: '항목 7' },
    item8: { type: 'text', label: '항목 8' },
  },
  previewImage: '/component-previews/cafe/marquee.webp',
};

export default Marquee;
