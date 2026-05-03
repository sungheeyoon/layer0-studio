import { ThemeSectionProps, SectionComponent } from '../../types';
import styles from '../interior.module.css';
import { ArrowRightIcon } from '../sections/icons';

const Portfolio: SectionComponent = function Portfolio({ section }: ThemeSectionProps) {
  const { data } = section;
  const label = data['label']?.value || 'Portfolio';
  const title = data['title']?.value || '';

  const projects = [
    {
      id: 'p1',
      meta: data['p1Meta']?.value,
      title: data['p1Title']?.value,
      desc: data['p1Desc']?.value,
      height: '520px',
      rowSpan: 'md:row-span-2',
      bg: 'linear-gradient(150deg, #211810 0%, #160F09 50%, #1D1308 100%)',
      svg: (
        <svg viewBox="0 0 360 520" className={styles.portCardImg} preserveAspectRatio="xMidYMid slice">
          <rect x="0" y="0" width="360" height="520" fill="rgba(28,18,10,1)"/>
          <rect x="0" y="0" width="200" height="520" fill="rgba(40,28,16,0.8)"/>
          <rect x="30" y="80" width="120" height="160" rx="2" fill="rgba(201,169,110,0.06)" stroke="rgba(201,169,110,0.15)" strokeWidth="1"/>
          <rect x="20" y="360" width="240" height="80" rx="10" fill="rgba(201,169,110,0.07)"/>
          <rect x="20" y="340" width="240" height="28" rx="8" fill="rgba(201,169,110,0.05)"/>
          <rect x="280" y="200" width="4" height="200" rx="2" fill="rgba(201,169,110,0.1)"/>
          <radialGradient id="floorGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C9A96E" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#C9A96E" stopOpacity="0"/>
          </radialGradient>
          <ellipse cx="282" cy="240" rx="70" ry="90" fill="url(#floorGlow)"/>
        </svg>
      )
    },
    {
      id: 'p2',
      meta: data['p2Meta']?.value,
      title: data['p2Title']?.value,
      height: '250px',
      colSpan: 'md:col-span-2',
      bg: 'linear-gradient(135deg, #161B1E 0%, #111518 100%)',
      svg: (
        <svg viewBox="0 0 700 250" className={styles.portCardImg} preserveAspectRatio="xMidYMid slice">
          <rect x="0" y="0" width="700" height="250" fill="rgba(18,22,25,1)"/>
          <rect x="100" y="120" width="500" height="8" rx="3" fill="rgba(201,169,110,0.1)"/>
          <line x1="230" y1="0" x2="230" y2="80" stroke="rgba(201,169,110,0.12)" strokeWidth="1"/>
          <ellipse cx="230" cy="84" rx="22" ry="9" fill="rgba(201,169,110,0.07)" stroke="rgba(201,169,110,0.2)" strokeWidth="1"/>
          <radialGradient id="tableGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C9A96E" stopOpacity="0.1"/>
            <stop offset="100%" stopColor="#C9A96E" stopOpacity="0"/>
          </radialGradient>
          <ellipse cx="350" cy="120" rx="280" ry="70" fill="url(#tableGlow)"/>
        </svg>
      )
    },
    {
      id: 'p3',
      meta: data['p3Meta']?.value,
      title: data['p3Title']?.value,
      height: '255px',
      bg: 'linear-gradient(145deg, #181C18 0%, #111411 100%)',
      svg: (
        <svg viewBox="0 0 340 255" className={styles.portCardImg} preserveAspectRatio="xMidYMid slice">
          <rect x="0" y="0" width="340" height="255" fill="rgba(16,20,16,1)"/>
          <rect x="60" y="100" width="220" height="80" rx="10" fill="rgba(201,169,110,0.05)" stroke="rgba(201,169,110,0.1)" strokeWidth="1"/>
          <rect x="75" y="140" width="80" height="40" rx="8" fill="rgba(201,169,110,0.06)"/>
          <rect x="185" y="140" width="80" height="40" rx="8" fill="rgba(201,169,110,0.06)"/>
          <radialGradient id="sideGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C9A96E" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#C9A96E" stopOpacity="0"/>
          </radialGradient>
          <ellipse cx="50" cy="130" rx="60" ry="50" fill="url(#sideGlow)"/>
        </svg>
      )
    },
    {
      id: 'p4',
      meta: data['p4Meta']?.value,
      title: data['p4Title']?.value,
      height: '255px',
      bg: 'linear-gradient(145deg, #16181E 0%, #101218 100%)',
      svg: (
        <svg viewBox="0 0 340 255" className={styles.portCardImg} preserveAspectRatio="xMidYMid slice">
          <rect x="0" y="0" width="340" height="255" fill="rgba(14,16,22,1)"/>
          <rect x="20" y="150" width="300" height="8" rx="3" fill="rgba(201,169,110,0.1)"/>
          <rect x="120" y="80" width="100" height="70" rx="4" fill="rgba(201,169,110,0.04)" stroke="rgba(201,169,110,0.12)" strokeWidth="1"/>
          <radialGradient id="screenGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8BB4D8" stopOpacity="0.15"/>
            <stop offset="100%" stopColor="#8BB4D8" stopOpacity="0"/>
          </radialGradient>
          <rect x="124" y="84" width="92" height="62" rx="2" fill="url(#screenGlow)"/>
        </svg>
      )
    },
  ].filter(p => p.title);

  return (
    <section id="portfolio" className="py-28 lg:py-36">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <div className={`${styles.reveal} ${styles.revealIn} flex items-center gap-3 mb-5`}>
              <span className={styles.secTag}>{label}</span>
              <span className={styles.goldBar}></span>
            </div>
            <h2 className={`${styles.reveal} ${styles.revealIn} ${styles.delay1} font-extrabold tracking-tight text-[var(--i-cream)]`} style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.1 }}>
              {title.split('\n').map((line, i) => (
                <span key={i}>
                  {line.includes('대표 작업물') ? (
                    <span className={styles.textGoldGrad}>대표 작업물</span>
                  ) : line}
                  <br />
                </span>
              ))}
            </h2>
          </div>
          <a href="#contact" className={`${styles.reveal} ${styles.revealIn} ${styles.delay2} ${styles.pillBtnGhost} self-start md:self-auto no-underline`}>
            전체 포트폴리오 보기
            <ArrowRightIcon size={14} />
          </a>
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.map((p, i) => (
            <div key={p.id} className={`${styles.reveal} ${styles.revealIn} ${styles[`delay${i}` as keyof typeof styles] || ''} ${p.rowSpan || ''} ${p.colSpan || ''} ${styles.portCard}`} style={{ height: p.height, background: p.bg }}>
              <div className="absolute inset-0 w-full h-full">
                {p.svg}
              </div>
              <div className={styles.portOverlay}></div>
              <div className={styles.portInfo}>
                <p className="text-[11px] text-[var(--i-gold)] tracking-widest mb-1 uppercase">{p.meta}</p>
                <p className="text-base font-bold text-[var(--i-cream)]">{p.title}</p>
                {p.desc && <p className="text-[12px] text-[var(--i-muted)] mt-1">{p.desc}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

Portfolio.meta = {
  componentKey: 'portfolio',
  category: 'content',
  label: 'Interior Portfolio',
  dataSchema: {
    label: { type: 'text', label: '섹션 라벨' },
    title: { type: 'textarea', label: '섹션 타이틀', required: true },
    p1Meta: { type: 'text', label: 'P1 메타' },
    p1Title: { type: 'text', label: 'P1 제목' },
    p1Desc: { type: 'text', label: 'P1 설명' },
    p2Meta: { type: 'text', label: 'P2 메타' },
    p2Title: { type: 'text', label: 'P2 제목' },
    p3Meta: { type: 'text', label: 'P3 메타' },
    p3Title: { type: 'text', label: 'P3 제목' },
    p4Meta: { type: 'text', label: 'P4 메타' },
    p4Title: { type: 'text', label: 'P4 제목' },
  },
  previewImage: '/component-previews/interior/portfolio.webp',
};

export default Portfolio;
