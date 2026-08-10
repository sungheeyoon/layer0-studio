import React from 'react';
import { TemplateSectionProps, SectionComponent } from '../../../types';
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

/**
 * Contact block — a lead paragraph beside a list of label/value rows
 * (전화 / 이메일 / 주소 …) and an optional store-hours note.
 */
const contactSchema = {
  heading: { type: 'text', label: '제목', required: true },
  intro: { type: 'textarea', label: '안내 문구' },
  hours: { type: 'textarea', label: '운영 시간' },
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

const Contact: SectionComponent = function Contact(props: TemplateSectionProps) {
  const { section } = props;
  const content = section.fields as ContactContent;
  const heading = content.heading || '문의하기';
  const intro = content.intro;
  const hours = content.hours;
  const items = content.items ?? [];

  return (
    <section className="bg-[var(--color-surface)]">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:gap-20">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
            {heading}
          </h2>
          {intro && (
            <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--color-muted)]">
              {intro}
            </p>
          )}
          {hours && (
            <div className="mt-8 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-soft)] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)]">
                운영 시간
              </p>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--color-ink)]">
                {hours}
              </p>
            </div>
          )}
        </div>

        <dl className="divide-y divide-[var(--color-line)] border-t border-[var(--color-line)]">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-1 py-6 sm:flex-row sm:items-baseline sm:gap-8"
            >
              <dt className="w-28 shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                {item.fields.label}
              </dt>
              <dd className="text-base font-medium text-[var(--color-ink)]">
                {item.fields.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};

Contact.meta = {
  componentKey: 'contact',
  category: 'contact',
  label: '문의 정보',
  fieldsSchema: contactSchema,
};

export default Contact;
