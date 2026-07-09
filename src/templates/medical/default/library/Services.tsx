import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../medical.module.css';
import { ArrowRightIcon, MagicStickIcon, SyringeIcon, LeafIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Services: SectionComponent = function Services({ section }: TemplateSectionProps) {
  const { fields } = section;
  const label = getFieldValue(fields, 'eyebrow') || '';
  const title = getFieldValue(fields, 'title') || '';
  const description = getFieldValue(fields, 'description') || '';

  const services = [
    {
      title: getFieldValue(fields, 'service1Title'),
      desc: getFieldValue(fields, 'service1Desc'),
      image: getFieldValue(fields, 'service1Image'),
      badge: '인기 No.1',
      colSpan: 'md:col-span-2',
    },
    {
      title: getFieldValue(fields, 'service2Title'),
      desc: getFieldValue(fields, 'service2Desc'),
      image: getFieldValue(fields, 'service2Image'),
    },
    {
      title: getFieldValue(fields, 'service3Title'),
      desc: getFieldValue(fields, 'service3Desc'),
      dark: true,
      icon: <SyringeIcon size={22} className="text-[var(--m-gold)]" />,
    },
    {
      title: getFieldValue(fields, 'service4Title'),
      desc: getFieldValue(fields, 'service4Desc'),
      light: true,
      icon: <LeafIcon size={22} />,
    },
    {
      title: getFieldValue(fields, 'service5Title'),
      desc: getFieldValue(fields, 'service5Desc'),
      image: getFieldValue(fields, 'service5Image'),
    },
  ].filter(s => s.title);

  return (
    <section className="py-24 lg:py-32 px-6 lg:px-10 max-w-7xl mx-auto" id="services">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-14 gap-6">
        <div>
          <p className={`${styles.sectionLabel} mb-5`}>{label}</p>
          <h2 className={`${styles.fontDisplay} text-[clamp(2rem,3.5vw,3.2rem)] font-light text-[var(--m-charcoal)] leading-[1.12] whitespace-pre-line`}>
            {title}
          </h2>
        </div>
        <p className="text-[var(--m-warm-gray)] text-[14px] leading-relaxed max-w-[280px] whitespace-pre-line">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[280px] lg:auto-rows-[320px]">
        {services.map((s, i) => (
          <div key={i} className={`${styles.bentoCard} ${s.colSpan || ''} ${s.dark ? 'bg-[var(--m-charcoal)] p-8 flex flex-col justify-between' : s.light ? 'bg-[var(--m-cream-dark)] p-8 flex flex-col justify-between' : ''}`}>
            {s.image && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
                <div className={styles.bentoInfo}>
                  {s.badge && (
                    <div className={`${styles.pill} bg-[var(--m-gold)]/20 text-[var(--m-gold)] border border-[var(--m-gold)]/30 mb-3`}>
                      <MagicStickIcon size={12} />
                      {s.badge}
                    </div>
                  )}
                  <h3 className="text-[var(--m-cream)] font-semibold text-lg mb-1">{s.title}</h3>
                  <p className="text-[var(--m-cream)]/65 text-sm">{s.desc}</p>
                </div>
              </>
            )}
            {!s.image && (
              <>
                <div className="w-11 h-11 flex items-center justify-center bg-[var(--m-gold)]/10 border border-[var(--m-gold)]/20 shrink-0">
                  {s.icon}
                </div>
                <div>
                  <h3 className={`${s.dark ? 'text-[var(--m-cream)]' : 'text-[var(--m-charcoal)]'} font-semibold text-xl mb-2`}>{s.title}</h3>
                  <p className={`${s.dark ? 'text-[var(--m-cream)]/50' : 'text-[var(--m-warm-gray)]'} text-sm leading-relaxed`}>{s.desc}</p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-end">
        <a href="#booking">
          <button className={`${styles.btnLight} text-[11px] tracking-widest`}>
            <span>전체 진료 보기</span>
            <ArrowRightIcon size={14} />
          </button>
        </a>
      </div>
    </section>
  );
};

Services.meta = {
  componentKey: 'services',
  category: 'features',
  label: 'Medical Services',
  fieldsSchema: {
    eyebrow: { type: 'text', label: '섹션 라벨' },
    title: { type: 'textarea', label: '섹션 타이틀', required: true },
    description: { type: 'textarea', label: '섹션 설명' },
    service1Title: { type: 'text', label: '서비스 1 제목' },
    service1Desc: { type: 'text', label: '서비스 1 설명' },
    service1Image: { type: 'image', label: '서비스 1 이미지' },
    service2Title: { type: 'text', label: '서비스 2 제목' },
    service2Desc: { type: 'text', label: '서비스 2 설명' },
    service2Image: { type: 'image', label: '서비스 2 이미지' },
    service3Title: { type: 'text', label: '서비스 3 제목' },
    service3Desc: { type: 'text', label: '서비스 3 설명' },
    service4Title: { type: 'text', label: '서비스 4 제목' },
    service4Desc: { type: 'text', label: '서비스 4 설명' },
    service5Title: { type: 'text', label: '서비스 5 제목' },
    service5Desc: { type: 'text', label: '서비스 5 설명' },
    service5Image: { type: 'image', label: '서비스 5 이미지' },
  },
  previewImage: '/component-previews/medical/services.webp',
};

export default Services;
