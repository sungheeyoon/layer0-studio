import { ThemeSectionProps } from '../../types';
import styles from '../fitness.module.css';
import { CupIcon, DiplomaIcon, ClockIcon } from './icons';

export default function TrainersSection({ section }: ThemeSectionProps) {
  const { data } = section;
  const label = data['label']?.value || '트레이너';
  const title = data['title']?.value || '당신 옆에서\n함께 싸웁니다';
  const description = data['description']?.value || '국가대표 출신부터 국제 자격증 보유자까지, 검증된 전문가만이 APEX에 있습니다.';

  const trainers = [1, 2, 3].map(n => ({
    name: data[`m${n}Name`]?.value,
    role: data[`m${n}Role`]?.value,
    badge: data[`m${n}Badge`]?.value,
    image: data[`m${n}Image`]?.value,
    info1: data[`m${n}Info1`]?.value,
    info2: data[`m${n}Info2`]?.value,
    info3: data[`m${n}Info3`]?.value,
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
                  <span className={`${styles.fontCondensed} font-black text-[#080808] text-[11px] tracking-widest uppercase`}>
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
}
