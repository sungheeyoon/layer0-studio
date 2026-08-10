import React from 'react';
import { TemplateBlockProps, BlockComponent } from '../../../types';
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

/**
 * 연혁 — a vertical timeline of year + milestone rows along a left rule.
 * Text-centred and calm. `items` falls back to an empty array.
 */
const timelineSchema = {
  eyebrow: { type: 'text', label: '상단 라벨' },
  heading: { type: 'text', label: '제목' },
  items: {
    type: 'array',
    label: '연혁 항목',
    minItems: 1,
    itemSchema: {
      year: { type: 'text', label: '연도', required: true },
      title: { type: 'text', label: '제목', required: true },
      body: { type: 'textarea', label: '설명' },
    },
  },
} as const satisfies FieldsSchema;

type TimelineContent = ValuesOf<typeof timelineSchema>;

const Timeline: BlockComponent = function Timeline(props: TemplateBlockProps) {
  const { block } = props;
  const content = block.fields as TimelineContent;
  const eyebrow = content.eyebrow;
  const heading = content.heading;
  const items = content.items ?? [];

  return (
    <section className="bg-[var(--color-surface)]">
      <div className="mx-auto max-w-4xl px-6 py-24">
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

        <ol className="relative border-l border-[var(--color-line)]">
          {items.map((item) => {
            const year = item.fields.year;
            const title = item.fields.title;
            const body = item.fields.body;
            return (
              <li key={item.id} className="ml-6 pb-10 last:pb-0">
                <span className="absolute -left-[7px] mt-1.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--color-surface)] bg-[var(--color-primary)]" />
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
                  <span className="w-16 shrink-0 text-sm font-bold text-[var(--color-primary)]">
                    {year}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-[var(--color-ink)]">{title}</h3>
                    {body && (
                      <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">{body}</p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

Timeline.meta = {
  componentKey: 'timeline',
  category: 'content',
  label: '연혁 (타임라인)',
  fieldsSchema: timelineSchema,
};

export default Timeline;
