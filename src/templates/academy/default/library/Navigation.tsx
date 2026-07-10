'use client';

import { useState, useEffect } from 'react';
import { TemplateSectionProps, SectionComponent, NavSectionProps } from '../../../types';
import { getFieldValue } from '@/domain/entities/template.entity';

/**
 * Sticky top nav. `navItems` is projected by the renderer (deriveNav) from the
 * sections whose `nav.visible` is true — this component just renders the anchors.
 */
const Navigation: SectionComponent = function Navigation(props: TemplateSectionProps) {
  const { section } = props;
  const { navItems } = props as NavSectionProps;
  const { fields } = section;
  const brandName = getFieldValue(fields, 'brandName') || '';
  const brandSubtext = getFieldValue(fields, 'brandSubtext') || '';
  const ctaText = getFieldValue(fields, 'ctaText') || '';
  const ctaUrl = getFieldValue(fields, 'ctaUrl') || '#';

  const [scrolled, setScrolled] = useState(false);
  const [mobOpen, setMobOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 h-16 border-b bg-[var(--color-primary)] transition-shadow ${
        scrolled ? 'border-[var(--color-on-dark)]/15 shadow-lg' : 'border-transparent'
      }`}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
        {/* Brand */}
        <a href="#" className="flex flex-col leading-none no-underline">
          <span className="text-lg font-bold tracking-tight text-[var(--color-on-primary)]">{brandName}</span>
          {brandSubtext && (
            <span className="mt-0.5 text-[10px] font-medium tracking-[0.18em] text-[var(--color-on-dark)]/60">
              {brandSubtext}
            </span>
          )}
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 lg:flex">
          {navItems.map((item, i) => (
            <a
              key={i}
              href={item.href}
              className="text-sm font-medium text-[var(--color-on-dark)]/80 no-underline transition-colors hover:text-[var(--color-on-primary)]"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* CTA + mobile toggle */}
        <div className="flex items-center gap-3">
          {ctaText && (
            <a
              href={ctaUrl}
              className="hidden bg-[var(--color-secondary)] px-5 py-2.5 text-sm font-semibold text-[var(--color-on-primary)] no-underline transition-all hover:brightness-110 sm:inline-flex"
            >
              {ctaText}
            </a>
          )}
          <button
            type="button"
            aria-label="메뉴"
            className="cursor-pointer border-0 bg-transparent p-2 text-[var(--color-on-primary)] lg:hidden"
            onClick={() => setMobOpen(!mobOpen)}
          >
            <span className="block h-0.5 w-5 bg-current" />
            <span className="mt-1 block h-0.5 w-5 bg-current" />
            <span className="mt-1 block h-0.5 w-5 bg-current" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden bg-[var(--color-primary)] transition-all duration-300 lg:hidden ${
          mobOpen ? 'max-h-96 border-t border-[var(--color-on-dark)]/15' : 'max-h-0'
        }`}
      >
        <div className="space-y-1 px-6 py-4">
          {navItems.map((item, i) => (
            <a
              key={i}
              href={item.href}
              className="block py-2 text-[15px] font-medium text-[var(--color-on-dark)]/85 no-underline"
              onClick={() => setMobOpen(false)}
            >
              {item.label}
            </a>
          ))}
          {ctaText && (
            <a
              href={ctaUrl}
              onClick={() => setMobOpen(false)}
              className="mt-2 block bg-[var(--color-secondary)] px-5 py-3 text-center text-sm font-semibold text-[var(--color-on-primary)] no-underline"
            >
              {ctaText}
            </a>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
