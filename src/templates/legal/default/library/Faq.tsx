'use client';

import { useState } from 'react';
import { TemplateSectionProps, SectionComponent } from '../../../types';
import styles from '../legal.module.css';
import { PlusIcon } from '../sections/icons';
import { getFieldValue } from '@/domain/entities/template.entity';

const Faq: SectionComponent = function Faq({ section }: TemplateSectionProps) {
  const { data } = section;
  const title = getFieldValue(data, 'title') || '';

  const items = [1, 2, 3, 4, 5].map(n => ({
    q: getFieldValue(data, `q${n}`) || '',
    a: getFieldValue(data, `a${n}`) || '',
  })).filter(it => it.q);

  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 md:py-32 px-4 bg-stone-50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <div className={`${styles.sectionSep} mx-auto mb-4`}></div>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--l-navy)] tracking-tight">
            {title}
          </h2>
        </div>

        <div className="space-y-3">
          {items.map((it, i) => {
            const isOpen = openIdx === i;
            return (
              <div key={i} className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                <button 
                  className="w-full flex items-center justify-between px-6 py-5 text-left bg-transparent border-0 cursor-pointer"
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                >
                  <span className="font-semibold text-[var(--l-navy)] text-sm md:text-base">{it.q}</span>
                  <PlusIcon 
                    size={20} 
                    className={`text-stone-400 flex-shrink-0 ml-4 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} 
                  />
                </button>
                <div className={`px-6 overflow-hidden transition-all duration-400 ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}>
                  <p className="text-sm text-stone-500 leading-relaxed m-0">
                    {it.a}
                  </p>
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
