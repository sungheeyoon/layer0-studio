import React from 'react';
import { TemplateSectionProps, SectionComponent } from '../../../types';
import { getFieldValue } from '@/domain/entities/template.entity';

/**
 * Generic page content block — an eyebrow, a heading and a body paragraph.
 * Reused across the Multi template's pages (one continuous section per page
 * is enough to prove the shared-header + per-page-body assembly).
 */
const Content: SectionComponent = function Content(props: TemplateSectionProps) {
  const { section } = props;
  const eyebrow = getFieldValue(section.data, 'eyebrow');
  const heading = getFieldValue(section.data, 'heading') || 'Heading';
  const body = getFieldValue(section.data, 'body');

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      {eyebrow && (
        <p
          className="mb-4 text-xs font-semibold uppercase tracking-[0.2em]"
          style={{ color: 'var(--theme-secondary)' }}
        >
          {eyebrow}
        </p>
      )}
      <h1
        className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl"
        style={{ color: 'var(--theme-primary)' }}
      >
        {heading}
      </h1>
      {body && (
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
          {body}
        </p>
      )}
    </section>
  );
};

Content.meta = {
  componentKey: 'content',
  category: 'content',
  label: 'Page Content',
  dataSchema: {
    eyebrow: { type: 'text', label: 'Eyebrow' },
    heading: { type: 'text', label: 'Heading', required: true },
    body: { type: 'textarea', label: 'Body' },
  },
};

export default Content;
