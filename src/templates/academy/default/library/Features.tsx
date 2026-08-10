import { TemplateBlockProps, BlockComponent } from '../../../types';
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

/** 학원 특장점 — a light band of 3–4 strength cards. */
const featuresSchema = {
  eyebrow: { type: 'text', label: '상단 라벨' },
  title: { type: 'text', label: '섹션 제목', required: true },
  subtitle: { type: 'textarea', label: '섹션 설명' },
  items: {
    type: 'array',
    label: '특장점 항목',
    minItems: 1,
    maxItems: 6,
    itemSchema: {
      title: { type: 'text', label: '제목', required: true },
      desc: { type: 'textarea', label: '설명' },
    },
  },
} as const satisfies FieldsSchema;

type FeaturesContent = ValuesOf<typeof featuresSchema>;

const Features: BlockComponent = function Features({ block }: TemplateBlockProps) {
  const content = block.fields as FeaturesContent;
  const eyebrow = content.eyebrow || '';
  const title = content.title || '';
  const subtitle = content.subtitle || '';
  const items = content.items ?? [];

  return (
    <section className="bg-[var(--color-surface-soft)]">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-14 max-w-2xl">
          {eyebrow && (
            <p className="mb-4 text-sm font-semibold tracking-[0.2em] text-[var(--color-secondary)]">{eyebrow}</p>
          )}
          {title && (
            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl">{title}</h2>
          )}
          {subtitle && (
            <p className="mt-4 text-lg leading-relaxed text-[var(--color-muted)]">{subtitle}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => {
            const itemTitle = item.fields.title;
            const itemDesc = item.fields.desc;
            return (
              <div
                key={item.id}
                className="group border border-[var(--color-line)] bg-[var(--color-surface)] p-8 transition-all hover:border-[var(--color-secondary)] hover:shadow-lg"
              >
                <span className="mb-5 inline-flex h-11 w-11 items-center justify-center bg-[var(--color-primary)] text-lg font-bold text-[var(--color-on-primary)]">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <h3 className="mb-3 text-xl font-bold text-[var(--color-primary)]">{itemTitle}</h3>
                <p className="text-[15px] leading-relaxed text-[var(--color-muted)]">{itemDesc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

Features.meta = {
  componentKey: 'features',
  category: 'features',
  label: '학원 특장점',
  fieldsSchema: featuresSchema,
  previewImage: '/component-previews/academy/features.webp',
};

export default Features;
