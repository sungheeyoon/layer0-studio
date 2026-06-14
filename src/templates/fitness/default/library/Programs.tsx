import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../fitness.module.css';
import { ArrowUpRightIcon, BoxingIcon, YogaIcon, ChefHatIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Programs: SectionComponent = function Programs({ section }: TemplateSectionProps) {
  const { data } = section;
  const label = getFieldValue(data, 'eyebrow') || '프로그램';
  const title = getFieldValue(data, 'title') || '당신의 목표에 맞는 프로그램';
  const description = getFieldValue(data, 'description') || '';

  const programs = [
    {
      id: 'p1',
      title: getFieldValue(data, 'p1Title'),
      desc: getFieldValue(data, 'p1Desc'),
      image: getFieldValue(data, 'p1Image'),
      badge: 'Most Popular',
      colSpan: 'md:col-span-2',
      showArrow: true,
    },
    {
      id: 'p2',
      title: getFieldValue(data, 'p2Title'),
      desc: getFieldValue(data, 'p2Desc'),
      image: getFieldValue(data, 'p2Image'),
    },
    {
      id: 'p3',
      title: getFieldValue(data, 'p3Title'),
      desc: getFieldValue(data, 'p3Desc'),
      icon: <BoxingIcon size={22} className="text-[var(--f-lime)]" />,
      bg: styles.bgSurface,
    },
    {
      id: 'p4',
      title: getFieldValue(data, 'p4Title'),
      desc: getFieldValue(data, 'p4Desc'),
      icon: <YogaIcon size={22} className="text-[var(--f-lime)]" />,
      bg: styles.bgSurface,
    },
    {
      id: 'p5',
      title: getFieldValue(data, 'p5Title'),
      desc: getFieldValue(data, 'p5Desc'),
      image: getFieldValue(data, 'p5Image'),
    },
    {
      id: 'p6',
      title: getFieldValue(data, 'p6Title'),
      desc: getFieldValue(data, 'p6Desc'),
      icon: <ChefHatIcon size={22} className="text-[var(--f-lime)]" />,
      bg: 'color-mix(in srgb, var(--f-lime) 7%, transparent)',
      borderColor: 'color-mix(in srgb, var(--f-lime) 15%, transparent)',
    },
  ].filter(p => p.title);

  return (
    <section className="py-24 lg:py-32 px-6 lg:px-10 max-w-7xl mx-auto" id="programs">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
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
        <p className="text-[var(--f-soft)] text-[14px] leading-relaxed max-w-[300px]">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-[260px] lg:auto-rows-[300px]">
        {programs.map((p) => (
          <div
            key={p.id}
            className={`${styles.progCard} ${p.colSpan || ''} ${p.bg || ''} ${p.icon ? 'p-7 flex flex-col justify-between border border-[var(--f-border)] spring hover:border-[var(--f-lime)]/30' : ''}`}
            style={p.borderColor ? { borderColor: p.borderColor } : {}}
          >
            {p.image && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover"
                />
                <div className={styles.progCardBody}>
                  <div className="flex items-end justify-between">
                    <div>
                      {p.badge && (
                        <span className={`${styles.fontCondensed} inline-block bg-[var(--f-lime)] text-[var(--f-void)] font-black text-[11px] tracking-widest uppercase px-3 py-1 mb-3`}>
                          {p.badge}
                        </span>
                      )}
                      <h3 className={`${styles.fontCondensed} font-black text-[var(--f-snow)] text-[1.6rem] uppercase tracking-wide leading-none mb-1`}>
                        {p.title}
                      </h3>
                      <p className="text-[var(--f-snow)]/60 text-[13px]">{p.desc}</p>
                    </div>
                    {p.showArrow && (
                      <ArrowUpRightIcon size={28} className={`${styles.hoverArrow} text-[var(--f-lime)] shrink-0 mb-1`} />
                    )}
                  </div>
                </div>
              </>
            )}
            {p.icon && (
              <>
                <div className="w-11 h-11 bg-[var(--f-lime)]/10 border border-[var(--f-lime)]/20 flex items-center justify-center shrink-0">
                  {p.icon}
                </div>
                <div>
                  <h3 className={`${styles.fontCondensed} font-black text-[var(--f-snow)] text-[1.5rem] uppercase tracking-wide leading-none mb-2`}>
                    {p.title}
                  </h3>
                  <p className="text-[var(--f-soft)] text-[13px] leading-relaxed">{p.desc}</p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

Programs.meta = {
  componentKey: 'programs',
  category: 'features',
  label: 'Fitness Programs',
  dataSchema: {
    eyebrow: { type: 'text', label: '섹션 라벨' },
    title: { type: 'textarea', label: '섹션 타이틀', required: true },
    description: { type: 'textarea', label: '섹션 설명' },
    p1Title: { type: 'text', label: 'P1 제목' },
    p1Desc: { type: 'text', label: 'P1 설명' },
    p1Image: { type: 'image', label: 'P1 이미지' },
    p2Title: { type: 'text', label: 'P2 제목' },
    p2Desc: { type: 'text', label: 'P2 설명' },
    p2Image: { type: 'image', label: 'P2 이미지' },
    p3Title: { type: 'text', label: 'P3 제목' },
    p3Desc: { type: 'text', label: 'P3 설명' },
    p4Title: { type: 'text', label: 'P4 제목' },
    p4Desc: { type: 'text', label: 'P4 설명' },
    p5Title: { type: 'text', label: 'P5 제목' },
    p5Desc: { type: 'text', label: 'P5 설명' },
    p5Image: { type: 'image', label: 'P5 이미지' },
    p6Title: { type: 'text', label: 'P6 제목' },
    p6Desc: { type: 'text', label: 'P6 설명' },
  },
  previewImage: '/component-previews/fitness/programs.webp',
};

export default Programs;
