import { TemplateBlockProps, BlockComponent } from '../../../types';
import styles from '../wedding.module.css';
import { ArrowRightIcon } from '../sections/icons';
import { renderAccentTitle } from '../sections/title-parts';
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

const philosophySchema = {
  eyebrow: { type: 'text', label: '상단 라벨' },
  title: { type: 'textarea', label: '타이틀', required: true },
  body: { type: 'textarea', label: '본문' },
  ctaText: { type: 'text', label: 'CTA 버튼' },
  ctaUrl: { type: 'url', label: 'CTA 링크' },
} as const satisfies FieldsSchema;

type PhilosophyContent = ValuesOf<typeof philosophySchema>;

const Philosophy: BlockComponent = function Philosophy({ block }: TemplateBlockProps) {
  const content = block.fields as PhilosophyContent;
  const eyebrow = content.eyebrow || '';
  const title = content.title || '';
  const body = content.body || '';
  const ctaText = content.ctaText || '';
  const ctaUrl = content.ctaUrl || '#';

  return (
    <section className={`${styles.section} ${styles.bgDark800}`}>
      <div className={styles.sectionInnerProse} style={{ textAlign: 'center' }}>
        {eyebrow && <div className={styles.lineOrnament} style={{ marginBottom: '2.5rem', justifyContent: 'center' }}>{eyebrow}</div>}
        <h2 className={styles.sectionTitleDisplay} style={{ marginBottom: '2rem' }}>
          {renderAccentTitle(title, styles.titleAccent)}
        </h2>
        {body && (
          <p style={{
            color: 'color-mix(in srgb, var(--w-cream) 50%, transparent)',
            lineHeight: 1.7,
            fontSize: '1.0625rem',
            wordBreak: 'keep-all',
            maxWidth: '40rem',
            margin: '0 auto',
          }}>
            {body}
          </p>
        )}
        {ctaText && (
          <div style={{ marginTop: '2.5rem' }}>
            <a href={ctaUrl} className={styles.btnBlush}>
              {ctaText}
              <ArrowRightIcon size={16} />
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

Philosophy.meta = {
  componentKey: 'philosophy',
  category: 'content',
  label: 'Wedding Philosophy',
  fieldsSchema: philosophySchema,
  previewImage: '/component-previews/wedding/philosophy.webp',
};

export default Philosophy;
