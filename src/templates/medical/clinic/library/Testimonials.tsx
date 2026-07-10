import React from 'react';
import { TemplateSectionProps, SectionComponent } from '../../../types';
import { getFieldValue, ArrayField } from '@/domain/entities/template.entity';

/**
 * 환자 후기 — a heading over a set of quote cards, each with an author and a
 * short meta line (visit reason / date). `items` falls back to an empty array.
 */
const Testimonials: SectionComponent = function Testimonials(props: TemplateSectionProps) {
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

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((item, idx) => {
            const quote = getFieldValue(item.quote);
            const author = getFieldValue(item.author);
            const meta = getFieldValue(item.meta);
            return (
              <figure
                key={author || idx}
                className="flex flex-col rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8"
              >
                <span className="text-3xl font-bold leading-none text-[var(--color-primary)]" aria-hidden="true">
                  &ldquo;
                </span>
                <blockquote className="mt-3 flex-1 text-base leading-relaxed text-[var(--color-ink)]">
                  {quote}
                </blockquote>
                <figcaption className="mt-6 border-t border-[var(--color-line)] pt-4">
                  <p className="text-sm font-semibold text-[var(--color-ink)]">{author}</p>
                  {meta && <p className="mt-0.5 text-xs text-[var(--color-muted)]">{meta}</p>}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
};

Testimonials.meta = {
  componentKey: 'testimonials',
  category: 'social-proof',
  label: '환자 후기',
  fieldsSchema: {
    eyebrow: { type: 'text', label: '상단 라벨' },
    heading: { type: 'text', label: '제목' },
    items: {
      type: 'array',
      label: '후기 항목',
      minItems: 1,
      itemSchema: {
        quote: { type: 'textarea', label: '후기 내용', required: true },
        author: { type: 'text', label: '작성자', required: true },
        meta: { type: 'text', label: '방문 정보' },
      },
    },
  },
};

export default Testimonials;
