import { TemplateBlockProps, BlockComponent } from '../../../types';
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

/** 시간표 · 수강료 — a simple pricing/schedule table. */
const tuitionSchema = {
  eyebrow: { type: 'text', label: '상단 라벨' },
  title: { type: 'text', label: '섹션 제목', required: true },
  note: { type: 'textarea', label: '하단 안내 문구' },
  items: {
    type: 'array',
    label: '과정 항목',
    minItems: 1,
    maxItems: 10,
    itemSchema: {
      name: { type: 'text', label: '과정명', required: true },
      schedule: { type: 'text', label: '시간표' },
      price: { type: 'text', label: '수강료' },
    },
  },
} as const satisfies FieldsSchema;

type TuitionContent = ValuesOf<typeof tuitionSchema>;

const Tuition: BlockComponent = function Tuition({ block }: TemplateBlockProps) {
  const content = block.fields as TuitionContent;
  const eyebrow = content.eyebrow || '';
  const title = content.title || '';
  const note = content.note || '';
  const items = content.items ?? [];

  return (
    <section className="bg-[var(--color-surface)]">
      <div className="mx-auto max-w-5xl px-6 py-24">
        <div className="mb-12 max-w-2xl">
          {eyebrow && (
            <p className="mb-4 text-sm font-semibold tracking-[0.2em] text-[var(--color-secondary)]">{eyebrow}</p>
          )}
          {title && (
            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl">{title}</h2>
          )}
        </div>

        <div className="overflow-hidden border border-[var(--color-line)]">
          <div className="hidden bg-[var(--color-primary)] px-6 py-4 text-sm font-semibold tracking-wide text-[var(--color-on-primary)] sm:grid sm:grid-cols-[1fr_1fr_auto] sm:gap-6">
            <span>과정</span>
            <span>시간표</span>
            <span className="text-right">수강료</span>
          </div>
          <div className="divide-y divide-[var(--color-line)]">
            {items.map((item) => {
              const name = item.fields.name;
              const schedule = item.fields.schedule;
              const price = item.fields.price;
              return (
                <div
                  key={item.id}
                  className="grid grid-cols-1 gap-1 px-6 py-5 sm:grid-cols-[1fr_1fr_auto] sm:items-center sm:gap-6"
                >
                  <span className="text-lg font-bold text-[var(--color-primary)]">{name}</span>
                  <span className="text-[15px] text-[var(--color-muted)]">{schedule}</span>
                  <span className="text-lg font-bold text-[var(--color-secondary)] sm:text-right">{price}</span>
                </div>
              );
            })}
          </div>
        </div>

        {note && <p className="mt-5 text-sm text-[var(--color-muted)]">{note}</p>}
      </div>
    </section>
  );
};

Tuition.meta = {
  componentKey: 'tuition',
  category: 'content',
  label: '시간표 · 수강료',
  fieldsSchema: tuitionSchema,
  previewImage: '/component-previews/academy/tuition.webp',
};

export default Tuition;
