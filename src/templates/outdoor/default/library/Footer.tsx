import React from 'react';
import Link from 'next/link';
import { TemplateSectionProps, SectionComponent, NavSectionProps } from '../../../types';
import { getFieldValue } from '@/domain/entities/template.entity';

/**
 * Shared footer on every page. `navItems` are the footer page links
 * (reachable pages kept out of the top nav), injected by `RenderMultiSite`.
 */
const Footer: SectionComponent = function Footer(props: TemplateSectionProps) {
  const { section } = props;
  const { navItems } = props as NavSectionProps;
  const brandName = getFieldValue(section.fields, 'brandName') || '능선';
  const tagline = getFieldValue(section.fields, 'tagline');
  const copyright = getFieldValue(section.fields, 'copyright') || '© 능선';

  return (
    <footer className="border-t border-[var(--color-line)] bg-[var(--color-surface-dark)]">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="text-lg font-semibold tracking-[0.18em] text-[var(--color-on-dark)]">
              {brandName}
            </p>
            {tagline && (
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-on-dark)]/70">
                {tagline}
              </p>
            )}
          </div>
          {navItems?.length > 0 && (
            <nav className="flex flex-wrap gap-x-6 gap-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-[var(--color-on-dark)]/70 no-underline transition-colors hover:text-[var(--color-on-dark)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
        <p className="mt-12 border-t border-[var(--color-on-dark)]/15 pt-6 text-xs text-[var(--color-on-dark)]/55">
          {copyright}
        </p>
      </div>
    </footer>
  );
};

Footer.meta = {
  componentKey: 'footer',
  category: 'footer',
  label: '푸터',
  fieldsSchema: {
    brandName: { type: 'text', label: '브랜드명', required: true },
    tagline: { type: 'textarea', label: '태그라인' },
    copyright: { type: 'text', label: '저작권 문구', required: true },
  },
};

export default Footer;
