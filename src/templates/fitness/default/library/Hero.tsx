import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../fitness.module.css';
import { ArrowRightIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Hero: SectionComponent = function Hero({ section }: TemplateSectionProps) {
  const { data } = section;
  const label = getFieldValue(data, 'label') || 'Seoul Gangnam — Since 2010';
  const titleLine1 = getFieldValue(data, 'title1') || '한계를';
  const titleLine2 = getFieldValue(data, 'title2') || '다시';
  const titleLine3 = getFieldValue(data, 'title3') || '정의합니다';
  const description = getFieldValue(data, 'description') || '';
  const bgImage = getFieldValue(data, 'backgroundImage') || '';
  const ctaPrimary = getFieldValue(data, 'ctaPrimary') || '무료 체험 신청';
  const ctaSecondary = getFieldValue(data, 'ctaSecondary') || '프로그램 보기';

  const stats = [1, 2, 3, 4].map(n => ({
    value: getFieldValue(data, `stat${n}Value`),
    label: getFieldValue(data, `stat${n}Label`),
    suffix: getFieldValue(data, `stat${n}Suffix`),
  })).filter(s => s.value);

  return (
    <section className="relative min-h-[100dvh] flex flex-col justify-end overflow-hidden" id="hero">
      {/* Background image */}
      {bgImage && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={bgImage}
          alt="APEX FITNESS"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--f-void)] via-[var(--f-void)]/60 to-[var(--f-void)]/20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--f-void)]/70 via-[var(--f-void)]/30 to-transparent pointer-events-none"></div>

      {/* Live badge */}
      <div className="absolute top-24 right-6 lg:right-10 flex items-center gap-2.5 bg-[var(--f-surface)]/80 backdrop-blur-sm border border-[var(--f-border)] px-4 py-2.5">
        <span className={styles.dotLive}></span>
        <span className={`${styles.fontCondensed} font-bold text-[12px] tracking-widest text-[var(--f-soft)] uppercase`}>
          Open Now
        </span>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pb-16 lg:pb-24 pt-[88px] w-full">
        <div className="mb-3">
          <p className={styles.sectionLabel}>{label}</p>
        </div>

        <div>
          <h1
            className={`${styles.fontCondensed} font-black uppercase leading-[.92] tracking-tight text-[var(--f-snow)]`}
            style={{ fontSize: 'clamp(4.5rem, 12vw, 11rem)' }}
          >
            {titleLine1}<br />
            <span style={{ color: 'var(--f-lime)', fontStyle: 'italic' }}>{titleLine2}</span><br />
            {titleLine3}
          </h1>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:gap-10">
          <p className="text-[var(--f-soft)] text-[15px] leading-relaxed max-w-sm">
            {description}
          </p>
          <div className="flex flex-wrap gap-4 shrink-0">
            <a href="#join">
              <button className={styles.btnLime}>
                <span>{ctaPrimary}</span>
                <ArrowRightIcon size={16} />
              </button>
            </a>
            <a href="#programs">
              <button className={styles.btnOutline}>
                <span>{ctaSecondary}</span>
              </button>
            </a>
          </div>
        </div>

        {/* Bottom stat strip */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-0 border-t border-[var(--f-border)] pt-8">
          {stats.map((s, i) => (
            <div key={i} className={`${i < stats.length - 1 ? 'border-r border-[var(--f-border)]' : ''} ${i === 0 ? 'pr-6' : i === stats.length - 1 ? 'pl-6' : 'px-6'}`}>
              <p className={`${styles.fontCondensed} font-black text-[2.6rem] text-[var(--f-snow)] leading-none`}>
                {s.value}<span style={{ color: 'var(--f-lime)' }}>{s.suffix}</span>
              </p>
              <p className="text-[var(--f-soft)] text-[12px] tracking-wide mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

Hero.meta = {
  componentKey: 'hero',
  category: 'hero',
  label: 'Fitness Hero',
  dataSchema: {
    label: { type: 'text', label: '상단 라벨' },
    title1: { type: 'text', label: '타이틀 1행', required: true },
    title2: { type: 'text', label: '타이틀 2행 (강조)', required: true },
    title3: { type: 'text', label: '타이틀 3행', required: true },
    description: { type: 'textarea', label: '설명' },
    backgroundImage: { type: 'image', label: '배경 이미지', required: true },
    ctaPrimary: { type: 'text', label: '기본 CTA' },
    ctaSecondary: { type: 'text', label: '보조 CTA' },
    stat1Value: { type: 'text', label: '통계 1 수치' },
    stat1Suffix: { type: 'text', label: '통계 1 접미사' },
    stat1Label: { type: 'text', label: '통계 1 라벨' },
    stat2Value: { type: 'text', label: '통계 2 수치' },
    stat2Suffix: { type: 'text', label: '통계 2 접미사' },
    stat2Label: { type: 'text', label: '통계 2 라벨' },
    stat3Value: { type: 'text', label: '통계 3 수치' },
    stat3Suffix: { type: 'text', label: '통계 3 접미사' },
    stat3Label: { type: 'text', label: '통계 3 라벨' },
    stat4Value: { type: 'text', label: '통계 4 수치' },
    stat4Suffix: { type: 'text', label: '통계 4 접미사' },
    stat4Label: { type: 'text', label: '통계 4 라벨' },
  },
  previewImage: '/component-previews/fitness/hero.webp',
};

export default Hero;
