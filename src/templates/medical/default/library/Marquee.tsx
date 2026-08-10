import { TemplateBlockProps, BlockComponent } from '../../../types';
import styles from '../medical.module.css';
import { VerifiedCheckIcon, StarIcon, ShieldCheckIcon, GraduationCapIcon, HospitalIcon } from '../sections/icons';
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

const marqueeSchema = {
  item1: { type: 'text', label: '항목 1' },
  item2: { type: 'text', label: '항목 2' },
  item3: { type: 'text', label: '항목 3' },
  item4: { type: 'text', label: '항목 4' },
  item5: { type: 'text', label: '항목 5' },
  item6: { type: 'text', label: '항목 6' },
} as const satisfies FieldsSchema;

type MarqueeContent = ValuesOf<typeof marqueeSchema>;

const Marquee: BlockComponent = function Marquee({ block }: TemplateBlockProps) {
  const content = block.fields as MarqueeContent;
  const items = ([1, 2, 3, 4, 5, 6] as const).map(n => content[`item${n}`]).filter(Boolean);

  const icons = [
    <VerifiedCheckIcon key="1" size={14} className="text-[var(--m-gold)]" />,
    <StarIcon key="2" size={14} className="text-[var(--m-gold)]" />,
    <ShieldCheckIcon key="3" size={14} className="text-[var(--m-gold)]" />,
    <StarIcon key="4" size={14} className="text-[var(--m-gold)]" />,
    <GraduationCapIcon key="5" size={14} className="text-[var(--m-gold)]" />,
    <HospitalIcon key="6" size={14} className="text-[var(--m-gold)]" />,
  ];

  return (
    <section className="bg-[var(--m-charcoal)] py-5 overflow-hidden">
      <div className="overflow-hidden">
        <div className={styles.marqueeTrack}>
          {/* Segment A */}
          <div className="flex items-center gap-12 px-6">
            {items.map((item, i) => (
              <span key={i} className="flex items-center gap-2.5 whitespace-nowrap text-[var(--m-cream)]/50 text-[11px] tracking-[.18em] uppercase font-medium">
                {icons[i % icons.length]}
                {item}
                <span className="text-[var(--m-cream)]/15 ml-6">|</span>
              </span>
            ))}
          </div>
          {/* Segment B */}
          <div className="flex items-center gap-12 px-6" aria-hidden="true">
            {items.map((item, i) => (
              <span key={`b-${i}`} className="flex items-center gap-2.5 whitespace-nowrap text-[var(--m-cream)]/50 text-[11px] tracking-[.18em] uppercase font-medium">
                {icons[i % icons.length]}
                {item}
                <span className="text-[var(--m-cream)]/15 ml-6">|</span>
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
  label: 'Medical Certifications',
  fieldsSchema: marqueeSchema,
  previewImage: '/component-previews/medical/marquee.webp',
};

export default Marquee;
