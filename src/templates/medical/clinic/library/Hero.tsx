import React from 'react';
import { TemplateSectionProps, SectionComponent } from '../../../types';
import { getFieldValue } from '@/domain/entities/template.entity';

/**
 * Full-bleed home hero — a large clinic photograph behind an eyebrow,
 * headline, sub-copy and two calls to action. A navy scrim keeps the white
 * text legible over any image.
 */
const Hero: SectionComponent = function Hero(props: TemplateSectionProps) {
  const { section } = props;
  const eyebrow = getFieldValue(section.fields, 'eyebrow');
  const title = getFieldValue(section.fields, 'title') || '건강한 하루를 여는 곳';
  const subtitle = getFieldValue(section.fields, 'subtitle');
  const primaryCta = getFieldValue(section.fields, 'primaryCtaLabel');
  const secondaryCta = getFieldValue(section.fields, 'secondaryCtaLabel');
  const image = getFieldValue(section.fields, 'image');

  return (
    <section className="relative isolate overflow-hidden bg-[var(--color-surface-dark)]">
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-surface-dark)] via-[var(--color-surface-dark)]/70 to-transparent" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-end px-6 pb-24 pt-32">
        {eyebrow && (
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-on-dark)]/85">
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-3xl text-4xl font-bold leading-[1.12] tracking-tight text-[var(--color-on-dark)] sm:text-5xl md:text-6xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--color-on-dark)]/85">
            {subtitle}
          </p>
        )}
        {(primaryCta || secondaryCta) && (
          <div className="mt-10 flex flex-wrap items-center gap-4">
            {primaryCta && (
              <span className="rounded-full bg-[var(--color-primary)] px-8 py-3.5 text-sm font-semibold text-[var(--color-on-dark)]">
                {primaryCta}
              </span>
            )}
            {secondaryCta && (
              <span className="rounded-full border border-[var(--color-on-dark)]/40 px-8 py-3.5 text-sm font-semibold text-[var(--color-on-dark)]">
                {secondaryCta}
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

Hero.meta = {
  componentKey: 'hero',
  category: 'hero',
  label: '히어로 (홈)',
  fieldsSchema: {
    eyebrow: { type: 'text', label: '상단 라벨' },
    title: { type: 'text', label: '대제목', required: true },
    subtitle: { type: 'textarea', label: '설명' },
    primaryCtaLabel: { type: 'text', label: '주 버튼 텍스트' },
    secondaryCtaLabel: { type: 'text', label: '보조 버튼 텍스트' },
    image: { type: 'image', label: '배경 이미지', required: true },
  },
};

export default Hero;
