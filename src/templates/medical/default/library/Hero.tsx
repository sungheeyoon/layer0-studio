import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../medical.module.css';
import { ArrowRightIcon, StarIcon } from '../sections/icons';
import { renderAccentTitle } from '../sections/title-parts';
import { getFieldValue } from '@/domain/entities/template.entity';

const Hero: SectionComponent = function Hero({ section }: TemplateSectionProps) {
  const { data } = section;
  const label = getFieldValue(data, 'eyebrow') || '';
  const title = getFieldValue(data, 'title') || '';
  const description = getFieldValue(data, 'description') || '';
  const image = getFieldValue(data, 'image') || '';
  const statValue = getFieldValue(data, 'statValue') || '';
  const statLabel = getFieldValue(data, 'statLabel') || '';
  const sinceLabel = getFieldValue(data, 'sinceLabel') || '';
  const ctaPrimary = getFieldValue(data, 'ctaPrimary') || '';
  const ctaSecondary = getFieldValue(data, 'ctaSecondary') || '';

  const stats = [1, 2, 3].map(n => ({
    value: getFieldValue(data, `stat${n}Value`),
    label: getFieldValue(data, `stat${n}Label`),
  })).filter(s => s.value);

  return (
    <section className="min-h-[90vh] flex items-stretch" id="hero">
      <div className="w-full grid lg:grid-cols-[58fr_42fr]">
        {/* Left: hero image */}
        <div className="relative overflow-hidden bg-[var(--m-cream-dark)] order-2 lg:order-1 h-[55vw] max-h-[680px] lg:h-auto lg:max-h-none">
          {image && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={image}
              alt="Medical Clinic"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--m-charcoal)]/30 via-[var(--m-charcoal)]/5 to-transparent pointer-events-none"></div>

          {/* Floating stat badge */}
          {statValue && (
            <div className="absolute bottom-8 left-8 shadow-2xl">
              <div className={`${styles.floatBadge} bg-[var(--m-cream)]/95 backdrop-blur-sm px-6 py-5 border border-[var(--m-warm-light)]/70`}>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className={`${styles.fontDisplay} text-4xl font-light text-[var(--m-charcoal)]`}>{statValue}</span>
                  <span className="text-[var(--m-gold)] font-semibold text-base">+</span>
                </div>
                <p className="text-[11px] text-[var(--m-warm-gray)] tracking-wider uppercase">{statLabel}</p>
              </div>
            </div>
          )}

          {/* Since badge */}
          {sinceLabel && (
            <div className="absolute top-8 right-8">
              <div className={`${styles.pill} bg-[var(--m-cream)]/90 backdrop-blur-sm text-[var(--m-charcoal)] border border-[var(--m-warm-light)]/60`}>
                <StarIcon size={13} className="text-[var(--m-gold)]" />
                {sinceLabel}
              </div>
            </div>
          )}
        </div>

        {/* Right: content */}
        <div className="flex flex-col justify-center px-8 lg:px-14 xl:px-20 py-16 order-1 lg:order-2 bg-[var(--m-cream)]">
          <p className={`${styles.sectionLabel} mb-8`}>{label}</p>

          <div className="mb-6">
            <h1 className={`${styles.fontDisplay} text-[clamp(2.6rem,5vw,4.4rem)] font-light leading-[1.06] text-[var(--m-charcoal)]`}>
              {renderAccentTitle(title, 'not-italic text-[var(--m-gold)]')}
            </h1>
          </div>

          <p className="text-[var(--m-warm-gray)] text-[15px] leading-[1.8] mb-10 max-w-[340px] whitespace-pre-line">
            {description}
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            {ctaPrimary && (
              <a href="#booking">
                <button className={styles.btnDark}>
                  <span>{ctaPrimary}</span>
                  <ArrowRightIcon size={18} />
                </button>
              </a>
            )}
            {ctaSecondary && (
              <a href="#space">
                <button className={styles.btnLight}>
                  <span>{ctaSecondary}</span>
                </button>
              </a>
            )}
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-[var(--m-warm-light)]">
            {stats.map((s, i) => (
              <div key={i}>
                <p className={`${styles.fontDisplay} text-[2rem] font-light text-[var(--m-charcoal)]`}>
                  {s.value}
                  <span className="text-[var(--m-gold)] text-xl">
                    {s.label?.includes('%') ? '%' : s.label?.includes('인') ? '인' : '+'}
                  </span>
                </p>
                <p className="text-[11px] text-[var(--m-warm-gray)] mt-1 tracking-wide">
                  {s.label?.replace('%', '').replace('인', '').replace('+', '')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

Hero.meta = {
  componentKey: 'hero',
  category: 'hero',
  label: 'Medical Hero',
  dataSchema: {
    eyebrow: { type: 'text', label: '상단 라벨' },
    title: { type: 'textarea', label: '메인 타이틀', required: true },
    description: { type: 'textarea', label: '설명' },
    image: { type: 'image', label: '히어로 이미지' },
    statValue: { type: 'text', label: '플로팅 통계 값' },
    statLabel: { type: 'text', label: '플로팅 통계 라벨' },
    sinceLabel: { type: 'text', label: '설립 연도 라벨' },
    ctaPrimary: { type: 'text', label: '기본 CTA' },
    ctaSecondary: { type: 'text', label: '보조 CTA' },
    stat1Value: { type: 'text', label: '통계 1 값' },
    stat1Label: { type: 'text', label: '통계 1 라벨' },
    stat2Value: { type: 'text', label: '통계 2 값' },
    stat2Label: { type: 'text', label: '통계 2 라벨' },
    stat3Value: { type: 'text', label: '통계 3 값' },
    stat3Label: { type: 'text', label: '통계 3 라벨' },
  },
  previewImage: '/component-previews/medical/hero.webp',
};

export default Hero;
