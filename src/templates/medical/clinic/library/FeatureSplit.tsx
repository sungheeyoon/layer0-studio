import React from 'react';
import { TemplateBlockProps, BlockComponent } from '../../../types';
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

/**
 * Image + text split. `imageSide` ('left' | 'right') flips the layout so it
 * can be reused as 병원 소개, 원장 인사말, 시설 소개, 서비스 상세, etc.
 */
const featureSplitSchema = {
  eyebrow: { type: 'text', label: '상단 라벨' },
  heading: { type: 'text', label: '제목', required: true },
  body: { type: 'textarea', label: '본문' },
  note: { type: 'text', label: '강조 문구' },
  image: { type: 'image', label: '이미지' },
  imageSide: { type: 'select', label: '이미지 위치', options: ['left', 'right'] },
} as const satisfies FieldsSchema;

type FeatureSplitContent = ValuesOf<typeof featureSplitSchema>;

const FeatureSplit: BlockComponent = function FeatureSplit(props: TemplateBlockProps) {
  const { block } = props;
  const content = block.fields as FeatureSplitContent;
  const eyebrow = content.eyebrow;
  const heading = content.heading || '제목';
  const body = content.body;
  const note = content.note;
  const image = content.image?.url;
  const imageSide = content.imageSide || 'right';

  return (
    <section className="bg-[var(--color-surface)]">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:gap-16">
        <div className={imageSide === 'left' ? 'lg:order-2' : ''}>
          {eyebrow && (
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-secondary)]">
              {eyebrow}
            </p>
          )}
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">
            {heading}
          </h2>
          {body && (
            <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-[var(--color-muted)]">
              {body}
            </p>
          )}
          {note && (
            <p className="mt-6 border-l-2 border-[var(--color-primary)] pl-4 text-sm font-medium text-[var(--color-primary)]">
              {note}
            </p>
          )}
        </div>

        <div className={imageSide === 'left' ? 'lg:order-1' : ''}>
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              className="aspect-[4/5] w-full rounded-2xl object-cover shadow-sm"
            />
          )}
        </div>
      </div>
    </section>
  );
};

FeatureSplit.meta = {
  componentKey: 'featureSplit',
  category: 'content',
  label: '이미지 + 텍스트 분할',
  fieldsSchema: featureSplitSchema,
};

export default FeatureSplit;
