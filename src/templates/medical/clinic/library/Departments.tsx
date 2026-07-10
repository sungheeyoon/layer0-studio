import React from 'react';
import { TemplateSectionProps, SectionComponent } from '../../../types';
import { getFieldValue, ArrayField } from '@/domain/entities/template.entity';

/**
 * 진료과목 grid — icon-led cards for each department/service. Used both as a
 * preview on the home page and as the full list on the services page.
 * Icons are simple line glyphs (stroke = currentColor, themed via the card).
 * `items` falls back to an empty array for older Sites (lazy migration).
 */

// Line icons — all use `currentColor` so the card controls the hue (no inline
// color literals). Keyed by the item's `icon` select field.
const ICON_PATHS: Record<string, React.ReactNode> = {
  stethoscope: (
    <>
      <path d="M4.5 3v6a4.5 4.5 0 0 0 9 0V3" />
      <path d="M4.5 3H3m1.5 0H6M13.5 3H12m1.5 0H15" />
      <path d="M9 17.5v1a4.5 4.5 0 0 0 9 0V16" />
      <circle cx="19" cy="14" r="2" />
    </>
  ),
  heart: <path d="M19 8.5c0 4-7 9.5-7 9.5S5 12.5 5 8.5A3.5 3.5 0 0 1 12 6a3.5 3.5 0 0 1 7 2.5Z" />,
  tooth: <path d="M12 4c2 0 3-1 4 0s1 3 .5 6-.5 8-1.5 8-1-3-3-3-2 3-3 3-1-5-1.5-8 .0-5 .5-6 2-1 4 0Z" />,
  eye: (
    <>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  bone: <path d="M17 3a2.5 2.5 0 0 1 1.7 4.3L9.3 16.7A2.5 2.5 0 1 1 7 20a2.5 2.5 0 1 1-3-3l9.4-9.4A2.5 2.5 0 0 1 17 3Z" />,
  brain: (
    <>
      <path d="M9.5 4A2.5 2.5 0 0 0 7 6.5 2.5 2.5 0 0 0 5 9a2.5 2.5 0 0 0 1 4v2a3 3 0 0 0 3.5 3" />
      <path d="M14.5 4A2.5 2.5 0 0 1 17 6.5 2.5 2.5 0 0 1 19 9a2.5 2.5 0 0 1-1 4v2a3 3 0 0 1-3.5 3" />
      <path d="M12 4v14" />
    </>
  ),
  child: (
    <>
      <circle cx="12" cy="5" r="2.5" />
      <path d="M12 8v7m0 0-3 5m3-5 3 5M7 11h10" />
    </>
  ),
  skin: (
    <>
      <path d="M4 12a8 8 0 0 1 16 0 8 8 0 0 1-16 0Z" />
      <path d="M9 10h.01M15 10h.01M9 15c1 1 5 1 6 0" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
};

const Departments: SectionComponent = function Departments(props: TemplateSectionProps) {
  const { section } = props;
  const eyebrow = getFieldValue(section.fields, 'eyebrow');
  const heading = getFieldValue(section.fields, 'heading');
  const description = getFieldValue(section.fields, 'description');
  const items = (section.fields.items as ArrayField | undefined)?.items ?? [];

  return (
    <section className="bg-[var(--color-surface-soft)]">
      <div className="mx-auto max-w-7xl px-6 py-24">
        {(eyebrow || heading || description) && (
          <div className="mb-14 max-w-2xl">
            {eyebrow && (
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-secondary)]">
                {eyebrow}
              </p>
            )}
            {heading && (
              <h2 className="text-3xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">
                {heading}
              </h2>
            )}
            {description && (
              <p className="mt-4 text-base leading-relaxed text-[var(--color-muted)]">
                {description}
              </p>
            )}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => {
            const name = getFieldValue(item.name);
            const body = getFieldValue(item.description);
            const iconKey = getFieldValue(item.icon) || 'plus';
            return (
              <article
                key={name || idx}
                className="group rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-8 transition-shadow hover:shadow-md"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-surface-soft)] text-[var(--color-primary)] transition-colors group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-on-dark)]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
                    {ICON_PATHS[iconKey] ?? ICON_PATHS.plus}
                  </svg>
                </span>
                <h3 className="mt-5 text-lg font-semibold text-[var(--color-ink)]">
                  {name}
                </h3>
                {body && (
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                    {body}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

Departments.meta = {
  componentKey: 'departments',
  category: 'feature',
  label: '진료과목 (아이콘 카드)',
  fieldsSchema: {
    eyebrow: { type: 'text', label: '상단 라벨' },
    heading: { type: 'text', label: '제목' },
    description: { type: 'textarea', label: '설명' },
    items: {
      type: 'array',
      label: '진료과목 항목',
      minItems: 1,
      itemSchema: {
        icon: {
          type: 'select',
          label: '아이콘',
          options: ['stethoscope', 'heart', 'tooth', 'eye', 'bone', 'brain', 'child', 'skin', 'plus'],
        },
        name: { type: 'text', label: '과목명', required: true },
        description: { type: 'textarea', label: '설명' },
      },
    },
  },
};

export default Departments;
