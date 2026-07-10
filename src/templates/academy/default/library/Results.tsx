import { TemplateSectionProps, SectionComponent } from '../../../types';
import { getFieldValue, ArrayField } from '@/domain/entities/template.entity';

/** 합격 / 성적 실적 — a deep-navy band of headline numbers. */
const Results: SectionComponent = function Results({ section }: TemplateSectionProps) {
  const { fields } = section;
  const eyebrow = getFieldValue(fields, 'eyebrow') || '';
  const title = getFieldValue(fields, 'title') || '';
  const items = (fields.items as ArrayField | undefined)?.items ?? [];

  return (
    <section className="bg-[var(--color-surface-dark)]">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-14 max-w-2xl">
          {eyebrow && (
            <p className="mb-4 text-sm font-semibold tracking-[0.2em] text-[var(--color-accent)]">{eyebrow}</p>
          )}
          {title && (
            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-on-primary)] sm:text-4xl">{title}</h2>
          )}
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-4">
          {items.map((item, idx) => {
            const value = getFieldValue(item.value);
            const label = getFieldValue(item.label);
            return (
              <div key={getFieldValue(item.label) || idx}>
                <p className="text-4xl font-bold tracking-tight text-[var(--color-accent)] sm:text-5xl">{value}</p>
                <p className="mt-3 text-[15px] leading-snug text-[var(--color-on-dark)]/75">{label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

Results.meta = {
  componentKey: 'results',
  category: 'feature',
  label: '합격 / 성적 실적',
  fieldsSchema: {
    eyebrow: { type: 'text', label: '상단 라벨' },
    title: { type: 'text', label: '섹션 제목', required: true },
    items: {
      type: 'array',
      label: '실적 항목',
      minItems: 1,
      maxItems: 8,
      itemSchema: {
        value: { type: 'text', label: '수치', required: true },
        label: { type: 'text', label: '라벨', required: true },
      },
    },
  },
  previewImage: '/component-previews/academy/results.webp',
};

export default Results;
