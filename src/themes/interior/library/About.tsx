import { TemplateSectionProps, SectionComponent } from '../../types';
import styles from '../interior.module.css';
import { PenIcon, DiamondIcon, ClockIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const About: SectionComponent = function About({ section }: TemplateSectionProps) {
  const { data } = section;
  const label = getFieldValue(data, 'label') || 'About Espacio';
  const title = getFieldValue(data, 'title') || '';
  const description = getFieldValue(data, 'description') || '';
  const projectTitle = getFieldValue(data, 'projectTitle') || '한남동 타운하우스 — 주방 리노베이션';

  const values = [
    { title: getFieldValue(data, 'v1Title'), desc: getFieldValue(data, 'v1Desc'), icon: <PenIcon size={18} className="text-[var(--i-gold)]" /> },
    { title: getFieldValue(data, 'v2Title'), desc: getFieldValue(data, 'v2Desc'), icon: <DiamondIcon size={18} className="text-[var(--i-gold)]" /> },
    { title: getFieldValue(data, 'v3Title'), desc: getFieldValue(data, 'v3Desc'), icon: <ClockIcon size={18} className="text-[var(--i-gold)]" /> },
  ].filter(v => v.title);

  return (
    <section id="about" className="py-28 lg:py-36 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: Visual */}
          <div className={`${styles.revealLeft} ${styles.revealIn} relative order-2 lg:order-1`}>
            <div className="relative" style={{ aspectRatio: '4/5', borderRadius: '20px', overflow: 'hidden' }}>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(150deg, #1E160E 0%, #140F09 50%, #1A1209 100%)' }}></div>
              <svg viewBox="0 0 480 600" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
                <rect x="40" y="380" width="400" height="60" rx="4" fill="rgba(201,169,110,0.06)" stroke="rgba(201,169,110,0.12)" strokeWidth="1"/>
                <rect x="40" y="376" width="400" height="8" rx="2" fill="rgba(201,169,110,0.1)"/>
                <line x1="180" y1="0" x2="180" y2="260" stroke="rgba(201,169,110,0.15)" strokeWidth="1"/>
                <ellipse cx="180" cy="264" rx="28" ry="12" fill="rgba(201,169,110,0.06)" stroke="rgba(201,169,110,0.2)" strokeWidth="1"/>
                <radialGradient id="pendantGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#C9A96E" stopOpacity="0.15"/>
                  <stop offset="100%" stopColor="#C9A96E" stopOpacity="0"/>
                </radialGradient>
                <ellipse cx="180" cy="320" rx="100" ry="80" fill="url(#pendantGlow)"/>
              </svg>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(12,10,8,.7) 100%)' }}></div>
              <div className="absolute bottom-6 left-6">
                <p className="text-[11px] text-[var(--i-gold)] opacity-60 tracking-widest mb-1 uppercase">Recent Work</p>
                <p className="text-sm font-semibold text-[var(--i-cream)]">{projectTitle}</p>
              </div>
            </div>
            {/* Second small image placeholder */}
            <div className="absolute -right-6 top-1/3 w-40 border border-white border-opacity-10 rounded-xl overflow-hidden shadow-2xl" style={{ aspectRatio: '3/4' }}>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, #181C18 0%, #111411 100%)' }}></div>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(12,10,8,.75) 100%)' }}></div>
              <p className="absolute bottom-3 left-3 right-3 text-[10px] font-medium text-[var(--i-cream)]">침실 설계</p>
            </div>
          </div>

          {/* Right: Content */}
          <div className="order-1 lg:order-2">
            <div className={`${styles.reveal} ${styles.revealIn} flex items-center gap-3 mb-6`}>
              <span className={styles.secTag}>{label}</span>
              <span className={styles.goldBar}></span>
            </div>
            <h2 className={`${styles.reveal} ${styles.revealIn} ${styles.delay1} font-extrabold tracking-tight mb-6 text-[var(--i-cream)]`} style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', lineHeight: 1.1 }}>
              {title.split('\n').map((line, i) => (
                <span key={i}>
                  {line.includes('삶의 방식') ? (
                    <span className={styles.textGoldGrad}>삶의 방식</span>
                  ) : line}
                  <br />
                </span>
              ))}
            </h2>
            <div className={`${styles.reveal} ${styles.revealIn} ${styles.delay2} space-y-4 text-[var(--i-muted)] leading-relaxed mb-10 whitespace-pre-line`} style={{ fontSize: '15px' }}>
              {description}
            </div>

            {/* Values */}
            <div className={`${styles.reveal} ${styles.revealIn} ${styles.delay3} space-y-4`}>
              {values.map((v, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(201,169,110,0.1)' }}>
                    {v.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--i-cream)] text-sm mb-1">{v.title}</p>
                    <p className="text-[var(--i-muted)] text-[13px] leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

About.meta = {
  componentKey: 'about',
  category: 'content',
  label: 'Interior About',
  dataSchema: {
    label: { type: 'text', label: '섹션 라벨' },
    title: { type: 'textarea', label: '섹션 타이틀', required: true },
    description: { type: 'textarea', label: '설명' },
    v1Title: { type: 'text', label: '가치 1 제목' },
    v1Desc: { type: 'text', label: '가치 1 설명' },
    v2Title: { type: 'text', label: '가치 2 제목' },
    v2Desc: { type: 'text', label: '가치 2 설명' },
    v3Title: { type: 'text', label: '가치 3 제목' },
    v3Desc: { type: 'text', label: '가치 3 설명' },
    projectTitle: { type: 'text', label: '이미지 프로젝트명' },
  },
  previewImage: '/component-previews/interior/about.webp',
};

export default About;
