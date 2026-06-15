import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import CorporateMultipageTemplate from '../corporate/multipage';
import preset from '../corporate/multipage/template';
import { isMultiTemplate } from '@/domain/entities/template.entity';

const siteJson = preset.templateJson;
const BASE = '/site/acme';

function render(activePageId: string): string {
  return renderToStaticMarkup(
    <CorporateMultipageTemplate
      siteJson={siteJson}
      selectedSectionId={null}
      activePageId={activePageId}
      basePath={BASE}
    />,
  );
}

describe('RenderMultiSite — Multi tracer assembly', () => {
  it('the fixture is a Multi Site with a shared header/footer and ≥2 pages', () => {
    expect(isMultiTemplate(siteJson)).toBe(true);
    if (!isMultiTemplate(siteJson)) return;
    expect(siteJson.shared.header.length).toBeGreaterThan(0);
    expect(siteJson.shared.footer.length).toBeGreaterThan(0);
    expect(siteJson.pages.length).toBeGreaterThanOrEqual(2);
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
});
