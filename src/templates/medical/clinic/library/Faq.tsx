import React from 'react';
import { TemplateSectionProps, SectionComponent } from '../../../types';
import { getFieldValue, ArrayField } from '@/domain/entities/template.entity';

/**
 * 자주 묻는 질문 — a simple question/answer list. Rendered as static
 * open rows (server component, no client JS). `items` falls back to an
 * empty array for older Sites.
 */
const Faq: SectionComponent = function Faq(props: TemplateSectionProps) {
  const { section } = props;
  const eyebrow = getFieldValue(section.fields, 'eyebrow');
  const heading = getFieldValue(section.fields, 'heading');
  const items = (section.fields.items as ArrayField | undefined)?.items ?? [];

  return (
    <section className="bg-[var(--color-surface)]">
      <div className="mx-auto max-w-4xl px-6 py-24">
        {(eyebrow || heading) && (
          <div className="mb-12 max-w-2xl">
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

        <dl className="divide-y divide-[var(--color-line)] border-t border-[var(--color-line)]">
          {items.map((item, idx) => {
            const question = getFieldValue(item.question);
            const answer = getFieldValue(item.answer);
            return (
              <div key={question || idx} className="py-7">
                <dt className="flex gap-3 text-lg font-semibold text-[var(--color-ink)]">
                  <span className="text-[var(--color-primary)]">Q.</span>
                  <span>{question}</span>
                </dt>
                {answer && (
                  <dd className="mt-3 pl-7 text-base leading-relaxed text-[var(--color-muted)]">
                    {answer}
                  </dd>
                )}
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
};

Faq.meta = {
  componentKey: 'faq',
  category: 'content',
  label: '자주 묻는 질문',
  fieldsSchema: {
    eyebrow: { type: 'text', label: '상단 라벨' },
    heading: { type: 'text', label: '제목' },
    items: {
      type: 'array',
      label: 'FAQ 항목',
      minItems: 1,
      itemSchema: {
        question: { type: 'text', label: '질문', required: true },
        answer: { type: 'textarea', label: '답변', required: true },
      },
    },
  },
};

export default Faq;
