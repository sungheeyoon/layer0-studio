import React from 'react';
import Link from 'next/link';
import { TemplateBlockProps, BlockComponent, NavBlockProps } from '../../../types';
import type { FieldsSchema, ValuesOf } from '@/domain/entities/template.entity';

/**
 * Shared footer on every page. `navItems` are the footer page links
 * (reachable pages kept out of the top nav), injected by `RenderMultiSite`.
 */
const footerSchema = {
  brandName: { type: 'text', label: '병원명', required: true },
  tagline: { type: 'textarea', label: '태그라인' },
  phone: { type: 'text', label: '대표전화' },
  address: { type: 'text', label: '주소' },
  copyright: { type: 'text', label: '저작권 문구', required: true },
} as const satisfies FieldsSchema;

type FooterContent = ValuesOf<typeof footerSchema>;

const Footer: BlockComponent = function Footer(props: TemplateBlockProps) {
  const { block } = props;
  const content = block.fields as FooterContent;
  const { navItems } = props as NavBlockProps;
  const brandName = content.brandName || '온유의원';
  const tagline = content.tagline;
  const phone = content.phone;
  const address = content.address;
  const copyright = content.copyright || '© 온유의원';

  return (
    <footer className="border-t border-[var(--color-line)] bg-[var(--color-surface-dark)]">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="text-lg font-bold tracking-tight text-[var(--color-on-dark)]">
              {brandName}
            </p>
            {tagline && (
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-on-dark)]/70">
                {tagline}
              </p>
            )}
            <div className="mt-5 space-y-1 text-sm text-[var(--color-on-dark)]/70">
              {address && <p>{address}</p>}
              {phone && <p>대표전화 {phone}</p>}
            </div>
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
  fieldsSchema: footerSchema,
};

export default Footer;
