import { describe, it, expect } from 'vitest';
import { collectAssetUsages, ContentAssetUsageCollector } from '../asset-usages';
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

describe('collectAssetUsages — slotKey namespaces (ADR-0007 §F)', () => {
  it('Single: `${section.id}.${key}`', () => {
    const single: SingleContent = {
      mode: 'single',
      templateKey: 'cafe-default',
      globalStyles,
      sections: [imageSection('hero-1', 'bg', 'asset-a')],
    };
    expect(collectAssetUsages(single)).toEqual([
      { assetId: 'asset-a', slotKey: 'hero-1.bg' },
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
    expect(usages).toContainEqual({ assetId: 'asset-h', slotKey: 'shared.header.nav-1.logo' });
    expect(usages).toContainEqual({ assetId: 'asset-f', slotKey: 'shared.footer.foot-1.badge' });
    // Page sections keyed by page id.
    expect(usages).toContainEqual({ assetId: 'asset-p', slotKey: 'page-home.hero-1.bg' });
    expect(usages).toHaveLength(3);
  });

  it('array items: `${section.id}.${key}[${i}].${itemKey}`', () => {
    const single: SingleContent = {
      mode: 'single',
      templateKey: 'cafe-default',
      globalStyles,
      sections: [
        {
          id: 'menu-1',
          type: 'menu-bento',
          visible: true,
          nav: { visible: false, label: '' },
          fields: {
            title: { type: 'text', label: 'Title', value: 'Menu' },
            items: {
              type: 'array',
              label: 'Items',
              items: [
                {
                  name: { type: 'text', label: 'Name', value: 'Latte' },
                  image: { type: 'image', label: 'Photo', value: 'https://cdn/a.jpg', assetId: 'asset-1' },
                },
                {
                  name: { type: 'text', label: 'Name', value: 'Cold Brew' },
                  image: { type: 'image', label: 'Photo', value: 'https://cdn/b.jpg', assetId: 'asset-2' },
                },
              ],
            },
          },
        },
      ],
    };

    expect(collectAssetUsages(single)).toEqual([
      { assetId: 'asset-1', slotKey: 'menu-1.items[0].image' },
      { assetId: 'asset-2', slotKey: 'menu-1.items[1].image' },
    ]);
  });

  it('array items are traversed in Multi pages and shared header/footer too', () => {
    const arraySection = (id: string, assetId: string): SingleSection => ({
      id,
      type: 'gallery',
      visible: true,
      nav: { visible: false, label: '' },
      fields: {
        photos: {
          type: 'array',
          label: 'Photos',
          items: [
            { image: { type: 'image', label: 'Photo', value: 'https://cdn/x.jpg', assetId } },
          ],
        },
      },
    });

    const multi: MultiContent = {
      mode: 'multi',
      templateKey: 'corporate-multipage',
      globalStyles,
      shared: {
        header: [arraySection('head-1', 'asset-h')],
        footer: [],
      },
      pages: [
        {
          id: 'page-home',
          slug: 'home',
          visible: true,
          nav: { visible: true, label: 'Home' },
          sections: [arraySection('gal-1', 'asset-p')],
        },
      ],
    };

    const usages = collectAssetUsages(multi);
    expect(usages).toContainEqual({ assetId: 'asset-h', slotKey: 'shared.header.head-1.photos[0].image' });
    expect(usages).toContainEqual({ assetId: 'asset-p', slotKey: 'page-home.gal-1.photos[0].image' });
    expect(usages).toHaveLength(2);
  });

  it('array items nested inside array items are traversed', () => {
    const single: SingleContent = {
      mode: 'single',
      templateKey: 'cafe-default',
      globalStyles,
      sections: [
        {
          id: 's1',
          type: 'nested',
          visible: true,
          nav: { visible: false, label: '' },
          fields: {
            groups: {
              type: 'array',
              label: 'Groups',
              items: [
                {
                  rows: {
                    type: 'array',
                    label: 'Rows',
                    items: [
                      { pic: { type: 'image', label: 'Pic', value: 'https://cdn/n.jpg', assetId: 'asset-n' } },
                    ],
                  },
                },
              ],
            },
          },
        },
      ],
    };

    expect(collectAssetUsages(single)).toEqual([
      { assetId: 'asset-n', slotKey: 's1.groups[0].rows[0].pic' },
    ]);
  });

  it('ignores array-item images that carry no assetId', () => {
    const single: SingleContent = {
      mode: 'single',
      templateKey: 'cafe-default',
      globalStyles,
      sections: [
        {
          id: 's1',
          type: 'menu-bento',
          visible: true,
          nav: { visible: false, label: '' },
          fields: {
            items: {
              type: 'array',
              label: 'Items',
              items: [
                { image: { type: 'image', label: 'Photo', value: 'https://cdn/c.jpg' } },
              ],
            },
          },
        },
      ],
    };

    expect(collectAssetUsages(single)).toEqual([]);
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

// The port adapter (#128). It is a one-line delegation today, but it is the seam
// that keeps `loadTemplate()` out of the data layer once ADR-0016 §5 makes the
// walk schema-driven — so it is worth one test that it actually delegates.
describe('ContentAssetUsageCollector', () => {
  it('returns what the walker returns', async () => {
    const single: SingleContent = {
      mode: 'single',
      templateKey: 'cafe-default',
      globalStyles,
      sections: [imageSection('hero-1', 'bg', 'asset-a')],
    };
    await expect(new ContentAssetUsageCollector().collect(single)).resolves.toEqual(
      collectAssetUsages(single),
    );
  });
});
