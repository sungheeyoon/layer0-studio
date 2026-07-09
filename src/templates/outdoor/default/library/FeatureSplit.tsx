import React from 'react';
import { TemplateSectionProps, SectionComponent } from '../../../types';
import { getFieldValue } from '@/domain/entities/template.entity';

/**
 * Editorial image + text split. `imageSide` ('left' | 'right') flips the
 * layout so it can be reused as a story teaser, a brand block, etc.
 */
const FeatureSplit: SectionComponent = function FeatureSplit(props: TemplateSectionProps) {
  const { section } = props;
  const eyebrow = getFieldValue(section.fields, 'eyebrow');
  const heading = getFieldValue(section.fields, 'heading') || '제목';
  const body = getFieldValue(section.fields, 'body');
  const note = getFieldValue(section.fields, 'note');
  const image = getFieldValue(section.fields, 'image');
  const imageSide = getFieldValue(section.fields, 'imageSide') || 'right';

  return (
    <section className="bg-[var(--color-surface)]">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:gap-16">
        <div className={imageSide === 'left' ? 'lg:order-2' : ''}>
          {eyebrow && (
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-secondary)]">
              {eyebrow}
            </p>
          )}
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
            {heading}
          </h2>
          {body && (
            <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-[var(--color-muted)]">
              {body}
            </p>
          )}
          {note && (
            <p className="mt-6 border-l-2 border-[var(--color-secondary)] pl-4 text-sm font-medium text-[var(--color-primary)]">
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
              className="aspect-[4/5] w-full rounded-2xl object-cover"
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
  fieldsSchema: {
    eyebrow: { type: 'text', label: '상단 라벨' },
    heading: { type: 'text', label: '제목', required: true },
    body: { type: 'textarea', label: '본문' },
    note: { type: 'text', label: '강조 문구' },
    image: { type: 'image', label: '이미지' },
    imageSide: { type: 'select', label: '이미지 위치', options: ['left', 'right'] },
  },
};

export default FeatureSplit;
