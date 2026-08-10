import React from 'react';
import { TemplateBlockProps, BlockComponent } from '../../../types';
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

/**
 * 자주 묻는 질문 — a simple question/answer list. Rendered as static
 * open rows (server component, no client JS). `items` falls back to an
 * empty array for older Sites.
 */
const faqSchema = {
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
} as const satisfies FieldsSchema;

type FaqContent = ValuesOf<typeof faqSchema>;

const Faq: BlockComponent = function Faq(props: TemplateBlockProps) {
  const { block } = props;
  const content = block.fields as FaqContent;
  const eyebrow = content.eyebrow;
  const heading = content.heading;
  const items = content.items ?? [];

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
          {items.map((item) => {
            const question = item.fields.question;
            const answer = item.fields.answer;
            return (
              <div key={item.id} className="py-7">
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
  fieldsSchema: faqSchema,
};

export default Faq;
