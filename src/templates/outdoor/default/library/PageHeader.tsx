import React from 'react';
import { TemplateSectionProps, SectionComponent } from '../../../types';
import { getFieldValue } from '@/domain/entities/template.entity';

/**
 * Compact page intro used at the top of every non-home page — an eyebrow,
 * a title and a lead paragraph over an optional banner image.
 */
const PageHeader: SectionComponent = function PageHeader(props: TemplateSectionProps) {
  const { section } = props;
  const eyebrow = getFieldValue(section.fields, 'eyebrow');
  const title = getFieldValue(section.fields, 'title') || '페이지';
  const description = getFieldValue(section.fields, 'description');
  const image = getFieldValue(section.fields, 'image');

  return (
    <section className="relative isolate overflow-hidden border-b border-[var(--color-line)] bg-[var(--color-surface-dark)]">
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface-dark)] to-[var(--color-surface-dark)]/40" />

      <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-28">
        {eyebrow && (
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-on-dark)]/75">
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[var(--color-on-dark)] sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--color-on-dark)]/85">
            {description}
          </p>
        )}
      </div>
    </section>
  );
};

PageHeader.meta = {
  componentKey: 'pageHeader',
  category: 'hero',
  label: '페이지 헤더',
  fieldsSchema: {
    eyebrow: { type: 'text', label: '상단 라벨' },
    title: { type: 'text', label: '제목', required: true },
    description: { type: 'textarea', label: '설명' },
    image: { type: 'image', label: '배경 이미지' },
  },
};

export default PageHeader;
