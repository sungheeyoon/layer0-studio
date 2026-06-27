import React from 'react';
import { TemplateSectionProps, SectionComponent } from '../../../types';
import { getFieldValue } from '@/domain/entities/template.entity';

/**
 * Full-width call-to-action band over a photograph — an eyebrow, heading,
 * body and a single button label.
 */
const CtaBanner: SectionComponent = function CtaBanner(props: TemplateSectionProps) {
  const { section } = props;
  const eyebrow = getFieldValue(section.data, 'eyebrow');
  const heading = getFieldValue(section.data, 'heading') || '함께 걷는 길';
  const body = getFieldValue(section.data, 'body');
  const ctaLabel = getFieldValue(section.data, 'ctaLabel');
  const image = getFieldValue(section.data, 'image');

  return (
    <section className="relative isolate overflow-hidden bg-[var(--color-primary)]">
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-25"
        />
      )}
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        {eyebrow && (
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-on-dark)]/80">
            {eyebrow}
          </p>
        )}
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--color-on-dark)] sm:text-4xl">
          {heading}
        </h2>
        {body && (
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[var(--color-on-dark)]/85">
            {body}
          </p>
        )}
        {ctaLabel && (
          <span className="mt-9 inline-flex rounded-full bg-[var(--color-secondary)] px-8 py-3 text-sm font-semibold text-[var(--color-on-dark)]">
            {ctaLabel}
          </span>
        )}
      </div>
    </section>
  );
};

CtaBanner.meta = {
  componentKey: 'ctaBanner',
  category: 'cta',
  label: 'CTA 배너',
  dataSchema: {
    eyebrow: { type: 'text', label: '상단 라벨' },
    heading: { type: 'text', label: '제목', required: true },
    body: { type: 'textarea', label: '설명' },
    ctaLabel: { type: 'text', label: '버튼 텍스트' },
    image: { type: 'image', label: '배경 이미지' },
  },
};

export default CtaBanner;
