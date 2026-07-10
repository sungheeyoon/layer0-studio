import { TemplateSectionProps, SectionComponent } from '../../../types';
import { getFieldValue, ArrayField } from '@/domain/entities/template.entity';

/** 커리큘럼 / 반 편성 — each row is a course track with its target grade. */
const Curriculum: SectionComponent = function Curriculum({ section }: TemplateSectionProps) {
  const { fields } = section;
  const eyebrow = getFieldValue(fields, 'eyebrow') || '';
  const title = getFieldValue(fields, 'title') || '';
  const subtitle = getFieldValue(fields, 'subtitle') || '';
  const items = (fields.items as ArrayField | undefined)?.items ?? [];

  return (
    <section className="bg-[var(--color-surface)]">
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

        <div className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
          {items.map((item, idx) => {
            const name = getFieldValue(item.name);
            const target = getFieldValue(item.target);
            const desc = getFieldValue(item.desc);
            return (
              <div
                key={getFieldValue(item.name) || idx}
                className="flex flex-col gap-3 py-7 sm:flex-row sm:items-baseline sm:gap-8"
              >
                <div className="sm:w-64 sm:shrink-0">
                  <h3 className="text-xl font-bold text-[var(--color-primary)]">{name}</h3>
                  {target && (
                    <span className="mt-1 inline-block bg-[var(--color-secondary)]/10 px-3 py-1 text-sm font-semibold text-[var(--color-secondary)]">
                      {target}
                    </span>
                  )}
                </div>
                <p className="flex-1 text-[15px] leading-relaxed text-[var(--color-muted)]">{desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

Curriculum.meta = {
  componentKey: 'curriculum',
  category: 'content',
  label: '커리큘럼 / 반 편성',
  fieldsSchema: {
    eyebrow: { type: 'text', label: '상단 라벨' },
    title: { type: 'text', label: '섹션 제목', required: true },
    subtitle: { type: 'textarea', label: '섹션 설명' },
    items: {
      type: 'array',
      label: '커리큘럼 항목',
      minItems: 1,
      maxItems: 8,
      itemSchema: {
        name: { type: 'text', label: '반/과정 이름', required: true },
        target: { type: 'text', label: '대상 (학년/수준)' },
        desc: { type: 'textarea', label: '설명' },
      },
    },
  },
  previewImage: '/component-previews/academy/curriculum.webp',
};

export default Curriculum;
