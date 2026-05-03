import { ThemeSectionProps, SectionComponent } from '../../types';
import styles from '../wedding.module.css';
import { ArrowRightIcon } from '../sections/icons';
import { renderAccentTitle } from '../sections/title-parts';

const Philosophy: SectionComponent = function Philosophy({ section }: ThemeSectionProps) {
  const { data } = section;
  const eyebrow = data['eyebrow']?.value || '';
  const title = data['title']?.value || '';
  const body = data['body']?.value || '';
  const ctaText = data['ctaText']?.value || '';
  const ctaUrl = data['ctaUrl']?.value || '#';

  return (
    <section className={`${styles.section} ${styles.bgDark800}`}>
      <div className={styles.sectionInnerProse} style={{ textAlign: 'center' }}>
        {eyebrow && <div className={styles.lineOrnament} style={{ marginBottom: '2.5rem', justifyContent: 'center' }}>{eyebrow}</div>}
        <h2 className={styles.sectionTitleDisplay} style={{ marginBottom: '2rem' }}>
          {renderAccentTitle(title, styles.titleAccent)}
        </h2>
        {body && (
          <p style={{
            color: 'rgba(245, 240, 235, 0.5)',
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
  dataSchema: {
    eyebrow: { type: 'text', label: '상단 라벨' },
    title: { type: 'textarea', label: '타이틀', required: true },
    body: { type: 'textarea', label: '본문' },
    ctaText: { type: 'text', label: 'CTA 버튼' },
    ctaUrl: { type: 'url', label: 'CTA 링크' },
  },
  previewImage: '/component-previews/wedding/philosophy.webp',
};

export default Philosophy;
