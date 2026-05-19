import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../medical.module.css';
import { VerifiedCheckIcon, StarIcon, ShieldCheckIcon, GraduationCapIcon, HospitalIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Marquee: SectionComponent = function Marquee({ section }: TemplateSectionProps) {
  const { data } = section;
  const items = [1, 2, 3, 4, 5, 6].map(n => getFieldValue(data, `item${n}`)).filter(Boolean);

  const icons = [
    <VerifiedCheckIcon key="1" size={14} className="text-[#C8A97E]" />,
    <StarIcon key="2" size={14} className="text-[#C8A97E]" />,
    <ShieldCheckIcon key="3" size={14} className="text-[#C8A97E]" />,
    <StarIcon key="4" size={14} className="text-[#C8A97E]" />,
    <GraduationCapIcon key="5" size={14} className="text-[#C8A97E]" />,
    <HospitalIcon key="6" size={14} className="text-[#C8A97E]" />,
  ];

  return (
    <section className="bg-[#1C1917] py-5 overflow-hidden">
      <div className="overflow-hidden">
        <div className={styles.marqueeTrack}>
          {/* Segment A */}
          <div className="flex items-center gap-12 px-6">
            {items.map((item, i) => (
              <span key={i} className="flex items-center gap-2.5 whitespace-nowrap text-[#F9F7F3]/50 text-[11px] tracking-[.18em] uppercase font-medium">
                {icons[i % icons.length]}
                {item}
                <span className="text-[#F9F7F3]/15 ml-6">|</span>
              </span>
            ))}
          </div>
          {/* Segment B */}
          <div className="flex items-center gap-12 px-6" aria-hidden="true">
            {items.map((item, i) => (
              <span key={`b-${i}`} className="flex items-center gap-2.5 whitespace-nowrap text-[#F9F7F3]/50 text-[11px] tracking-[.18em] uppercase font-medium">
                {icons[i % icons.length]}
                {item}
                <span className="text-[#F9F7F3]/15 ml-6">|</span>
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
  dataSchema: {
    item1: { type: 'text', label: '항목 1' },
    item2: { type: 'text', label: '항목 2' },
    item3: { type: 'text', label: '항목 3' },
    item4: { type: 'text', label: '항목 4' },
    item5: { type: 'text', label: '항목 5' },
    item6: { type: 'text', label: '항목 6' },
  },
  previewImage: '/component-previews/medical/marquee.webp',
};

export default Marquee;
