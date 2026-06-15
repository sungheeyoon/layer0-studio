import React from 'react';
import Link from 'next/link';
import { TemplateSectionProps, SectionComponent, NavSectionProps } from '../../../types';
import { getFieldValue } from '@/domain/entities/template.entity';

/**
 * Shared footer — rendered on every page below the page body. `navItems` here
 * are the footer page links (reachable pages kept out of the top nav, e.g.
 * privacy / terms), injected by `RenderMultiSite`. See PLAN_multipage §6 (E).
 */
const Footer: SectionComponent = function Footer(props: TemplateSectionProps) {
  const { section } = props;
  const { navItems } = props as NavSectionProps;
  const copyright =
    getFieldValue(section.data, 'copyright') || '© Acme Inc.';

  return (
    <footer className="border-t border-black/10 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>{copyright}</span>
        {navItems?.length > 0 && (
          <nav className="flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-slate-500 no-underline transition-colors hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
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
