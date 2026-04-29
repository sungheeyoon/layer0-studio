'use client';

import { useState } from 'react';
import { ThemeSectionProps } from '../../types';
import styles from '../wedding.module.css';
import { PlusIcon } from './icons';

export default function FaqSection({ section }: ThemeSectionProps) {
  const { data } = section;
  const eyebrow = data['eyebrow']?.value || '';
  const title = data['title']?.value || '';

  const items = [1, 2, 3, 4, 5, 6]
    .map((n) => ({
      q: data[`q${n}`]?.value || '',
      a: data[`a${n}`]?.value || '',
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
}
