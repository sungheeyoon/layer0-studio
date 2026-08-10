import React from 'react';
import { TemplateBlockProps, BlockComponent } from '../../../types';
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

/**
 * Image-first gallery grid — facility / equipment / activity photos with an
 * optional category tag and caption. Minimal chrome, generous whitespace.
 * `items` falls back to an empty array for older Sites.
 */
const gallerySchema = {
  eyebrow: { type: 'text', label: '상단 라벨' },
  heading: { type: 'text', label: '제목' },
  items: {
    type: 'array',
    label: '사진 항목',
    minItems: 1,
    itemSchema: {
      image: { type: 'image', label: '사진', required: true },
      category: { type: 'text', label: '분류' },
      caption: { type: 'text', label: '설명' },
    },
  },
} as const satisfies FieldsSchema;

type GalleryContent = ValuesOf<typeof gallerySchema>;

const Gallery: BlockComponent = function Gallery(props: TemplateBlockProps) {
  const { block } = props;
  const content = block.fields as GalleryContent;
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
              <h2 className="text-3xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">
                {heading}
              </h2>
            )}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const image = item.fields.image?.url;
            const caption = item.fields.caption;
            const category = item.fields.category;
            return (
              <figure key={item.id} className="group flex flex-col">
                <div className="overflow-hidden rounded-2xl bg-[var(--color-surface-soft)]">
                  {image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt={caption}
                      className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  )}
                </div>
                {(category || caption) && (
                  <figcaption className="mt-4">
                    {category && (
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-secondary)]">
                        {category}
                      </span>
                    )}
                    {caption && (
                      <p className="mt-1 text-sm font-medium text-[var(--color-ink)]">{caption}</p>
                    )}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
};

Gallery.meta = {
  componentKey: 'gallery',
  category: 'gallery',
  label: '갤러리 (이미지 그리드)',
  fieldsSchema: gallerySchema,
};

export default Gallery;
