import React from 'react';
import { TemplateSectionProps, SectionComponent } from '../../../types';
import {
  getFieldValue,
  ArrayTemplateField,
} from '@/domain/entities/template.entity';

/**
 * Shop product grid. Each item is a photo, category tag, name and price.
 * `items` falls back to an empty array for older Sites (lazy migration).
 */
const ProductGrid: SectionComponent = function ProductGrid(props: TemplateSectionProps) {
  const { section } = props;
  const eyebrow = getFieldValue(section.data, 'eyebrow');
  const heading = getFieldValue(section.data, 'heading');
  const items = (section.data.items as ArrayTemplateField | undefined)?.items ?? [];

  return (
    <section className="bg-[var(--color-surface)]">
      <div className="mx-auto max-w-7xl px-6 py-24">
        {(eyebrow || heading) && (
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
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
          </div>
        )}

        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => {
            const name = getFieldValue(item.name);
            const category = getFieldValue(item.category);
            const price = getFieldValue(item.price);
            const image = getFieldValue(item.image);
            return (
              <article key={name || idx} className="group">
                <div className="overflow-hidden rounded-2xl bg-[var(--color-surface-soft)]">
                  {image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt={name}
                      className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  )}
                </div>
                {category && (
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                    {category}
                  </p>
                )}
                <div className="mt-1 flex items-baseline justify-between gap-3">
                  <h3 className="text-base font-semibold text-[var(--color-ink)]">
                    {name}
                  </h3>
                  {price && (
                    <span className="shrink-0 text-sm font-semibold text-[var(--color-primary)]">
                      {price}
                    </span>
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

ProductGrid.meta = {
  componentKey: 'productGrid',
  category: 'product',
  label: '제품 그리드',
  dataSchema: {
    eyebrow: { type: 'text', label: '상단 라벨' },
    heading: { type: 'text', label: '제목' },
    items: {
      type: 'array',
      label: '제품 항목',
      minItems: 1,
      itemSchema: {
        name: { type: 'text', label: '제품명', required: true },
        category: { type: 'text', label: '분류' },
        price: { type: 'text', label: '가격' },
        image: { type: 'image', label: '이미지', required: true },
      },
    },
  },
};

export default ProductGrid;
