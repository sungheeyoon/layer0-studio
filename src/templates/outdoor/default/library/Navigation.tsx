import React from 'react';
import Link from 'next/link';
import { TemplateSectionProps, SectionComponent, NavSectionProps } from '../../../types';
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

/**
 * Shared header for the Multi site. The page-link menu (`navItems`) is
 * projected from the Site's pages and injected by `RenderMultiSite`
 * (ADR-0007 §3.3) — each entry is a real page link, so a plain server
 * component with `<Link>` is enough.
 */
const navigationSchema = {
  brandName: { type: 'text', label: '브랜드명', required: true },
  ctaLabel: { type: 'text', label: 'CTA 버튼 텍스트' },
  ctaHref: { type: 'text', label: 'CTA 링크' },
} as const satisfies FieldsSchema;

type NavigationContent = ValuesOf<typeof navigationSchema>;

const Navigation: SectionComponent = function Navigation(props: TemplateSectionProps) {
  const { section } = props;
  const content = section.fields as NavigationContent;
  const { navItems } = props as NavSectionProps;
  const brandName = content.brandName || '능선';
  const ctaLabel = content.ctaLabel;
  const ctaHref = content.ctaHref || navItems[0]?.href || '/';

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-line)] bg-[var(--color-surface)]/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          href={navItems[0]?.href ?? '/'}
          className="text-lg font-semibold tracking-[0.18em] text-[var(--color-primary)] no-underline"
        >
          {brandName}
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[var(--color-muted)] no-underline transition-colors hover:text-[var(--color-ink)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {ctaLabel && (
          <Link
            href={ctaHref}
            className="hidden rounded-full bg-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-[var(--color-on-dark)] no-underline transition-opacity hover:opacity-90 sm:inline-flex"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </header>
  );
};

Navigation.meta = {
  componentKey: 'nav',
  category: 'nav',
  label: '헤더 내비게이션',
  fieldsSchema: navigationSchema,
};

export default Navigation;
