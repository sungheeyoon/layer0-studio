import React from 'react';
import { TemplateSectionProps, SectionComponent } from '../../../types';
import { getFieldValue } from '@/domain/entities/template.entity';

/**
 * Full-bleed home hero — a trail photograph behind an eyebrow, headline,
 * sub-copy and two calls to action. Dark scrim keeps text legible over any
 * image.
 */
const Hero: SectionComponent = function Hero(props: TemplateSectionProps) {
  const { section } = props;
  const eyebrow = getFieldValue(section.data, 'eyebrow');
  const title = getFieldValue(section.data, 'title') || '능선을 잇다';
  const subtitle = getFieldValue(section.data, 'subtitle');
  const primaryCta = getFieldValue(section.data, 'primaryCtaLabel');
  const secondaryCta = getFieldValue(section.data, 'secondaryCtaLabel');
  const image = getFieldValue(section.data, 'image');

  return (
    <section className="relative isolate overflow-hidden bg-[var(--color-surface-dark)]">
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface-dark)] via-[var(--color-surface-dark)]/50 to-transparent" />

      <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-end px-6 pb-20 pt-32">
        {eyebrow && (
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-on-dark)]/80">
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight text-[var(--color-on-dark)] sm:text-6xl md:text-7xl">
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
              <span className="rounded-full bg-[var(--color-secondary)] px-7 py-3 text-sm font-semibold text-[var(--color-on-dark)]">
                {primaryCta}
              </span>
            )}
            {secondaryCta && (
              <span className="rounded-full border border-[var(--color-on-dark)]/40 px-7 py-3 text-sm font-semibold text-[var(--color-on-dark)]">
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
  dataSchema: {
    eyebrow: { type: 'text', label: '상단 라벨' },
    title: { type: 'text', label: '대제목', required: true },
    subtitle: { type: 'textarea', label: '설명' },
    primaryCtaLabel: { type: 'text', label: '주 버튼 텍스트' },
    secondaryCtaLabel: { type: 'text', label: '보조 버튼 텍스트' },
    image: { type: 'image', label: '배경 이미지', required: true },
  },
};

export default Hero;
