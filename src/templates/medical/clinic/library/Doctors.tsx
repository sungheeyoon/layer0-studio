import React from 'react';
import { TemplateSectionProps, SectionComponent } from '../../../types';
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

/**
 * 의료진 grid — a portrait, name, specialty and a short bio per doctor.
 * Used as a preview (few cards) on the home page and the full roster on the
 * about page. `items` falls back to an empty array for older Sites.
 */
const doctorsSchema = {
  eyebrow: { type: 'text', label: '상단 라벨' },
  heading: { type: 'text', label: '제목' },
  items: {
    type: 'array',
    label: '의료진 항목',
    minItems: 1,
    itemSchema: {
      name: { type: 'text', label: '이름', required: true },
      role: { type: 'text', label: '직함/전문과목' },
      bio: { type: 'textarea', label: '소개' },
      image: { type: 'image', label: '사진', required: true },
    },
  },
} as const satisfies FieldsSchema;

type DoctorsContent = ValuesOf<typeof doctorsSchema>;

const Doctors: SectionComponent = function Doctors(props: TemplateSectionProps) {
  const { section } = props;
  const content = section.fields as DoctorsContent;
  const eyebrow = content.eyebrow;
  const heading = content.heading;
  const items = content.items ?? [];

  return (
    <section className="bg-[var(--color-surface)]">
      <div className="mx-auto max-w-7xl px-6 py-24">
        {(eyebrow || heading) && (
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
          </div>
        )}

        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const name = item.fields.name;
            const role = item.fields.role;
            const bio = item.fields.bio;
            const image = item.fields.image?.url;
            return (
              <article key={item.id} className="flex flex-col">
                <div className="overflow-hidden rounded-2xl bg-[var(--color-surface-soft)]">
                  {image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt={name}
                      className="aspect-[4/5] w-full object-cover"
                    />
                  )}
                </div>
                <div className="mt-5">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-lg font-semibold text-[var(--color-ink)]">{name}</h3>
                    {role && (
                      <span className="text-sm font-medium text-[var(--color-primary)]">{role}</span>
                    )}
                  </div>
                  {bio && (
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{bio}</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

Doctors.meta = {
  componentKey: 'doctors',
  category: 'team',
  label: '의료진 소개',
  fieldsSchema: doctorsSchema,
};

export default Doctors;
