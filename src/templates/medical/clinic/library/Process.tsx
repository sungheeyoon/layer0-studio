import React from 'react';
import { TemplateSectionProps, SectionComponent } from '../../../types';
import { getFieldValue, ArrayField } from '@/domain/entities/template.entity';

/**
 * 치료 과정 — numbered steps describing how a visit flows (접수 → 진료 →
 * 검사 → 치료 → 관리). Each item is a title and a short body. `items`
 * falls back to an empty array.
 */
const Process: SectionComponent = function Process(props: TemplateSectionProps) {
  const { section } = props;
  const eyebrow = getFieldValue(section.fields, 'eyebrow');
  const heading = getFieldValue(section.fields, 'heading');
  const items = (section.fields.items as ArrayField | undefined)?.items ?? [];

  return (
    <section className="bg-[var(--color-surface-soft)]">
      <div className="mx-auto max-w-7xl px-6 py-24">
        {(eyebrow || heading) && (
          <div className="mb-14 max-w-2xl">
            {eyebrow && (
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-secondary)]">
                {eyebrow}
              </p>
            )}
            {heading && (
              <h2 className="text-3xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">
                {heading}
              </h2>
            )}
          </div>
        )}

        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, idx) => {
            const title = getFieldValue(item.title);
            const body = getFieldValue(item.body);
            return (
              <li
                key={title || idx}
                className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-7"
              >
                <span className="text-sm font-bold text-[var(--color-secondary)]">
                  STEP {String(idx + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-[var(--color-ink)]">{title}</h3>
                {body && (
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{body}</p>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

Process.meta = {
  componentKey: 'process',
  category: 'content',
  label: '치료 과정 (단계)',
  fieldsSchema: {
    eyebrow: { type: 'text', label: '상단 라벨' },
    heading: { type: 'text', label: '제목' },
    items: {
      type: 'array',
      label: '단계 항목',
      minItems: 1,
      itemSchema: {
        title: { type: 'text', label: '제목', required: true },
        body: { type: 'textarea', label: '설명' },
      },
    },
  },
};

export default Process;
