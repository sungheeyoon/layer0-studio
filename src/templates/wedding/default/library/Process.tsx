import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../wedding.module.css';
import { ChatIcon, NotebookIcon, PaletteIcon, SparkleIcon } from '../sections/icons';
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

const STEP_ICONS = [
  <ChatIcon key="1" size={24} />,
  <NotebookIcon key="2" size={24} />,
  <PaletteIcon key="3" size={24} />,
  <SparkleIcon key="4" size={24} />,
];

const processSchema = {
  eyebrow: { type: 'text', label: '상단 라벨' },
  title: { type: 'text', label: '타이틀', required: true },
  step1Title: { type: 'text', label: '스텝 1 제목' },
  step1Body: { type: 'textarea', label: '스텝 1 설명' },
  step2Title: { type: 'text', label: '스텝 2 제목' },
  step2Body: { type: 'textarea', label: '스텝 2 설명' },
  step3Title: { type: 'text', label: '스텝 3 제목' },
  step3Body: { type: 'textarea', label: '스텝 3 설명' },
  step4Title: { type: 'text', label: '스텝 4 제목' },
  step4Body: { type: 'textarea', label: '스텝 4 설명' },
  ctaText: { type: 'text', label: 'CTA 버튼' },
  ctaUrl: { type: 'url', label: 'CTA 링크' },
  ctaNote: { type: 'text', label: 'CTA 안내 문구' },
} as const satisfies FieldsSchema;

type ProcessContent = ValuesOf<typeof processSchema>;

const Process: SectionComponent = function Process({ section }: TemplateSectionProps) {
  const content = section.fields as ProcessContent;
  const eyebrow = content.eyebrow || '';
  const title = content.title || '';
  const ctaText = content.ctaText || '';
  const ctaUrl = content.ctaUrl || '#';
  const ctaNote = content.ctaNote || '';

  const steps = ([1, 2, 3, 4] as const)
    .map((n) => ({
      title: content[`step${n}Title`] || '',
      body: content[`step${n}Body`] || '',
    }))
    .filter((s) => s.title);

  return (
    <section className={`${styles.section} ${styles.bgDark900}`}>
      <div className={styles.sectionInnerNarrow}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          {eyebrow && <div className={styles.lineOrnament} style={{ marginBottom: '2rem', justifyContent: 'center' }}>{eyebrow}</div>}
          <h2 className={styles.sectionTitle}>{title}</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: '1.5rem',
        }}>
          {steps.map((step, i) => {
            const isLast = i === steps.length - 1;
            return (
              <div key={i} style={{ textAlign: 'center' }}>
                <div className={`${styles.stepCircle} ${isLast ? styles.stepCircleGold : ''}`}>
                  {STEP_ICONS[i]}
                </div>
                <p className={`${styles.stepNumber} ${isLast ? styles.stepNumberGold : ''}`}>
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 style={{ color: 'var(--w-cream)', fontWeight: 700, marginBottom: '0.5rem', wordBreak: 'keep-all' }}>
                  {step.title}
                </h3>
                <p style={{ color: 'color-mix(in srgb, var(--w-cream) 40%, transparent)', fontSize: '0.875rem', lineHeight: 1.65, wordBreak: 'keep-all', margin: 0 }}>
                  {step.body}
                </p>
              </div>
            );
          })}
        </div>

        {ctaText && (
          <div style={{ marginTop: '4rem', textAlign: 'center' }}>
            <a href={ctaUrl} className={styles.btnBlush}>
              {ctaText}
            </a>
            {ctaNote && (
              <p style={{ fontSize: '0.75rem', color: 'color-mix(in srgb, var(--w-cream) 30%, transparent)', marginTop: '0.75rem' }}>
                {ctaNote}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

Process.meta = {
  componentKey: 'process',
  category: 'content',
  label: 'Wedding Process',
  fieldsSchema: processSchema,
  previewImage: '/component-previews/wedding/process.webp',
};

export default Process;
