import React from 'react';
import { TemplateSectionProps, SectionComponent } from '../../../types';
import { getFieldValue } from '@/domain/entities/template.entity';

/** Shared footer — rendered on every page below the page body. */
const Footer: SectionComponent = function Footer(props: TemplateSectionProps) {
  const { section } = props;
  const copyright =
    getFieldValue(section.data, 'copyright') || '© Acme Inc.';

  return (
    <footer className="border-t border-black/10 bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-slate-500">
        {copyright}
      </div>
    </footer>
  );
};

Footer.meta = {
  componentKey: 'footer',
  category: 'footer',
  label: 'Footer',
  dataSchema: {
    copyright: { type: 'text', label: 'Copyright', required: true },
  },
};

export default Footer;
