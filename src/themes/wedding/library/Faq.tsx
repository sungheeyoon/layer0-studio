'use client';

import { useState } from 'react';
import { TemplateSectionProps, SectionComponent } from '../../types';
import styles from '../wedding.module.css';
import { PlusIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Faq: SectionComponent = function Faq({ section }: TemplateSectionProps) {
  const { data } = section;
  const eyebrow = getFieldValue(data, 'eyebrow') || '';
  const title = getFieldValue(data, 'title') || '';

  const items = [1, 2, 3, 4, 5, 6]
    .map((n) => ({
      q: getFieldValue(data, `q${n}`) || '',
      a: getFieldValue(data, `a${n}`) || '',
    }))
    .filter((it) => it.q);

  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className={`${styles.section} ${styles.bgDark800}`}>
      <div className={styles.sectionInnerProse}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          {eyebrow && <div className={styles.lineOrnament} style={{ marginBottom: '2rem', justifyContent: 'center' }}>{eyebrow}</div>}
          <h2 className={styles.sectionTitle}>{title}</h2>
        </div>

        <div>
          {items.map((it, i) => {
            const isOpen = openIdx === i;
            return (
              <div key={i} className={styles.faqItem}>
                <button
                  type="button"
                  className={styles.faqTrigger}
                  aria-expanded={isOpen}
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                >
                  <span style={{ wordBreak: 'keep-all' }}>{it.q}</span>
                  <span className={`${styles.faqIcon} ${isOpen ? styles.faqIconRotated : ''}`}>
                    <PlusIcon size={20} />
                  </span>
                </button>
                <div className={`${styles.faqAnswer} ${isOpen ? styles.faqAnswerOpen : ''}`}>
                  <p>{it.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Faq;
