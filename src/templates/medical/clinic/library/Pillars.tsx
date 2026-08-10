import React from 'react';
import { TemplateSectionProps, SectionComponent } from '../../../types';
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

/**
 * A row of key advantages / value props. Each item is a short title and body,
 * marked with a check glyph — used for 핵심 장점 (home) and 미션·비전 (about).
 * `items` may be missing on older Sites, so it falls back to an empty array.
 */
const pillarsSchema = {
  eyebrow: { type: 'text', label: '상단 라벨' },
  heading: { type: 'text', label: '제목' },
  items: {
    type: 'array',
    label: '장점 항목',
    minItems: 1,
    itemSchema: {
      title: { type: 'text', label: '제목', required: true },
      body: { type: 'textarea', label: '설명' },
    },
  },
} as const satisfies FieldsSchema;

type PillarsContent = ValuesOf<typeof pillarsSchema>;

const Pillars: SectionComponent = function Pillars(props: TemplateSectionProps) {
  const { section } = props;
  const content = section.fields as PillarsContent;
  const eyebrow = content.eyebrow;
  const heading = content.heading;
  const items = content.items ?? [];

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
              <h2 className="text-3xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">
                {heading}
              </h2>
            )}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-soft)] p-8"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-on-dark)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <h3 className="mt-5 text-lg font-semibold text-[var(--color-ink)]">
                {item.fields.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                {item.fields.body}
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
  label: '핵심 장점 (카드)',
  fieldsSchema: pillarsSchema,
};

export default Pillars;
