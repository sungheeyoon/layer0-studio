import React from 'react';
import { TemplateBlockProps, BlockComponent } from '../../../types';
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

/**
 * 예약 폼 — a presentational appointment form. Inputs are disabled (templates
 * are static); each row is driven by the `fields` array so the clinic can
 * rename or reorder them in the editor. `fields` falls back to an empty array.
 */
const appointmentFormSchema = {
  heading: { type: 'text', label: '제목', required: true },
  description: { type: 'textarea', label: '안내 문구' },
  submitLabel: { type: 'text', label: '버튼 텍스트' },
  note: { type: 'textarea', label: '하단 안내' },
  fields: {
    type: 'array',
    label: '입력 항목',
    minItems: 1,
    itemSchema: {
      label: { type: 'text', label: '항목명', required: true },
      type: {
        type: 'select',
        label: '입력 유형',
        options: ['text', 'tel', 'date', 'select', 'textarea'],
      },
      placeholder: { type: 'text', label: '안내 문구' },
    },
  },
} as const satisfies FieldsSchema;

type AppointmentFormContent = ValuesOf<typeof appointmentFormSchema>;

const AppointmentForm: BlockComponent = function AppointmentForm(props: TemplateBlockProps) {
  const { block } = props;
  const content = block.fields as AppointmentFormContent;
  const heading = content.heading || '온라인 예약';
  const description = content.description;
  const submitLabel = content.submitLabel || '예약 신청';
  const note = content.note;
  const rows = content.fields ?? [];

  const inputClass =
    'mt-2 w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)]';

  return (
    <section className="bg-[var(--color-surface-soft)]">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">
            {heading}
          </h2>
          {description && (
            <p className="mt-5 text-base leading-relaxed text-[var(--color-muted)]">{description}</p>
          )}
        </div>

        <form className="mt-10 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8" aria-label={heading}>
          <div className="grid gap-6 sm:grid-cols-2">
            {rows.map((row) => {
              const label = row.fields.label;
              const type = row.fields.type || 'text';
              const placeholder = row.fields.placeholder;
              const wide = type === 'textarea';
              return (
                <div key={row.id} className={wide ? 'sm:col-span-2' : ''}>
                  <label className="text-sm font-medium text-[var(--color-ink)]">{label}</label>
                  {type === 'textarea' ? (
                    <textarea rows={4} disabled placeholder={placeholder} className={inputClass} />
                  ) : type === 'select' ? (
                    <select disabled className={inputClass} defaultValue="">
                      <option value="">{placeholder || '선택'}</option>
                    </select>
                  ) : (
                    <input
                      type={type === 'tel' ? 'tel' : type === 'date' ? 'date' : 'text'}
                      disabled
                      placeholder={placeholder}
                      className={inputClass}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex rounded-full bg-[var(--color-primary)] px-8 py-3.5 text-sm font-semibold text-[var(--color-on-dark)]">
              {submitLabel}
            </span>
            {note && <p className="text-xs leading-relaxed text-[var(--color-muted)]">{note}</p>}
          </div>
        </form>
      </div>
    </section>
  );
};

AppointmentForm.meta = {
  componentKey: 'appointmentForm',
  category: 'form',
  label: '예약 폼',
  fieldsSchema: appointmentFormSchema,
};

export default AppointmentForm;
