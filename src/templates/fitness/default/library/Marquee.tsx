import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../fitness.module.css';
import { StarIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Marquee: SectionComponent = function Marquee({ section }: TemplateSectionProps) {
  const { fields } = section;
  const items = [1, 2, 3, 4, 5, 6, 7, 8].map(n => getFieldValue(fields, `item${n}`)).filter(Boolean);

  return (
    <section className="bg-[var(--f-lime)] py-4 overflow-hidden">
      <div className="overflow-hidden">
        <div className={styles.marqueeTrack}>
          {/* Segment A */}
          <div className="flex items-center gap-8 px-4">
            {items.map((item, i) => (
              <span key={i} className="flex items-center gap-8">
                <span className={`${styles.fontCondensed} font-black text-[13px] tracking-[.18em] uppercase text-[var(--f-void)] whitespace-nowrap`}>
                  {item}
                </span>
                <StarIcon size={12} className="text-[var(--f-void)] shrink-0" />
              </span>
            ))}
          </div>
          {/* Segment B */}
          <div className="flex items-center gap-8 px-4" aria-hidden="true">
            {items.map((item, i) => (
              <span key={`b-${i}`} className="flex items-center gap-8">
                <span className={`${styles.fontCondensed} font-black text-[13px] tracking-[.18em] uppercase text-[var(--f-void)] whitespace-nowrap`}>
                  {item}
                </span>
                <StarIcon size={12} className="text-[var(--f-void)] shrink-0" />
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
  category: 'content',
  label: 'Fitness Marquee',
  fieldsSchema: {
    item1: { type: 'text', label: '항목 1' },
    item2: { type: 'text', label: '항목 2' },
    item3: { type: 'text', label: '항목 3' },
    item4: { type: 'text', label: '항목 4' },
    item5: { type: 'text', label: '항목 5' },
    item6: { type: 'text', label: '항목 6' },
    item7: { type: 'text', label: '항목 7' },
    item8: { type: 'text', label: '항목 8' },
  },
  previewImage: '/component-previews/fitness/marquee.webp',
};

export default Marquee;
