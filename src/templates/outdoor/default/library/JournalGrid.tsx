import React from 'react';
import { TemplateBlockProps, BlockComponent } from '../../../types';
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

/**
 * Journal / field-notes listing. Each item is a category, date, title,
 * excerpt and cover image. First item renders larger as a featured post.
 */
const journalGridSchema = {
  eyebrow: { type: 'text', label: '상단 라벨' },
  heading: { type: 'text', label: '제목' },
  items: {
    type: 'array',
    label: '저널 항목',
    minItems: 1,
    itemSchema: {
      title: { type: 'text', label: '제목', required: true },
      category: { type: 'text', label: '분류' },
      date: { type: 'text', label: '날짜' },
      excerpt: { type: 'textarea', label: '요약' },
      image: { type: 'image', label: '커버 이미지', required: true },
    },
  },
} as const satisfies FieldsSchema;

type JournalGridContent = ValuesOf<typeof journalGridSchema>;

const JournalGrid: BlockComponent = function JournalGrid(props: TemplateBlockProps) {
  const { block } = props;
  const content = block.fields as JournalGridContent;
  const eyebrow = content.eyebrow;
  const heading = content.heading;
  const items = content.items ?? [];

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

        <div className="grid gap-x-8 gap-y-12 md:grid-cols-3">
          {items.map((item) => {
            const title = item.fields.title;
            const category = item.fields.category;
            const date = item.fields.date;
            const excerpt = item.fields.excerpt;
            const image = item.fields.image?.url;
            return (
              <article key={item.id} className="group flex flex-col">
                <div className="overflow-hidden rounded-2xl bg-[var(--color-surface-soft)]">
                  {image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt={title}
                      className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  )}
                </div>
                <div className="mt-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                  {category && <span className="text-[var(--color-secondary)]">{category}</span>}
                  {date && <span>{date}</span>}
                </div>
                <h3 className="mt-2 text-lg font-semibold leading-snug text-[var(--color-ink)]">
                  {title}
                </h3>
                {excerpt && (
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                    {excerpt}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

JournalGrid.meta = {
  componentKey: 'journalGrid',
  category: 'content',
  label: '저널 그리드',
  fieldsSchema: journalGridSchema,
};

export default JournalGrid;
