import React from 'react';
import { TemplateSectionProps, SectionComponent } from '../../../types';
import {
  getFieldValue,
  ArrayField,
} from '@/domain/entities/template.entity';

/**
 * A row of brand pillars / value props. Each item is a short kicker, title and
 * body — used on the home and about pages. `items` may be missing on older
 * Sites, so it falls back to an empty array (lazy migration, §10.5).
 */
const Pillars: SectionComponent = function Pillars(props: TemplateSectionProps) {
  const { section } = props;
  const eyebrow = getFieldValue(section.data, 'eyebrow');
  const heading = getFieldValue(section.data, 'heading');
  const items = (section.data.items as ArrayField | undefined)?.items ?? [];

  return (
    <section className="bg-[var(--color-surface)]">
      <div className="mx-auto max-w-7xl px-6 py-24">
        {(eyebrow || heading) && (
          <div className="mb-14 max-w-2xl">
            {eyebrow && (
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-secondary)]">
                {eyebrow}
              </p>
            )}
            {heading && (
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
                {heading}
              </h2>
            )}
          </div>
        )}

        <div className="grid gap-px overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-line)] sm:grid-cols-3">
          {items.map((item, idx) => (
            <div
              key={getFieldValue(item.title) || idx}
              className="bg-[var(--color-surface)] p-8"
            >
              <span className="text-sm font-semibold text-[var(--color-secondary)]">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-4 text-xl font-semibold text-[var(--color-ink)]">
                {getFieldValue(item.title)}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                {getFieldValue(item.body)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

Pillars.meta = {
  componentKey: 'pillars',
  category: 'feature',
  label: '브랜드 가치 (3열)',
  dataSchema: {
    eyebrow: { type: 'text', label: '상단 라벨' },
    heading: { type: 'text', label: '제목' },
    items: {
      type: 'array',
      label: '가치 항목',
      minItems: 1,
      itemSchema: {
        title: { type: 'text', label: '제목', required: true },
        body: { type: 'textarea', label: '설명' },
      },
    },
  },
};

export default Pillars;
