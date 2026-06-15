import React from 'react';
import { TemplateSectionProps, SectionComponent, NavSectionProps } from '../../../types';
import { getFieldValue } from '@/domain/entities/template.entity';

/**
 * Multi-page header. The page-link menu (`navItems`) is projected from the
 * Site's pages and injected by `RenderMultiSite` (see ADR-0007 §3.3); each
 * entry is a real page link (not an anchor), so a plain server component
 * with `<a href>` is enough.
 */
const Navigation: SectionComponent = function Navigation(props: TemplateSectionProps) {
  const { section } = props;
  const { navItems } = props as NavSectionProps;
  const brandName = getFieldValue(section.data, 'brandName') || 'Acme';

  return (
    <header
      className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a
          href={navItems[0]?.href ?? '/'}
          className="text-lg font-semibold tracking-tight no-underline"
          style={{ color: 'var(--theme-primary)' }}
        >
          {brandName}
        </a>
        <nav className="flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 no-underline transition-colors hover:text-slate-900"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};

Navigation.meta = {
  componentKey: 'nav',
  category: 'nav',
  label: 'Header Navigation',
  dataSchema: {
    brandName: { type: 'text', label: 'Brand Name', required: true },
  },
};

export default Navigation;
