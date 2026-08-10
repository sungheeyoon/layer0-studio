import React from 'react';
import { TemplateBlockProps, BlockComponent } from '../../../types';
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

/**
 * 오시는 길 · 진료시간 · 연락처 — a map panel (an image if provided, else a
 * styled placeholder with a pin) beside the address, directions, opening
 * hours and a label/value contact list. `items` falls back to an empty array.
 */
const contactSchema = {
  heading: { type: 'text', label: '제목', required: true },
  intro: { type: 'textarea', label: '안내 문구' },
  address: { type: 'text', label: '주소' },
  directions: { type: 'textarea', label: '교통/주차 안내' },
  hours: { type: 'textarea', label: '진료시간' },
  mapImage: { type: 'image', label: '지도 이미지' },
  items: {
    type: 'array',
    label: '연락처 항목',
    minItems: 1,
    itemSchema: {
      label: { type: 'text', label: '항목명', required: true },
      value: { type: 'text', label: '내용', required: true },
    },
  },
} as const satisfies FieldsSchema;

type ContactContent = ValuesOf<typeof contactSchema>;

const Contact: BlockComponent = function Contact(props: TemplateBlockProps) {
  const { block } = props;
  const content = block.fields as ContactContent;
  const heading = content.heading || '오시는 길';
  const intro = content.intro;
  const address = content.address;
  const directions = content.directions;
  const hours = content.hours;
  const mapImage = content.mapImage?.url;
  const items = content.items ?? [];

  return (
    <section className="bg-[var(--color-surface)]">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">
            {heading}
          </h2>
          {intro && (
            <p className="mt-5 text-base leading-relaxed text-[var(--color-muted)]">{intro}</p>
          )}
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Map */}
          <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-soft)]">
            {mapImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mapImage} alt="위치 지도" className="aspect-[4/3] w-full object-cover" />
            ) : (
              <div className="relative flex aspect-[4/3] w-full items-center justify-center">
                <div
                  className="absolute inset-0 opacity-60"
                  style={{
                    backgroundImage:
                      'linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                  }}
                  aria-hidden="true"
                />
                <div className="relative flex flex-col items-center text-center">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-on-dark)]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                  </span>
                  {address && (
                    <p className="mt-3 max-w-xs text-sm font-medium text-[var(--color-ink)]">
                      {address}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-8">
            {address && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)]">
                  주소
                </p>
                <p className="mt-2 text-base font-medium text-[var(--color-ink)]">{address}</p>
                {directions && (
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--color-muted)]">
                    {directions}
                  </p>
                )}
              </div>
            )}

            {hours && (
              <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-soft)] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)]">
                  진료시간
                </p>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--color-ink)]">
                  {hours}
                </p>
              </div>
            )}

            {items.length > 0 && (
              <dl className="divide-y divide-[var(--color-line)] border-t border-[var(--color-line)]">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-6"
                  >
                    <dt className="w-24 shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                      {item.fields.label}
                    </dt>
                    <dd className="text-base font-medium text-[var(--color-ink)]">
                      {item.fields.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

Contact.meta = {
  componentKey: 'contact',
  category: 'contact',
  label: '오시는 길 · 진료시간',
  fieldsSchema: contactSchema,
};

export default Contact;
