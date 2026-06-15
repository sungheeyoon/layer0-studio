import { describe, it, expect } from 'vitest';
import {
  deriveNav,
  deriveFooterNav,
  resolveActivePageSeo,
  TemplatePage,
  MultiPageTemplate,
  SinglePageTemplate,
} from '../entities/template.entity';

const globalStyles = {
  primaryColor: '#000000',
  secondaryColor: '#ffffff',
  fontFamily: 'Inter',
  fontSize: '16px',
  layout: 'wide',
};

function page(
  id: string,
  slug: string,
  visible: boolean,
  navVisible: boolean,
  label: string,
  seoTitle?: string,
): TemplatePage {
  return {
    id,
    slug,
    visible,
    nav: { visible: navVisible, label },
    sections: [],
    ...(seoTitle ? { seo: { title: seoTitle, description: `${label} desc` } } : {}),
  };
}

const pages: TemplatePage[] = [
  page('p-home', 'home', true, true, 'Home', 'Home Title'),
  page('p-about', 'about', true, true, 'About'),
  page('p-privacy', 'privacy', true, false, 'Privacy'), // routable, footer-only
  page('p-draft', 'draft', false, false, 'Draft'), // unroutable
];

const hrefOf = (p: TemplatePage) => (p.id === 'p-home' ? '/' : `/${p.slug}`);

describe('nav projection — top nav vs footer are complementary', () => {
  it('deriveNav lists only visible + nav.visible pages, in array order', () => {
    expect(deriveNav(pages, hrefOf)).toEqual([
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' },
    ]);
  });

  it('deriveFooterNav lists visible + !nav.visible pages (privacy, not draft)', () => {
    expect(deriveFooterNav(pages, hrefOf)).toEqual([
      { label: 'Privacy', href: '/privacy' },
    ]);
  });

  it('top nav and footer nav are disjoint (no page in both)', () => {
    const top = new Set(deriveNav(pages, hrefOf).map((x) => x.href));
    const footer = deriveFooterNav(pages, hrefOf).map((x) => x.href);
    expect(footer.some((href) => top.has(href))).toBe(false);
  });
});

describe('resolveActivePageSeo', () => {
  const multi: MultiPageTemplate = {
    mode: 'multi',
    templateKey: 'corporate-multipage',
    globalStyles,
    shared: { header: [], footer: [] },
    pages,
  };

  it('Multi: returns the active page seo', () => {
    expect(resolveActivePageSeo(multi, 'p-home')?.title).toBe('Home Title');
  });

  it('Multi: falls back to the first page when id is unknown', () => {
    expect(resolveActivePageSeo(multi, 'nope')?.title).toBe('Home Title');
  });

  it('Multi: returns undefined when the active page has no seo', () => {
    expect(resolveActivePageSeo(multi, 'p-about')).toBeUndefined();
  });

  it('Single: returns the site-level seo', () => {
    const single: SinglePageTemplate = {
      mode: 'single',
      templateKey: 'cafe-default',
      globalStyles,
      sections: [],
      seo: { title: 'Site Title', description: 'Site desc' },
    };
    expect(resolveActivePageSeo(single)?.title).toBe('Site Title');
  });
});
