import React from 'react';
import { TemplateSectionProps, SectionComponent } from '../../../types';
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

/**
 * Dark stats band — a heading plus a row of value/label pairs. Sits on the
 * deep-forest surface to break up the warm paper sections.
 */
const statsSchema = {
  heading: { type: 'text', label: '제목' },
  items: {
    type: 'array',
    label: '지표 항목',
    minItems: 1,
    itemSchema: {
      value: { type: 'text', label: '수치', required: true },
      label: { type: 'text', label: '라벨', required: true },
    },
  },
} as const satisfies FieldsSchema;

type StatsContent = ValuesOf<typeof statsSchema>;

const Stats: SectionComponent = function Stats(props: TemplateSectionProps) {
  const { section } = props;
  const content = section.fields as StatsContent;
  const heading = content.heading;
  const items = content.items ?? [];

  return (
    <section className="bg-[var(--color-surface-dark)]">
      <div className="mx-auto max-w-7xl px-6 py-20">
        {heading && (
          <h2 className="mb-12 max-w-2xl text-2xl font-semibold tracking-tight text-[var(--color-on-dark)] sm:text-3xl">
            {heading}
          </h2>
        )}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {items.map((item) => (
            <div key={item.id}>
              <p className="text-4xl font-semibold tracking-tight text-[var(--color-secondary)] sm:text-5xl">
                {item.fields.value}
              </p>
              <p className="mt-2 text-sm text-[var(--color-on-dark)]/75">
                {item.fields.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

Stats.meta = {
  componentKey: 'stats',
  category: 'feature',
  label: '지표 (다크 밴드)',
  fieldsSchema: statsSchema,
};

export default Stats;
