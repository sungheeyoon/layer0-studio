import { ThemeSectionProps, SectionComponent } from '../../types';
import styles from '../medical.module.css';
import { ArrowRightIcon, MagicStickIcon, SyringeIcon, LeafIcon } from '../sections/icons';

const Services: SectionComponent = function Services({ section }: ThemeSectionProps) {
  const { data } = section;
  const label = data['label']?.value || '';
  const title = data['title']?.value || '';
  const description = data['description']?.value || '';

  const services = [
    {
      title: data['service1Title']?.value,
      desc: data['service1Desc']?.value,
      image: data['service1Image']?.value,
      badge: '인기 No.1',
      colSpan: 'md:col-span-2',
    },
    {
      title: data['service2Title']?.value,
      desc: data['service2Desc']?.value,
      image: data['service2Image']?.value,
    },
    {
      title: data['service3Title']?.value,
      desc: data['service3Desc']?.value,
      dark: true,
      icon: <SyringeIcon size={22} className="text-[#C8A97E]" />,
    },
    {
      title: data['service4Title']?.value,
      desc: data['service4Desc']?.value,
      light: true,
      icon: <LeafIcon size={22} />,
    },
    {
      title: data['service5Title']?.value,
      desc: data['service5Desc']?.value,
      image: data['service5Image']?.value,
    },
  ].filter(s => s.title);

  return (
    <section className="py-24 lg:py-32 px-6 lg:px-10 max-w-7xl mx-auto" id="services">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-14 gap-6">
        <div>
          <p className={`${styles.sectionLabel} mb-5`}>{label}</p>
          <h2 className={`${styles.fontDisplay} text-[clamp(2rem,3.5vw,3.2rem)] font-light text-[#1C1917] leading-[1.12] whitespace-pre-line`}>
            {title}
          </h2>
        </div>
        <p className="text-[#9C9189] text-[14px] leading-relaxed max-w-[280px] whitespace-pre-line">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[280px] lg:auto-rows-[320px]">
        {services.map((s, i) => (
          <div key={i} className={`${styles.bentoCard} ${s.colSpan || ''} ${s.dark ? 'bg-[#1C1917] p-8 flex flex-col justify-between' : s.light ? 'bg-[#F0EBE1] p-8 flex flex-col justify-between' : ''}`}>
            {s.image && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
                <div className={styles.bentoInfo}>
                  {s.badge && (
                    <div className={`${styles.pill} bg-[#C8A97E]/20 text-[#C8A97E] border border-[#C8A97E]/30 mb-3`}>
                      <MagicStickIcon size={12} />
                      {s.badge}
                    </div>
                  )}
                  <h3 className="text-[#F9F7F3] font-semibold text-lg mb-1">{s.title}</h3>
                  <p className="text-[#F9F7F3]/65 text-sm">{s.desc}</p>
                </div>
              </>
            )}
            {!s.image && (
              <>
                <div className="w-11 h-11 flex items-center justify-center bg-[#C8A97E]/10 border border-[#C8A97E]/20 shrink-0">
                  {s.icon}
                </div>
                <div>
                  <h3 className={`${s.dark ? 'text-[#F9F7F3]' : 'text-[#1C1917]'} font-semibold text-xl mb-2`}>{s.title}</h3>
                  <p className={`${s.dark ? 'text-[#F9F7F3]/50' : 'text-[#9C9189]'} text-sm leading-relaxed`}>{s.desc}</p>
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
  dataSchema: {
    label: { type: 'text', label: '섹션 라벨' },
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
