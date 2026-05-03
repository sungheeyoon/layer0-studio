import { ThemeSectionProps, SectionComponent } from '../../types';
import styles from '../cafe.module.css';
import { ArrowRightIcon, CupIcon, PieChartIcon } from '../sections/icons';

const MenuBento: SectionComponent = function MenuBento({ section }: ThemeSectionProps) {
  const { data } = section;
  const label = data['label']?.value || '메뉴';
  const title = data['title']?.value || '매일 정성껏\n내리는 한 잔';
  const description = data['description']?.value || '';

  const programs = [
    {
      id: 'p1',
      title: data['p1Title']?.value,
      desc: data['p1Desc']?.value,
      price: data['p1Price']?.value,
      image: data['p1Image']?.value,
      badge: data['p1Badge']?.value,
      colSpan: 'md:col-span-2',
    },
    {
      id: 'p2',
      title: data['p2Title']?.value,
      desc: data['p2Desc']?.value,
      image: data['p2Image']?.value,
    },
    {
      id: 'p3',
      title: data['p3Title']?.value,
      desc: data['p3Desc']?.value,
      price: data['p3Price']?.value,
      icon: <CupIcon size={20} className="text-[var(--c-terra)] fill-current" />,
      bg: styles.bgCream,
    },
    {
      id: 'p4',
      title: data['p4Title']?.value,
      desc: data['p4Desc']?.value,
      price: data['p4Price']?.value,
      icon: <PieChartIcon size={20} className="text-[var(--c-terra)] fill-current" />,
      bg: styles.bgCream,
    },
    {
      id: 'p5',
      title: data['p5Title']?.value,
      desc: data['p5Desc']?.value,
      image: data['p5Image']?.value,
      badge: data['p5Badge']?.value,
    },
  ].filter(p => p.title);

  return (
    <section className="py-24 lg:py-32 px-6 lg:px-10 max-w-7xl mx-auto" id="menu">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
        <div className={`${styles.reveal} ${styles.revealIn}`}>
          <p className={`${styles.sectionLabel} mb-5`}>{label}</p>
          <h2
            className={`${styles.fontSerif} leading-[1.1] text-[var(--c-espresso)]`}
            style={{ fontSize: 'clamp(2.2rem, 4vw, 3.6rem)' }}
          >
            {title.split('\n').map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
          </h2>
        </div>
        <p className={`${styles.reveal} ${styles.revealIn} text-[var(--c-dust)] text-[14px] leading-relaxed max-w-[280px]`}>
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[280px] lg:auto-rows-[300px]">
        {programs.map((p, i) => (
          <div
            key={p.id}
            className={`${styles.reveal} ${styles.revealIn} ${styles.menuCard} ${p.colSpan || ''} ${p.image ? '' : 'bg-[var(--c-cream)] border border-[var(--c-linen-dark)] p-7 flex flex-col justify-between spring hover:border-[var(--c-terra)]/40'}`}
          >
            {p.image ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className={styles.menuCardBody}>
                  <div className="flex items-end justify-between">
                    <div>
                      {p.badge && (
                        <span className="inline-block bg-[var(--c-terra)] text-[var(--c-linen)] text-[10px] font-semibold tracking-widest uppercase px-3 py-1 mb-3">
                          {p.badge}
                        </span>
                      )}
                      <h3 className={`${styles.fontSerif} text-[var(--c-linen)] text-[1.5rem] italic mb-1`}>
                        {p.title}
                      </h3>
                      <p className="text-[var(--c-linen)]/65 text-[13px]">{p.desc}</p>
                    </div>
                    {p.price && (
                      <p className={`${styles.fontSerif} text-[var(--c-linen)] text-[1.4rem] font-medium mb-1`}>
                        {p.price}<span className="text-[var(--c-linen)]/60 text-sm">원</span>
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 flex items-center justify-center bg-[var(--c-terra)]/10 border border-[var(--c-terra)]/20 shrink-0">
                  {p.icon}
                </div>
                <div>
                  <h3 className={`${styles.fontSerif} text-[var(--c-espresso)] text-[1.3rem] italic mb-2`}>
                    {p.title}
                  </h3>
                  <p className="text-[var(--c-dust)] text-[13px] leading-relaxed mb-4">{p.desc}</p>
                  {p.price && (
                    <p className={`${styles.fontSerif} text-[var(--c-espresso)] font-medium text-[1.1rem]`}>
                      {p.price}<span className="text-[var(--c-dust)] text-sm">원</span>
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className={`${styles.reveal} ${styles.revealIn} mt-10 flex justify-end`}>
        <a href="#visit" className="no-underline">
          <button className={`${styles.btnGhost} text-[11px] tracking-widest`}>
            <span>전체 메뉴 보기</span>
            <ArrowRightIcon size={14} />
          </button>
        </a>
      </div>
    </section>
  );
};

MenuBento.meta = {
  componentKey: 'menu',
  category: 'menu',
  label: 'Menu (Bento)',
  dataSchema: {
    label: { type: 'text', label: '섹션 라벨' },
    title: { type: 'textarea', label: '섹션 타이틀' },
    description: { type: 'textarea', label: '섹션 설명' },
    p1Badge: { type: 'text', label: 'P1 배지' },
    p1Title: { type: 'text', label: 'P1 제목', required: true },
    p1Desc: { type: 'text', label: 'P1 설명' },
    p1Price: { type: 'text', label: 'P1 가격' },
    p1Image: { type: 'image', label: 'P1 이미지' },
    p2Title: { type: 'text', label: 'P2 제목' },
    p2Desc: { type: 'text', label: 'P2 설명' },
    p2Image: { type: 'image', label: 'P2 이미지' },
    p3Title: { type: 'text', label: 'P3 제목' },
    p3Desc: { type: 'text', label: 'P3 설명' },
    p3Price: { type: 'text', label: 'P3 가격' },
    p4Title: { type: 'text', label: 'P4 제목' },
    p4Desc: { type: 'text', label: 'P4 설명' },
    p4Price: { type: 'text', label: 'P4 가격' },
    p5Badge: { type: 'text', label: 'P5 배지' },
    p5Title: { type: 'text', label: 'P5 제목' },
    p5Desc: { type: 'text', label: 'P5 설명' },
    p5Image: { type: 'image', label: 'P5 이미지' },
  },
  previewImage: '/component-previews/cafe/menu-bento.webp',
};

export default MenuBento;
