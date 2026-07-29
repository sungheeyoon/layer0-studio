import { describe, it, expect } from 'vitest';
import { collectAssetUsages } from '../asset-usages';
import {
  SingleContent,
  MultiContent,
  SingleSection,
} from '@/domain/entities/template.entity';

const globalStyles = {
  primaryColor: '#000000',
  secondaryColor: '#ffffff',
  backgroundColor: '#ffffff',
  fontFamily: 'Inter',
  fontSize: '16px',
  layout: 'wide',
};

// Returns a SingleSection (carries `nav`), which is also assignable wherever a
// base Section is expected (Multi shared/page sections).
function imageSection(id: string, key: string, assetId: string): SingleSection {
  return {
    id,
    type: 'hero',
    visible: true,
    nav: { visible: false, label: '' },
    fields: {
      [key]: { type: 'image', label: 'Image', value: 'https://cdn/x.jpg', assetId },
    },
  };
}

describe('collectAssetUsages — slot_key namespaces (ADR-0007 §F)', () => {
  it('Single: `${section.id}.${key}`', () => {
    const single: SingleContent = {
      mode: 'single',
      templateKey: 'cafe-default',
      globalStyles,
      sections: [imageSection('hero-1', 'bg', 'asset-a')],
    };
    expect(collectAssetUsages(single)).toEqual([
      { asset_id: 'asset-a', slot_key: 'hero-1.bg' },
    ]);
  });

  it('Multi: page sections use `${page.id}...`, shared use `shared.${slot}...`', () => {
    const multi: MultiContent = {
      mode: 'multi',
      templateKey: 'corporate-multipage',
      globalStyles,
      shared: {
        header: [imageSection('nav-1', 'logo', 'asset-h')],
        footer: [imageSection('foot-1', 'badge', 'asset-f')],
      },
      pages: [
        {
          id: 'page-home',
          slug: 'home',
          visible: true,
          nav: { visible: true, label: 'Home' },
          sections: [imageSection('hero-1', 'bg', 'asset-p')],
        },
      ],
    };

    const usages = collectAssetUsages(multi);

    // Shared header/footer are traversed (belong to no page) — not mis-swept.
    expect(usages).toContainEqual({ asset_id: 'asset-h', slot_key: 'shared.header.nav-1.logo' });
    expect(usages).toContainEqual({ asset_id: 'asset-f', slot_key: 'shared.footer.foot-1.badge' });
    // Page sections keyed by page id.
    expect(usages).toContainEqual({ asset_id: 'asset-p', slot_key: 'page-home.hero-1.bg' });
    expect(usages).toHaveLength(3);
  });

  it('ignores non-image fields and images without an assetId', () => {
    const single: SingleContent = {
      mode: 'single',
      templateKey: 'cafe-default',
      globalStyles,
      sections: [
        {
          id: 's1',
          type: 'hero',
          visible: true,
          nav: { visible: false, label: '' },
          fields: {
            title: { type: 'text', label: 'Title', value: 'hi' },
            pic: { type: 'image', label: 'Pic', value: 'https://cdn/y.jpg' }, // no assetId
          },
        },
      ],
    };
    expect(collectAssetUsages(single)).toEqual([]);
  });
});
