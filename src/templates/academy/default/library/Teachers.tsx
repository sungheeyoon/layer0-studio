import { TemplateSectionProps, SectionComponent } from '../../../types';
import { getFieldValue, ArrayField } from '@/domain/entities/template.entity';

/** 강사진 소개 — photo cards. The template's primary array showcase. */
const Teachers: SectionComponent = function Teachers({ section }: TemplateSectionProps) {
  const { fields } = section;
  const eyebrow = getFieldValue(fields, 'eyebrow') || '';
  const title = getFieldValue(fields, 'title') || '';
  const subtitle = getFieldValue(fields, 'subtitle') || '';
  const items = (fields.items as ArrayField | undefined)?.items ?? [];

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

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => {
            const name = getFieldValue(item.name);
            const subject = getFieldValue(item.subject);
            const bio = getFieldValue(item.bio);
            const image = getFieldValue(item.image);
            return (
              <div
                key={getFieldValue(item.name) || idx}
                className="overflow-hidden border border-[var(--color-line)] bg-[var(--color-surface)]"
              >
                <div className="aspect-[4/5] w-full overflow-hidden bg-[var(--color-primary)]/5">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt={name} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-[var(--color-primary)]/20">
                      {name ? name.slice(0, 1) : '강'}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  {subject && (
                    <span className="text-sm font-semibold tracking-wide text-[var(--color-secondary)]">{subject}</span>
                  )}
                  <h3 className="mt-1 text-xl font-bold text-[var(--color-primary)]">{name}</h3>
                  {bio && <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-muted)]">{bio}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

Teachers.meta = {
  componentKey: 'teachers',
  category: 'content',
  label: '강사진 소개',
  fieldsSchema: {
    eyebrow: { type: 'text', label: '상단 라벨' },
    title: { type: 'text', label: '섹션 제목', required: true },
    subtitle: { type: 'textarea', label: '섹션 설명' },
    items: {
      type: 'array',
      label: '강사 항목',
      minItems: 1,
      maxItems: 9,
      itemSchema: {
        name: { type: 'text', label: '이름', required: true },
        subject: { type: 'text', label: '담당 과목' },
        bio: { type: 'textarea', label: '소개/경력' },
        image: { type: 'image', label: '사진' },
      },
    },
  },
  previewImage: '/component-previews/academy/teachers.webp',
};

export default Teachers;
