import { ThemeSectionProps, SectionComponent } from '../../types';
import styles from '../cafe.module.css';
import { ArrowRightIcon, LeafIcon } from '../sections/icons';

const HeroImage: SectionComponent = function HeroImage({ section }: ThemeSectionProps) {
  const { data } = section;
  const label = data['label']?.value || 'Seoul Seongsu — Specialty Coffee';
  const title1 = data['title1']?.value || '천천히,';
  const titleAccent = data['titleAccent']?.value || '제대로';
  const subtitle = data['subtitle']?.value || '— 한 잔의 완성';
  const description = data['description']?.value || '';
  const image = data['image']?.value || '';
  const ctaPrimary = data['ctaPrimary']?.value || '메뉴 보기';
  const ctaSecondary = data['ctaSecondary']?.value || '카페 소개';

  const stats = [1, 2, 3].map(n => ({
    value: data[`stat${n}Value`]?.value,
    label: data[`stat${n}Label`]?.value,
  })).filter(s => s.value);

  const badgeText = data['badgeText']?.value || '"Roasted in-house"';
  const badgeSubtext = data['badgeSubtext']?.value || '직접 로스팅한 원두';
  const seasonTag = data['seasonTag']?.value || 'Spring Menu';

  return (
    <section className="min-h-[100dvh] flex items-stretch pt-[68px]" id="hero">
      <div className="w-full grid lg:grid-cols-[52fr_48fr]">
        {/* Left: content */}
        <div className="flex flex-col justify-center px-8 lg:px-14 xl:px-20 py-16 order-2 lg:order-1 bg-[var(--c-linen)]">
          <p className={`${styles.reveal} ${styles.revealIn} ${styles.sectionLabel} mb-8`}>{label}</p>

          <div className={`${styles.reveal} ${styles.revealIn} mb-7`}>
            <h1
              className={`${styles.fontSerif} leading-[1.06] text-[var(--c-espresso)]`}
              style={{ fontSize: 'clamp(3rem, 5.5vw, 5.2rem)' }}
            >
              {title1}<br />
              <em style={{ color: 'var(--c-terra)', fontStyle: 'italic' }}>{titleAccent}</em>
            </h1>
            <p className={`${styles.fontSerif} italic text-[var(--c-dust)] mt-2`} style={{ fontSize: 'clamp(1.1rem, 2vw, 1.5rem)' }}>
              {subtitle}
            </p>
          </div>

          <p className={`${styles.reveal} ${styles.revealIn} text-[var(--c-dust)] text-[15px] leading-[1.9] mb-10 max-w-[360px] whitespace-pre-line`}>
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
                <p className={`${styles.fontSerif} text-[1.8rem] font-medium text-[var(--c-espresso)] leading-none`}>
                  {s.value}
                </p>
                <p className="text-[11px] text-[var(--c-dust)] mt-1 tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: hero image */}
        <div className="relative overflow-hidden bg-[var(--c-linen-dark)] order-1 lg:order-2 h-[55vw] max-h-[600px] lg:h-auto lg:max-h-none">
          {image && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={image}
              alt="Cafe"
              className="w-full h-full object-cover"
              loading="eager"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--c-espresso)]/20 pointer-events-none"></div>

          {/* Float badge */}
          <div className={`absolute bottom-8 right-8 ${styles.floatSoft}`}>
            <div className="bg-[var(--c-linen)]/95 backdrop-blur-sm px-5 py-4 shadow-xl border border-[var(--c-linen-dark)]/70">
              <p className={`${styles.fontSerif} text-[var(--c-espresso)] text-[1.1rem] font-medium italic mb-0.5`}>{badgeText}</p>
              <p className="text-[11px] text-[var(--c-dust)] tracking-wider uppercase">{badgeSubtext}</p>
            </div>
          </div>

          {/* Season tag */}
          <div className="absolute top-8 left-8">
            <div className="flex items-center gap-2 bg-[var(--c-terra)] text-[var(--c-linen)] px-4 py-2">
              <LeafIcon size={13} className="fill-current" />
              <span className="text-[11px] font-semibold tracking-widest uppercase">{seasonTag}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

HeroImage.meta = {
  componentKey: 'hero-image',
  category: 'hero',
  label: 'Hero (Image Background)',
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
    badgeText: { type: 'text', label: '플로팅 배지 텍스트' },
    badgeSubtext: { type: 'text', label: '플로팅 배지 보조텍스트' },
    seasonTag: { type: 'text', label: '시즌 태그' },
  },
  previewImage: '/component-previews/cafe/hero-image.webp',
};

export default HeroImage;
