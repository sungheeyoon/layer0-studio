import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import { RenderMultiSite } from '../renderMultiSite';
import { TemplateLibrary, NavBlockProps, BlockComponent } from '../types';
import {
  ContentModel,
  isMultiContent,
} from '@/domain/entities/template.entity';

// ---------------------------------------------------------------------------
// Self-contained Multi fixture. RenderMultiSite is generic Multi infra used by a
// shipping Multi template (outdoor-default) and the routes/sitemap/editor. We
// exercise it here with a minimal in-test library + content rather than coupling
// the test to any shipping template's content. (corporate-multipage, a former
// minimal Multi example, was removed — see migration 020.)
// ---------------------------------------------------------------------------

const meta = (componentKey: string) => ({
  componentKey,
  category: componentKey,
  label: componentKey,
  fieldsSchema: {},
});

// nav/footer take injected page links; the renderer passes them via createElement
// (see renderMultiSite), so — like the real templates — read them through a cast.
const Nav: BlockComponent = (props) => {
  const { navItems } = props as NavBlockProps;
  return (
    <header>
      <span>Acme</span>
      <nav>
        {navItems.map((i) => (
          <a key={i.href} href={i.href}>
            {i.label}
          </a>
        ))}
      </nav>
    </header>
  );
};

const Body: BlockComponent = ({ block }) => (
  <main>{(block.fields as { text?: string }).text ?? ''}</main>
);

const Footer: BlockComponent = (props) => {
  const { navItems } = props as NavBlockProps;
  return (
    <footer>
      {navItems.map((i) => (
        <a key={i.href} href={i.href}>
          {i.label}
        </a>
      ))}
      <small>All rights reserved.</small>
    </footer>
  );
};

const library: TemplateLibrary = {
  nav: { Component: Nav, meta: meta('nav') },
  body: { Component: Body, meta: meta('body') },
  footer: { Component: Footer, meta: meta('footer') },
};

/** One Block's Values — a bare string, not a `{type,label,value}` wrapper (ADR-0016 §4). */
const text = (value: string) => ({ text: value });

const content: ContentModel = {
  mode: 'multi',
  templateKey: 'fixture-multi',
  globalStyles: {
    primaryColor: 'var(--color-primary)',
    secondaryColor: 'var(--color-secondary)',
    backgroundColor: 'var(--color-surface)',
    fontFamily: 'var(--font-base)',
    fontSize: '16px',
    layout: 'default',
  },
  chrome: {
    header: [{ id: 'nav', type: 'nav', visible: true, fields: {} }],
    footer: [{ id: 'footer', type: 'footer', visible: true, fields: {} }],
  },
  pages: [
    {
      id: 'page-home',
      slug: '',
      visible: true,
      name: 'Home',
      menu: { label: 'Home' },
      blocks: [
        { id: 's-home', type: 'body', visible: true, fields: text('We build dependable software.') },
      ],
    },
    {
      id: 'page-about',
      slug: 'about',
      visible: true,
      name: 'About',
      menu: { label: 'About' },
      blocks: [
        { id: 's-about', type: 'body', visible: true, fields: text('A team that sweats the details.') },
      ],
    },
    {
      id: 'page-privacy',
      slug: 'privacy',
      visible: true,
      name: 'Privacy',
      menu: { label: 'Privacy', placement: 'footer' },
      blocks: [
        { id: 's-privacy', type: 'body', visible: true, fields: text('Privacy policy.') },
      ],
    },
  ],
};

const BASE = '/site/acme';

function render(activePageId: string): string {
  return renderToStaticMarkup(
    <RenderMultiSite
      content={content}
      selectedSectionId={null}
      activePageId={activePageId}
      basePath={BASE}
      library={library}
    />,
  );
}

describe('RenderMultiSite — Multi tracer assembly', () => {
  it('the fixture is a Multi Site with a shared header/footer and ≥2 pages', () => {
    expect(isMultiContent(content)).toBe(true);
    if (!isMultiContent(content)) return;
    expect(content.chrome.header.length).toBeGreaterThan(0);
    expect(content.chrome.footer.length).toBeGreaterThan(0);
    expect(content.pages.length).toBeGreaterThanOrEqual(2);
  });

  it('renders shared header → home page sections → shared footer (home only)', () => {
    const html = render('page-home');
    expect(html).toContain('Acme'); // shared header brand
    expect(html).toContain('We build dependable software.'); // home page body
    expect(html).toContain('All rights reserved.'); // shared footer
    expect(html).not.toContain('A team that sweats the details.'); // about body absent
  });

  it('keeps the shared header on the About page and swaps the page body', () => {
    const html = render('page-about');
    expect(html).toContain('Acme'); // shared header present on both pages
    expect(html).toContain('A team that sweats the details.'); // about body
    expect(html).not.toContain('We build dependable software.'); // home body absent
  });

  it('projects a page-link nav in array order (home → base, others → base/slug)', () => {
    const html = render('page-home');
    // Page links, not anchors: home points at the base path, About at base/about.
    expect(html).toContain(`href="${BASE}"`);
    expect(html).toContain(`href="${BASE}/about"`);
    expect(html).not.toContain('href="#'); // not anchor scroll
    // Array order: Home appears before About in the rendered nav.
    expect(html.indexOf('>Home<')).toBeLessThan(html.indexOf('>About<'));
    expect(html.indexOf('>Home<')).toBeGreaterThanOrEqual(0);
  });

  it('top nav excludes the privacy page; the footer links it (E)', () => {
    const html = render('page-home');
    // The privacy page is visible:true but nav.visible:false → not in the top
    // nav, but reachable via the footer link.
    expect(html).toContain(`href="${BASE}/privacy"`);
    expect(html).toContain('>Privacy<');
    // Only one occurrence (footer), not duplicated into the top nav.
    expect(html.split('>Privacy<').length - 1).toBe(1);
  });
});
