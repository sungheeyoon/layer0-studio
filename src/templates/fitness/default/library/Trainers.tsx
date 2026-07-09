import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../fitness.module.css';
import { CupIcon, DiplomaIcon, ClockIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Trainers: SectionComponent = function Trainers({ section }: TemplateSectionProps) {
  const { fields } = section;
  const label = getFieldValue(fields, 'eyebrow') || '트레이너';
  const title = getFieldValue(fields, 'title') || '당신 옆에서\n함께 싸웁니다';
  const description = getFieldValue(fields, 'description') || '';

  const trainers = [1, 2, 3].map(n => ({
    name: getFieldValue(fields, `m${n}Name`),
    role: getFieldValue(fields, `m${n}Role`),
    badge: getFieldValue(fields, `m${n}Badge`),
    image: getFieldValue(fields, `m${n}Image`),
    info1: getFieldValue(fields, `m${n}Info1`),
    info2: getFieldValue(fields, `m${n}Info2`),
    info3: getFieldValue(fields, `m${n}Info3`),
    mt: n === 2 ? 'lg:mt-10' : '',
  })).filter(m => m.name);

  return (
    <section className="py-24 lg:py-32 px-6 lg:px-10 max-w-7xl mx-auto" id="trainers">
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
        <p className="text-[var(--f-soft)] text-[14px] leading-relaxed max-w-[280px]">
          {description}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
        {trainers.map((m, i) => (
          <div key={i} className={`${styles.trainerCard} ${m.mt}`}>
            <div className="aspect-[3/4] overflow-hidden bg-[var(--f-surface)] relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.image}
                alt={m.name}
                className="w-full h-full object-cover object-top"
              />
              {m.badge && (
                <div className={`${styles.clipCorner} absolute top-4 left-4 bg-[var(--f-lime)] px-3 py-1`}>
                  <span className={`${styles.fontCondensed} font-black text-[var(--f-void)] text-[11px] tracking-widest uppercase`}>
                    {m.badge}
                  </span>
                </div>
              )}
            </div>
            <div className="pt-5 pb-2">
              <div className="flex items-start justify-between gap-2 mb-4">
                <div>
                  <h3 className={`${styles.fontCondensed} font-black text-[var(--f-snow)] text-[1.35rem] uppercase tracking-wide`}>
                    {m.name}
                  </h3>
                  <p className="text-[var(--f-soft)] text-[12px] tracking-wide uppercase">{m.role}</p>
                </div>
              </div>
              <div className="space-y-2">
                {m.info1 && (
                  <p className="flex items-center gap-2 text-[var(--f-soft)] text-[12px]">
                    <CupIcon size={14} className="text-[var(--f-lime)] shrink-0" />
                    {m.info1}
                  </p>
                )}
                {m.info2 && (
                  <p className="flex items-center gap-2 text-[var(--f-soft)] text-[12px]">
                    <DiplomaIcon size={14} className="text-[var(--f-lime)] shrink-0" />
                    {m.info2}
                  </p>
                )}
                {m.info3 && (
                  <p className="flex items-center gap-2 text-[var(--f-soft)] text-[12px]">
                    <ClockIcon size={14} className="text-[var(--f-lime)] shrink-0" />
                    {m.info3}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

Trainers.meta = {
  componentKey: 'trainers',
  category: 'content',
  label: 'Fitness Trainers',
  fieldsSchema: {
    eyebrow: { type: 'text', label: '섹션 라벨' },
    title: { type: 'textarea', label: '섹션 타이틀', required: true },
    description: { type: 'textarea', label: '섹션 설명' },
    m1Name: { type: 'text', label: 'M1 이름' },
    m1Role: { type: 'text', label: 'M1 직함' },
    m1Badge: { type: 'text', label: 'M1 배지' },
    m1Image: { type: 'image', label: 'M1 사진' },
    m1Info1: { type: 'text', label: 'M1 정보 1' },
    m1Info2: { type: 'text', label: 'M1 정보 2' },
    m1Info3: { type: 'text', label: 'M1 정보 3' },
    m2Name: { type: 'text', label: 'M2 이름' },
    m2Role: { type: 'text', label: 'M2 직함' },
    m2Badge: { type: 'text', label: 'M2 배지' },
    m2Image: { type: 'image', label: 'M2 사진' },
    m2Info1: { type: 'text', label: 'M2 정보 1' },
    m2Info2: { type: 'text', label: 'M2 정보 2' },
    m2Info3: { type: 'text', label: 'M2 정보 3' },
    m3Name: { type: 'text', label: 'M3 이름' },
    m3Role: { type: 'text', label: 'M3 직함' },
    m3Badge: { type: 'text', label: 'M3 배지' },
    m3Image: { type: 'image', label: 'M3 사진' },
    m3Info1: { type: 'text', label: 'M3 정보 1' },
    m3Info2: { type: 'text', label: 'M3 정보 2' },
    m3Info3: { type: 'text', label: 'M3 정보 3' },
  },
  previewImage: '/component-previews/fitness/trainers.webp',
};

export default Trainers;
