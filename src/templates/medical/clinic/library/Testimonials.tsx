import React from 'react';
import { TemplateSectionProps, SectionComponent } from '../../../types';
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

/**
 * 환자 후기 — a heading over a set of quote cards, each with an author and a
 * short meta line (visit reason / date). `items` falls back to an empty array.
 */
const testimonialsSchema = {
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
} as const satisfies FieldsSchema;

type TestimonialsContent = ValuesOf<typeof testimonialsSchema>;

const Testimonials: SectionComponent = function Testimonials(props: TemplateSectionProps) {
  const { section } = props;
  const content = section.fields as TestimonialsContent;
  const eyebrow = content.eyebrow;
  const heading = content.heading;
  const items = content.items ?? [];

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
          {items.map((item) => {
            const quote = item.fields.quote;
            const author = item.fields.author;
            const meta = item.fields.meta;
            return (
              <figure
                key={item.id}
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
  fieldsSchema: testimonialsSchema,
};

export default Testimonials;
