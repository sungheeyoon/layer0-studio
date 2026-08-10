import React from 'react';
import { TemplateBlockProps, BlockComponent } from '../../../types';
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

/**
 * Full-width call-to-action band over a photograph — an eyebrow, heading,
 * body and a single button label. Used for the 예약 CTA sections.
 */
const ctaBannerSchema = {
  eyebrow: { type: 'text', label: '상단 라벨' },
  heading: { type: 'text', label: '제목', required: true },
  body: { type: 'textarea', label: '설명' },
  ctaLabel: { type: 'text', label: '버튼 텍스트' },
  phone: { type: 'text', label: '전화번호' },
  image: { type: 'image', label: '배경 이미지' },
} as const satisfies FieldsSchema;

type CtaBannerContent = ValuesOf<typeof ctaBannerSchema>;

const CtaBanner: BlockComponent = function CtaBanner(props: TemplateBlockProps) {
  const { block } = props;
  const content = block.fields as CtaBannerContent;
  const eyebrow = content.eyebrow;
  const heading = content.heading || '진료 예약';
  const body = content.body;
  const ctaLabel = content.ctaLabel;
  const phone = content.phone;
  const image = content.image?.url;

  return (
    <section className="relative isolate overflow-hidden bg-[var(--color-primary)]">
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20"
        />
      )}
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        {eyebrow && (
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-on-dark)]/80">
            {eyebrow}
          </p>
        )}
        <h2 className="text-3xl font-bold tracking-tight text-[var(--color-on-dark)] sm:text-4xl">
          {heading}
        </h2>
        {body && (
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[var(--color-on-dark)]/90">
            {body}
          </p>
        )}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          {ctaLabel && (
            <span className="inline-flex rounded-full bg-[var(--color-on-dark)] px-8 py-3.5 text-sm font-semibold text-[var(--color-primary)]">
              {ctaLabel}
            </span>
          )}
          {phone && (
            <span className="inline-flex rounded-full border border-[var(--color-on-dark)]/50 px-8 py-3.5 text-sm font-semibold text-[var(--color-on-dark)]">
              {phone}
            </span>
          )}
        </div>
      </div>
    </section>
  );
};

CtaBanner.meta = {
  componentKey: 'ctaBanner',
  category: 'cta',
  label: '예약 CTA 배너',
  fieldsSchema: ctaBannerSchema,
};

export default CtaBanner;
