import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../interior.module.css';
import { ChatIcon, RulerIcon, PenIcon, LetterIcon, HammerIcon, KeyIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const STEP_ICONS = [
  <ChatIcon key="1" size={22} className="text-[var(--i-gold)]" />,
  <RulerIcon key="2" size={22} className="text-[var(--i-gold)]" />,
  <PenIcon key="3" size={22} className="text-[var(--i-gold)]" />,
  <LetterIcon key="4" size={22} className="text-[var(--i-gold)]" />,
  <HammerIcon key="5" size={22} className="text-[var(--i-gold)]" />,
  <KeyIcon key="6" size={22} className="text-[var(--i-gold)]" />,
];

const Process: SectionComponent = function Process({ section }: TemplateSectionProps) {
  const { data } = section;
  const label = getFieldValue(data, 'label') || 'How We Work';
  const title = getFieldValue(data, 'title') || '';

  const steps = [1, 2, 3, 4, 5, 6].map(n => ({
    title: getFieldValue(data, `step${n}Title`),
    desc: getFieldValue(data, `step${n}Desc`),
  })).filter(s => s.title);

  return (
    <section id="process" className="py-28 lg:py-36" style={{ background: '#0E0C0A' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-16">
          <div className={`${styles.reveal} ${styles.revealIn} flex items-center justify-center gap-3 mb-5`}>
            <span className={styles.goldBar}></span>
            <span className={styles.secTag}>{label}</span>
            <span className={styles.goldBar} style={{ background: 'linear-gradient(270deg, #C9A96E, rgba(201,169,110,0))' }}></span>
          </div>
          <h2 className={`${styles.reveal} ${styles.revealIn} ${styles.delay1} font-extrabold tracking-tight text-[var(--i-cream)]`} style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.1 }}>
            {title.split('\n').map((line, i) => (
              <span key={i}>
                {line.includes('6단계 진행 과정') ? (
                  <span className={styles.textGoldGrad}>6단계 진행 과정</span>
                ) : line}
                <br />
              </span>
            ))}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {steps.map((s, i) => (
            <div key={i} className={`${styles.reveal} ${styles.revealIn} ${styles[`delay${i}` as keyof typeof styles] || ''} text-center`}>
              <div className="relative inline-flex">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.25)' }}>
                  {STEP_ICONS[i]}
                </div>
              </div>
              <div className="text-[11px] text-[var(--i-gold)] font-bold mb-2 uppercase">{String(i + 1).padStart(2, '0')}</div>
              <p className="text-sm font-semibold text-[var(--i-cream)] mb-1">{s.title}</p>
              <p className="text-[12px] text-[var(--i-muted)] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

Process.meta = {
  componentKey: 'process',
  category: 'content',
  label: 'Interior Process',
  dataSchema: {
    label: { type: 'text', label: '섹션 라벨' },
    title: { type: 'textarea', label: '섹션 타이틀', required: true },
    step1Title: { type: 'text', label: '1단계 제목' },
    step1Desc: { type: 'text', label: '1단계 설명' },
    step2Title: { type: 'text', label: '2단계 제목' },
    step2Desc: { type: 'text', label: '2단계 설명' },
    step3Title: { type: 'text', label: '3단계 제목' },
    step3Desc: { type: 'text', label: '3단계 설명' },
    step4Title: { type: 'text', label: '4단계 제목' },
    step4Desc: { type: 'text', label: '4단계 설명' },
    step5Title: { type: 'text', label: '5단계 제목' },
    step5Desc: { type: 'text', label: '5단계 설명' },
    step6Title: { type: 'text', label: '6단계 제목' },
    step6Desc: { type: 'text', label: '6단계 설명' },
  },
  previewImage: '/component-previews/interior/process.webp',
};

export default Process;
