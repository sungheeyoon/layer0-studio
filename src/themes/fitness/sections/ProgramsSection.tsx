import { ThemeSectionProps } from '../../types';
import styles from '../fitness.module.css';
import { ArrowUpRightIcon, BoxingIcon, YogaIcon, ChefHatIcon } from './icons';

export default function ProgramsSection({ section }: ThemeSectionProps) {
  const { data } = section;
  const label = data['label']?.value || '프로그램';
  const title = data['title']?.value || '당신의 목표에 맞는 프로그램';
  const description = data['description']?.value || '6가지 전문 프로그램으로 체력 강화, 체형 개선, 재활까지 목적에 맞는 트레이닝을 제공합니다.';

  const programs = [
    {
      id: 'p1',
      title: data['p1Title']?.value,
      desc: data['p1Desc']?.value,
      image: data['p1Image']?.value,
      badge: 'Most Popular',
      colSpan: 'md:col-span-2',
      showArrow: true,
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
      icon: <BoxingIcon size={22} className="text-[var(--f-lime)]" />,
      bg: styles.bgSurface,
    },
    {
      id: 'p4',
      title: data['p4Title']?.value,
      desc: data['p4Desc']?.value,
      icon: <YogaIcon size={22} className="text-[var(--f-lime)]" />,
      bg: styles.bgSurface,
    },
    {
      id: 'p5',
      title: data['p5Title']?.value,
      desc: data['p5Desc']?.value,
      image: data['p5Image']?.value,
    },
    {
      id: 'p6',
      title: data['p6Title']?.value,
      desc: data['p6Desc']?.value,
      icon: <ChefHatIcon size={22} className="text-[var(--f-lime)]" />,
      bg: 'rgba(205, 255, 0, 0.07)',
      borderColor: 'rgba(205, 255, 0, 0.15)',
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
                        <span className={`${styles.fontCondensed} inline-block bg-[var(--f-lime)] text-[#080808] font-black text-[11px] tracking-widest uppercase px-3 py-1 mb-3`}>
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
}
