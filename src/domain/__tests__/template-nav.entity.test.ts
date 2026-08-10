import { describe, it, expect } from 'vitest';
import {
  deriveNav,
  deriveFooterNav,
  resolveActivePageSeo,
  Page,
  MultiContent,
  SingleContent,
} from '../entities/template.entity';

const globalStyles = {
  primaryColor: '#000000',
  secondaryColor: '#ffffff',
  backgroundColor: '#ffffff',
  fontFamily: 'Inter',
  fontSize: '16px',
  layout: 'wide',
};

function page(
  id: string,
  slug: string,
  visible: boolean,
  placement: 'header' | 'footer' | 'none',
  label: string,
  seoTitle?: string,
): Page {
  return {
    id,
    slug,
    visible,
    name: label,
    ...(placement === 'none' ? {} : {
      menu: placement === 'header' ? { label } : { label, placement: 'footer' as const },
    }),
    blocks: [],
    ...(seoTitle ? { seo: { title: seoTitle, description: `${label} desc` } } : {}),
  };
}

const pages: Page[] = [
  page('p-home', 'home', true, 'header', 'Home', 'Home Title'),
  page('p-about', 'about', true, 'header', 'About'),
  page('p-privacy', 'privacy', true, 'footer', 'Privacy'),
  page('p-draft', 'draft', false, 'none', 'Draft'),
];

const hrefOf = (p: Page) => (p.id === 'p-home' ? '/' : `/${p.slug}`);

describe('menu projection', () => {
  it('deriveNav lists visible header-menu pages in array order', () => {
    expect(deriveNav(pages, hrefOf)).toEqual([
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' },
    ]);
  });

  it('deriveFooterNav lists only explicit footer placement', () => {
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
  const multi: MultiContent = {
    mode: 'multi',
    templateKey: 'corporate-multipage',
    globalStyles,
    chrome: { header: [], footer: [] },
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
    const single: SingleContent = {
      mode: 'single',
      templateKey: 'cafe-default',
      globalStyles,
      blocks: [],
      seo: { title: 'Site Title', description: 'Site desc' },
    };
    expect(resolveActivePageSeo(single)?.title).toBe('Site Title');
  });
});

it('Single menu cannot express footer placement', () => {
  const menu = {
    label: 'About',
    // @ts-expect-error Single menu entries have no placement axis
    placement: 'footer',
  } satisfies import('../entities/template.entity').SingleMenuEntry;
  expect(menu.label).toBe('About');
});
