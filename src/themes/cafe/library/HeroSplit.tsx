import { ThemeSectionProps, SectionComponent } from '../../types';
import styles from '../cafe.module.css';
import { ArrowRightIcon, LeafIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const HeroSplit: SectionComponent = function HeroSplit({ section }: ThemeSectionProps) {
  const { data } = section;
  const label = getFieldValue(data['label']) || 'Seoul Seongsu — Specialty Coffee';
  const title1 = getFieldValue(data['title1']) || '천천히,';
  const titleAccent = getFieldValue(data['titleAccent']) || '제대로';
  const subtitle = getFieldValue(data['subtitle']) || '— 한 잔의 완성';
  const description = getFieldValue(data['description']) || '';
  const image = getFieldValue(data['image']) || '';
  const ctaPrimary = getFieldValue(data['ctaPrimary']) || '메뉴 보기';
  const ctaSecondary = getFieldValue(data['ctaSecondary']) || '카페 소개';

  const stats = [1, 2, 3].map(n => ({
    value: getFieldValue(data[`stat${n}Value`]),
    label: getFieldValue(data[`stat${n}Label`]),
  })).filter(s => s.value);

  const seasonTag = getFieldValue(data['seasonTag']) || 'Spring Menu';

  return (
    <section className="min-h-[100dvh] flex items-stretch pt-[68px]" id="hero">
      <div className="w-full grid lg:grid-cols-2">
        {/* Left: image */}
        <div className="relative overflow-hidden bg-[var(--c-linen-dark)] h-[55vw] max-h-[600px] lg:h-auto lg:max-h-none">
          {image && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={image}
              alt="Cafe"
              className="w-full h-full object-cover"
              loading="eager"
            />
          )}
          <div className="absolute inset-0 bg-[var(--c-espresso)]/5 pointer-events-none"></div>

          {/* Season tag */}
          <div className="absolute top-8 left-8">
            <div className="flex items-center gap-2 bg-[var(--c-terra)] text-[var(--c-linen)] px-4 py-2">
              <LeafIcon size={13} className="fill-current" />
              <span className="text-[11px] font-semibold tracking-widest uppercase">{seasonTag}</span>
            </div>
          </div>
        </div>

        {/* Right: content */}
        <div className="flex flex-col justify-center px-8 lg:px-14 xl:px-20 py-16 bg-[var(--c-linen)]">
          <p className={`${styles.reveal} ${styles.revealIn} ${styles.sectionLabel} mb-8`}>{label}</p>

          <div className={`${styles.reveal} ${styles.revealIn} mb-7`}>
            <h1
              className={`${styles.fontSerif} leading-[1.06] text-[var(--c-espresso)]`}
              style={{ fontSize: 'clamp(3rem, 4.5vw, 4.2rem)' }}
            >
              {title1}<br />
              <em style={{ color: 'var(--c-terra)', fontStyle: 'italic' }}>{titleAccent}</em>
            </h1>
            <p className={`${styles.fontSerif} italic text-[var(--c-dust)] mt-2`} style={{ fontSize: 'clamp(1.1rem, 1.8vw, 1.3rem)' }}>
              {subtitle}
            </p>
          </div>

          <p className={`${styles.reveal} ${styles.revealIn} text-[var(--c-dust)] text-[15px] leading-[1.9] mb-10 max-w-[400px] whitespace-pre-line`}>
            {description}
          </p>

          <div className={`${styles.reveal} ${styles.revealIn} flex flex-wrap gap-4 mb-12`}>
            <a href="#menu" className="no-underline">
              <button className={styles.btnEspresso}>
                <span>{ctaPrimary}</span>
                <ArrowRightIcon size={17} />
              </button>
            </a>
            <a href="#story" className="no-underline">
              <button className={styles.btnGhost}>
                <span>{ctaSecondary}</span>
              </button>
            </a>
          </div>

          {/* Mini info */}
          <div className={`${styles.reveal} ${styles.revealIn} grid grid-cols-3 gap-5 pt-8 border-t border-[var(--c-linen-dark)]`}>
            {stats.map((s, i) => (
              <div key={i}>
                <p className={`${styles.fontSerif} text-[1.5rem] font-medium text-[var(--c-espresso)] leading-none`}>
                  {s.value}
                </p>
                <p className="text-[10px] text-[var(--c-dust)] mt-1 tracking-wide uppercase">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

HeroSplit.meta = {
  componentKey: 'hero-split',
  category: 'hero',
  label: 'Hero (Split Layout)',
  dataSchema: {
    label: { type: 'text', label: '상단 라벨' },
    title1: { type: 'text', label: '타이틀 1행' },
    titleAccent: { type: 'text', label: '강조 타이틀' },
    subtitle: { type: 'text', label: '서브타이틀' },
    description: { type: 'textarea', label: '설명' },
    image: { type: 'image', label: '배경 이미지', required: true },
    ctaPrimary: { type: 'text', label: '기본 CTA' },
    ctaSecondary: { type: 'text', label: '보조 CTA' },
    stat1Value: { type: 'text', label: '통계 1 수치' },
    stat1Label: { type: 'text', label: '통계 1 라벨' },
    stat2Value: { type: 'text', label: '통계 2 수치' },
    stat2Label: { type: 'text', label: '통계 2 라벨' },
    stat3Value: { type: 'text', label: '통계 3 수치' },
    stat3Label: { type: 'text', label: '통계 3 라벨' },
  },
  previewImage: '/component-previews/cafe/hero-split.webp',
};

export default HeroSplit;
