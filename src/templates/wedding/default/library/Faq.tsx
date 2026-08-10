'use client';

import { useState } from 'react';
import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../wedding.module.css';
import { PlusIcon } from '../sections/icons';
import type { ValuesOf } from '@/domain/entities/template.entity';
import { faqSchema } from './Faq.meta';

type FaqContent = ValuesOf<typeof faqSchema>;

const Faq: SectionComponent = function Faq({ section }: TemplateSectionProps) {
  const content = section.fields as FaqContent;
  const eyebrow = content.eyebrow || '';
  const title = content.title || '';

  // Four, not six: the schema declares q1–q4 and no preset carries q5/q6, so
  // the last two iterations only ever produced rows the filter dropped.
  const items = ([1, 2, 3, 4] as const)
    .map((n) => ({
      q: content[`q${n}`] || '',
      a: content[`a${n}`] || '',
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
