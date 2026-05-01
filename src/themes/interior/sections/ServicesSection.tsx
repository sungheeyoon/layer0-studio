import { ThemeSectionProps } from '../../types';
import styles from '../interior.module.css';
import { HomeIcon, BuildingsIcon, MonitorIcon, PaletteIcon, ShieldCheckIcon, ArrowRightIcon } from './icons';

export default function ServicesSection({ section }: ThemeSectionProps) {
  const { data } = section;
  const label = data['label']?.value || 'Our Services';
  const title = data['title']?.value || '';
  const description = data['description']?.value || '';

  const s1Title = data['s1Title']?.value;
  const s1Desc = data['s1Desc']?.value;
  const s1Badge = data['s1Badge']?.value;
  const s1Price = data['s1Price']?.value;

  const services = [
    { title: data['s2Title']?.value, desc: data['s2Desc']?.value, icon: <BuildingsIcon size={22} className="text-[var(--i-gold)]" /> },
    { title: data['s3Title']?.value, desc: data['s3Desc']?.value, icon: <MonitorIcon size={22} className="text-[var(--i-gold)]" /> },
    { title: data['s4Title']?.value, desc: data['s4Desc']?.value, icon: <PaletteIcon size={22} className="text-[var(--i-gold)]" />, isConsulting: true },
    { title: data['s5Title']?.value, desc: data['s5Desc']?.value, icon: <ShieldCheckIcon size={22} className="text-[var(--i-gold)]" />, isAS: true },
  ].filter(s => s.title);

  return (
    <section id="services" className="py-28 lg:py-36" style={{ background: '#0E0C0A' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-16">
          <div className={`${styles.reveal} ${styles.revealIn} flex items-center justify-center gap-3 mb-5`}>
            <span className={styles.goldBar}></span>
            <span className={styles.secTag}>{label}</span>
            <span className={styles.goldBar} style={{ background: 'linear-gradient(270deg, #C9A96E, rgba(201,169,110,0))' }}></span>
          </div>
          <h2 className={`${styles.reveal} ${styles.revealIn} ${styles.delay1} font-extrabold tracking-tight mb-4 text-[var(--i-cream)]`} style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.1 }}>
            {title.split('\n').map((line, i) => (
              <span key={i}>
                {line.includes('에스파시오가 함께합니다') ? (
                  <span className={styles.textGoldGrad}>에스파시오가 함께합니다</span>
                ) : line}
                <br />
              </span>
            ))}
          </h2>
          <p className={`${styles.reveal} ${styles.revealIn} ${styles.delay2} text-[var(--i-muted)] text-[15px] leading-relaxed max-w-lg mx-auto`}>
            {description}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Large (Residential) */}
          {s1Title && (
            <div className={`${styles.reveal} ${styles.revealIn} md:col-span-2 lg:col-span-2 ${styles.bezel}`}>
              <div className={styles.bezelInner} style={{ padding: '36px 36px 40px' }}>
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,169,110,0.12)' }}>
                    <HomeIcon size={22} className="text-[var(--i-gold)]" />
                  </div>
                  {s1Badge && (
                    <span className="text-[11px] text-[var(--i-gold)] tracking-widest uppercase font-medium">{s1Badge}</span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-[var(--i-cream)] mb-3 tracking-tight">{s1Title}</h3>
                <p className="text-[var(--i-muted)] text-[14px] leading-relaxed mb-6">{s1Desc}</p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {['아파트', '빌라', '단독주택', '타운하우스'].map(tag => (
                    <span key={tag} className="text-[12px] text-[var(--i-muted)] px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)' }}>{tag}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}>
                  <div>
                    <p className="text-[11px] text-[var(--i-muted)] mb-1 uppercase">Starting from</p>
                    <p className="text-lg font-bold text-[var(--i-cream)]">평당 <span className={styles.textGoldGrad}>{s1Price}</span>~</p>
                  </div>
                  <a href="#contact" className={`${styles.pillBtnGhost} text-[13px] no-underline`}>
                    상담 문의
                    <ArrowRightIcon size={14} />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Other Service Cards */}
          {services.map((s, i) => (
            <div
              key={i}
              className={`${styles.reveal} ${styles.revealIn} ${styles[`delay${i + 1}` as keyof typeof styles] || ''} ${styles.bezel}`}
              style={s.isAS ? { background: 'linear-gradient(135deg, rgba(201,169,110,0.06), rgba(201,169,110,0.02))', borderColor: 'rgba(201,169,110,0.25)' } : {}}
            >
              <div className={styles.bezelInner} style={{ padding: '32px 28px 36px', borderColor: s.isAS ? 'rgba(201,169,110,0.12)' : undefined }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: s.isAS ? 'rgba(201,169,110,0.15)' : 'rgba(201,169,110,0.12)' }}>
                  {s.icon}
                </div>
                <h3 className="text-lg font-bold text-[var(--i-cream)] mb-3 tracking-tight">{s.title}</h3>
                <p className="text-[var(--i-muted)] text-[13px] leading-relaxed mb-6">{s.desc}</p>
                {s.isConsulting ? (
                  <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}>
                    <p className="text-[13px] text-[var(--i-gold)] font-semibold">첫 상담 무료</p>
                    <ArrowRightIcon size={18} className="text-[var(--i-gold)]" style={{ transform: 'rotate(-45deg)' }} />
                  </div>
                ) : !s.isAS ? (
                   <a href="#contact" className={`${styles.pillBtnGhost} text-[13px] w-full justify-center no-underline`}>
                    상담 문의
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
