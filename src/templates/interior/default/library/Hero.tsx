import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../interior.module.css';
import { ArrowRightIcon, PhoneIcon, MedalIcon, ShieldCheckIcon, StarIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Hero: SectionComponent = function Hero({ section }: TemplateSectionProps) {
  const { fields } = section;
  const label = getFieldValue(fields, 'eyebrow') || 'Seoul Premium Interior Studio';
  const estLabel = getFieldValue(fields, 'estLabel') || 'Est. 2015';
  const title = getFieldValue(fields, 'title') || '';
  const description = getFieldValue(fields, 'description') || '';
  const ctaPrimary = getFieldValue(fields, 'ctaPrimary') || '포트폴리오 보기';
  const ctaSecondary = getFieldValue(fields, 'ctaSecondary') || '무료 상담 예약';
  const trust1 = getFieldValue(fields, 'trust1') || '한국 인테리어 대상 2023';
  const trust2 = getFieldValue(fields, 'trust2') || '건설업 면허 보유';
  const trust3 = getFieldValue(fields, 'trust3') || '고객 만족도 4.9/5.0';
  const statValue = getFieldValue(fields, 'statValue') || '280';
  const statLabel = getFieldValue(fields, 'statLabel') || '완성된 프로젝트';
  const projectTitle = getFieldValue(fields, 'projectTitle') || '성북동 단독주택 — 거실 리모델링';

  return (
    <section className={`${styles.heroArt} relative min-h-screen flex items-center pt-16 overflow-hidden`}>
      {/* Decorative grid lines */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(var(--i-gold) 1px, transparent 1px), linear-gradient(90deg, var(--i-gold) 1px, transparent 1px)', backgroundSize: '80px 80px' }}></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full py-24 lg:py-32 relative z-10">
        <div className="grid lg:grid-cols-[1fr_420px] gap-16 items-center">
          {/* Left: Content */}
          <div>
            <div className={`${styles.reveal} ${styles.revealIn} flex items-center gap-3 mb-8`}>
              <span className={styles.secTag}>{label}</span>
              <span className="w-8 h-px bg-[var(--i-gold)] opacity-40"></span>
              <span className={styles.secTag}>{estLabel}</span>
            </div>

            <h1 className={`${styles.reveal} ${styles.revealIn} ${styles.delay1} font-extrabold leading-[1.05] tracking-tight mb-6 text-[var(--i-cream)]`} style={{ fontSize: 'clamp(2.8rem, 6.5vw, 5.2rem)' }}>
              {title.split('\n').map((line, i) => (
                <span key={i}>
                  {line.includes('삶을 바꾸는') ? (
                    <span className={styles.textGoldGrad}>삶을 바꾸는</span>
                  ) : line}
                  <br />
                </span>
              ))}
            </h1>

            <p className={`${styles.reveal} ${styles.revealIn} ${styles.delay2} text-[var(--i-muted)] leading-relaxed mb-10 max-w-xl whitespace-pre-line`} style={{ fontSize: 'clamp(15px, 1.8vw, 17px)' }}>
              {description}
            </p>

            <div className={`${styles.reveal} ${styles.revealIn} ${styles.delay3} flex flex-wrap items-center gap-4`}>
              <a href="#portfolio" className={`${styles.pillBtn} no-underline`}>
                <span className={styles.ic}>
                  <ArrowRightIcon size={16} className="text-[var(--i-dark)]" />
                </span>
                {ctaPrimary}
              </a>
              <a href="#contact" className={`${styles.pillBtnGhost} no-underline`}>
                <PhoneIcon size={15} />
                {ctaSecondary}
              </a>
            </div>

            {/* Trust badges */}
            <div className={`${styles.reveal} ${styles.revealIn} ${styles.delay4} flex flex-wrap items-center gap-6 mt-12 pt-10 border-t border-white border-opacity-5`}>
              <div className="flex items-center gap-2">
                <MedalIcon size={20} className="text-[var(--i-gold)]" />
                <span className="text-[12px] text-[var(--i-muted)]">{trust1}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon size={20} className="text-[var(--i-gold)]" />
                <span className="text-[12px] text-[var(--i-muted)]">{trust2}</span>
              </div>
              <div className="flex items-center gap-2">
                <StarIcon size={20} className="text-[var(--i-gold)]" />
                <span className="text-[12px] text-[var(--i-muted)]">{trust3}</span>
              </div>
            </div>
          </div>

          {/* Right: Visual art */}
          <div className={`${styles.revealRight} ${styles.revealIn} ${styles.delay2} relative hidden lg:block`}>
            <div className="relative" style={{ borderRadius: '24px', overflow: 'hidden', aspectRatio: '3/4' }}>
              <div className={`absolute inset-0 ${styles.imgWarm}`} style={{ background: 'var(--i-grad-hero)' }}></div>
              <svg viewBox="0 0 420 560" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
                <rect x="0" y="400" width="420" height="160" fill="color-mix(in srgb, var(--i-gold) 4%, transparent)"/>
                <rect x="0" y="392" width="420" height="4" fill="color-mix(in srgb, var(--i-gold) 12%, transparent)"/>
                <rect x="60" y="50" width="180" height="280" rx="4" fill="color-mix(in srgb, var(--i-gold) 5%, transparent)" stroke="color-mix(in srgb, var(--i-gold) 20%, transparent)" strokeWidth="1.5"/>
                <line x1="150" y1="50" x2="150" y2="330" stroke="color-mix(in srgb, var(--i-gold) 15%, transparent)" strokeWidth="1"/>
                <line x1="60" y1="190" x2="240" y2="190" stroke="color-mix(in srgb, var(--i-gold) 15%, transparent)" strokeWidth="1"/>
                <polygon points="60,330 240,330 320,400 -20,400" fill="color-mix(in srgb, var(--i-gold) 2.5%, transparent)"/>
                <rect x="20" y="360" width="280" height="40" rx="8" fill="color-mix(in srgb, var(--i-gold) 6%, transparent)"/>
                <rect x="20" y="340" width="280" height="28" rx="6" fill="color-mix(in srgb, var(--i-gold) 4%, transparent)"/>
                <rect x="310" y="370" width="60" height="4" rx="2" fill="color-mix(in srgb, var(--i-gold) 10%, transparent)"/>
                <rect x="336" y="374" width="8" height="26" rx="2" fill="color-mix(in srgb, var(--i-gold) 8%, transparent)"/>
                <polygon points="340,340 330,374 350,374" fill="color-mix(in srgb, var(--i-gold) 6%, transparent)"/>
                <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--i-gold)" stopOpacity="0.12"/>
                  <stop offset="100%" stopColor="var(--i-gold)" stopOpacity="0"/>
                </radialGradient>
                <ellipse cx="340" cy="355" rx="60" ry="50" fill="url(#lampGlow)"/>
                <rect x="370" y="300" width="10" height="100" rx="3" fill="var(--i-svg-leaf-mid)"/>
                <ellipse cx="375" cy="295" rx="28" ry="40" fill="var(--i-svg-leaf-soft)"/>
              </svg>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, color-mix(in srgb, var(--i-dark) 60%, transparent) 100%)' }}></div>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-[11px] text-[var(--i-gold)] opacity-70 tracking-widest mb-1 uppercase">Featured Project</p>
                <p className="text-[15px] font-semibold text-[var(--i-cream)]">{projectTitle}</p>
              </div>
            </div>

            {/* Floating stat */}
            <div className={`absolute -top-4 -right-6 ${styles.bezel}`}>
              <div className={styles.bezelInner} style={{ padding: '16px 20px' }}>
                <p className={`${styles.statNum} ${styles.textGoldGrad}`} style={{ fontSize: '2.2rem' }}>{statValue}<span style={{ fontSize: '1.2rem' }}>+</span></p>
                <p className="text-[11px] text-[var(--i-muted)] mt-1">{statLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <span className="text-[10px] tracking-widest text-[var(--i-muted)] uppercase">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-[var(--i-gold)] to-transparent"></div>
      </div>
    </section>
  );
};

Hero.meta = {
  componentKey: 'hero',
  category: 'hero',
  label: 'Interior Hero',
  fieldsSchema: {
    eyebrow: { type: 'text', label: '상단 라벨' },
    estLabel: { type: 'text', label: '설립 연도 라벨' },
    title: { type: 'textarea', label: '메인 타이틀', required: true },
    description: { type: 'textarea', label: '설명' },
    ctaPrimary: { type: 'text', label: '기본 CTA' },
    ctaSecondary: { type: 'text', label: '보조 CTA' },
    trust1: { type: 'text', label: '신뢰 문구 1' },
    trust2: { type: 'text', label: '신뢰 문구 2' },
    trust3: { type: 'text', label: '신뢰 문구 3' },
    statValue: { type: 'text', label: '플로팅 수치' },
    statLabel: { type: 'text', label: '플로팅 라벨' },
    projectTitle: { type: 'text', label: '대표 프로젝트명' },
  },
  previewImage: '/component-previews/interior/hero.webp',
};

export default Hero;
