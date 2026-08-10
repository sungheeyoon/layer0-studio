import React from 'react';
import { TemplateBlockProps, BlockComponent } from '../../../types';
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

/**
 * Editorial collection cards — large imagery with a season tag, title and a
 * short description overlaid. Used on home (teaser) and the collections page.
 */
const collectionGridSchema = {
  eyebrow: { type: 'text', label: '상단 라벨' },
  heading: { type: 'text', label: '제목' },
  items: {
    type: 'array',
    label: '컬렉션 항목',
    minItems: 1,
    itemSchema: {
      title: { type: 'text', label: '제목', required: true },
      season: { type: 'text', label: '시즌/태그' },
      description: { type: 'textarea', label: '설명' },
      image: { type: 'image', label: '이미지', required: true },
    },
  },
} as const satisfies FieldsSchema;

type CollectionGridContent = ValuesOf<typeof collectionGridSchema>;

const CollectionGrid: BlockComponent = function CollectionGrid(props: TemplateBlockProps) {
  const { block } = props;
  const content = block.fields as CollectionGridContent;
  const eyebrow = content.eyebrow;
  const heading = content.heading;
  const items = content.items ?? [];

  return (
    <section className="bg-[var(--color-surface-soft)]">
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

        <div className="grid gap-6 md:grid-cols-2">
          {items.map((item) => {
            const title = item.fields.title;
            const season = item.fields.season;
            const description = item.fields.description;
            const image = item.fields.image?.url;
            return (
              <article
                key={item.id}
                className="group relative isolate flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-2xl bg-[var(--color-surface-dark)] p-8"
              >
                {image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt={title}
                    className="absolute inset-0 -z-10 h-full w-full object-cover opacity-75 transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[var(--color-surface-dark)] via-[var(--color-surface-dark)]/30 to-transparent" />
                {season && (
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-on-dark)]/80">
                    {season}
                  </p>
                )}
                <h3 className="text-2xl font-semibold text-[var(--color-on-dark)]">
                  {title}
                </h3>
                {description && (
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--color-on-dark)]/85">
                    {description}
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

CollectionGrid.meta = {
  componentKey: 'collectionGrid',
  category: 'gallery',
  label: '컬렉션 카드',
  fieldsSchema: collectionGridSchema,
};

export default CollectionGrid;
