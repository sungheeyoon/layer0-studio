import React from 'react';
import { TemplateSectionProps, SectionComponent } from '../../../types';
import {
  getFieldValue,
  ArrayField,
} from '@/domain/entities/template.entity';

/**
 * Activities listing — guided programs / routes. Each item carries a photo,
 * a difficulty level, a duration meta line, a title and a description.
 */
const ActivityGrid: SectionComponent = function ActivityGrid(props: TemplateSectionProps) {
  const { section } = props;
  const eyebrow = getFieldValue(section.data, 'eyebrow');
  const heading = getFieldValue(section.data, 'heading');
  const items = (section.data.items as ArrayField | undefined)?.items ?? [];

  return (
    <section className="bg-[var(--color-surface)]">
      <div className="mx-auto max-w-7xl px-6 py-24">
        {(eyebrow || heading) && (
          <div className="mb-12 max-w-2xl">
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

        <div className="grid gap-8 sm:grid-cols-2">
          {items.map((item, idx) => {
            const title = getFieldValue(item.title);
            const level = getFieldValue(item.level);
            const meta = getFieldValue(item.meta);
            const description = getFieldValue(item.description);
            const image = getFieldValue(item.image);
            return (
              <article
                key={title || idx}
                className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]"
              >
                {image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt={title}
                    className="aspect-[16/10] w-full object-cover"
                  />
                )}
                <div className="p-7">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em]">
                    {level && (
                      <span className="rounded-full bg-[var(--color-primary)] px-3 py-1 text-[var(--color-on-dark)]">
                        {level}
                      </span>
                    )}
                    {meta && (
                      <span className="text-[var(--color-muted)]">{meta}</span>
                    )}
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-[var(--color-ink)]">
                    {title}
                  </h3>
                  {description && (
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                      {description}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

ActivityGrid.meta = {
  componentKey: 'activityGrid',
  category: 'feature',
  label: '액티비티 그리드',
  dataSchema: {
    eyebrow: { type: 'text', label: '상단 라벨' },
    heading: { type: 'text', label: '제목' },
    items: {
      type: 'array',
      label: '액티비티 항목',
      minItems: 1,
      itemSchema: {
        title: { type: 'text', label: '제목', required: true },
        level: { type: 'text', label: '난이도' },
        meta: { type: 'text', label: '소요/거리' },
        description: { type: 'textarea', label: '설명' },
        image: { type: 'image', label: '이미지', required: true },
      },
    },
  },
};

export default ActivityGrid;
