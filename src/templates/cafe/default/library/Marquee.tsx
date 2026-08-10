import { TemplateBlockProps, BlockComponent } from '../../../types';
import styles from '../cafe.module.css';
import { CoffeeIcon } from '../sections/icons';
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

const marqueeSchema = {
  item1: { type: 'text', label: '항목 1' },
  item2: { type: 'text', label: '항목 2' },
  item3: { type: 'text', label: '항목 3' },
  item4: { type: 'text', label: '항목 4' },
  item5: { type: 'text', label: '항목 5' },
  item6: { type: 'text', label: '항목 6' },
  item7: { type: 'text', label: '항목 7' },
  item8: { type: 'text', label: '항목 8' },
} as const satisfies FieldsSchema;

type MarqueeContent = ValuesOf<typeof marqueeSchema>;

const Marquee: BlockComponent = function Marquee({ block }: TemplateBlockProps) {
  const content = block.fields as MarqueeContent;
  const items = ([1, 2, 3, 4, 5, 6, 7, 8] as const).map(n => content[`item${n}`]).filter(Boolean);

  return (
    <section className="bg-[var(--color-secondary)] py-5 overflow-hidden">
      <div className="overflow-hidden">
        <div className={styles.marqueeTrack}>
          {/* Segment A */}
          <div className="flex items-center gap-10 px-5">
            {items.map((item, i) => (
              <span key={i} className="flex items-center gap-10">
                <span className={`${styles.fontSerif} italic text-[var(--color-surface)] opacity-50 text-[14px] whitespace-nowrap`}>
                  {item}
                </span>
                <CoffeeIcon size={13} className="text-[var(--color-primary)] shrink-0 fill-current" />
              </span>
            ))}
          </div>
          {/* Segment B */}
          <div className="flex items-center gap-10 px-5" aria-hidden="true">
            {items.map((item, i) => (
              <span key={`b-${i}`} className="flex items-center gap-10">
                <span className={`${styles.fontSerif} italic text-[var(--color-surface)] opacity-50 text-[14px] whitespace-nowrap`}>
                  {item}
                </span>
                <CoffeeIcon size={13} className="text-[var(--color-primary)] shrink-0 fill-current" />
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
  fieldsSchema: marqueeSchema,
  previewImage: '/component-previews/cafe/marquee.webp',
};

export default Marquee;
