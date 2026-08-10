import { describe, it, expect, vi } from 'vitest';
import {
  SingleContent,
  MultiContent,
  SingleBlock,
  FieldsSchema,
} from '@/domain/entities/template.entity';
import { TemplateLibrary, TemplateModule, BlockComponent } from '@/templates/types';

import { collectAssetUsages, ContentAssetUsageCollector } from '../asset-usages';
import { loadTemplate } from '@/templates/registry';

// The adapter resolves the library through the registry. Mocking it keeps this
// file in the `node` environment: importing a real Template module pulls in React
// components and CSS modules that have nothing to do with the walk under test.
// (`vi.mock` is hoisted above the imports; the factory only closes over
// `testLibrary`, which is read when a test calls the adapter — long after init.)
vi.mock('@/templates/registry', () => ({
  loadTemplate: vi.fn(async (key: string) =>
    key === 'cafe-default' ? ({ library: testLibrary } as unknown as TemplateModule) : null,
  ),
}));

const globalStyles = {
  primaryColor: '#000000',
  secondaryColor: '#ffffff',
  backgroundColor: '#ffffff',
  fontFamily: 'Inter',
  fontSize: '16px',
  layout: 'wide',
};

// ── Schemas under test ───────────────────────────────────────────────────────
// After ADR-0016 a Value carries no `type`, so these — not the stored data —
// are what tells the collector which keys hold images.

const heroSchema = {
  title: { type: 'text', label: 'Title' },
  bg: { type: 'image', label: 'Background' },
  logo: { type: 'image', label: 'Logo' },
  badge: { type: 'image', label: 'Badge' },
} as const satisfies FieldsSchema;

const gallerySchema = {
  photos: {
    type: 'array',
    label: 'Photos',
    itemSchema: {
      caption: { type: 'text', label: 'Caption' },
      image: { type: 'image', label: 'Photo' },
    },
  },
} as const satisfies FieldsSchema;

const nestedSchema = {
  groups: {
    type: 'array',
    label: 'Groups',
    itemSchema: {
      rows: {
        type: 'array',
        label: 'Rows',
        itemSchema: {
          pic: { type: 'image', label: 'Pic' },
        },
      },
    },
  },
} as const satisfies FieldsSchema;

function libraryOf(schemas: Record<string, FieldsSchema>): TemplateLibrary {
  return Object.fromEntries(
    Object.entries(schemas).map(([componentKey, fieldsSchema]) => [
      componentKey,
      {
        Component: (() => null) as unknown as BlockComponent,
        meta: { componentKey, category: 'test', label: componentKey, fieldsSchema },
      },
    ]),
  );
}

const testLibrary = libraryOf({
  hero: heroSchema,
  gallery: gallerySchema,
  nested: nestedSchema,
});

/** A Value-shaped Block. Returns a SingleBlock, which is also assignable where a base Block is expected. */
function block(
  id: string,
  type: string,
  fields: Record<string, unknown>,
): SingleBlock {
  return { id, type, visible: true, fields };
}

function imageBlock(id: string, key: string, assetId: string): SingleBlock {
  return block(id, 'hero', { [key]: { url: 'https://cdn/x.jpg', assetId } });
}

function single(blocks: SingleBlock[]): SingleContent {
  return { mode: 'single', templateKey: 'cafe-default', globalStyles, blocks };
}

// ── slotKey namespaces ───────────────────────────────────────────────────────

describe('collectAssetUsages — slotKey namespaces (ADR-0007 §F)', () => {
  it('Single: `${block.id}.${key}`', () => {
    expect(collectAssetUsages(single([imageBlock('hero-1', 'bg', 'asset-a')]), testLibrary)).toEqual([
      { assetId: 'asset-a', slotKey: 'hero-1.bg' },
    ]);
  });

  it('Multi: page blocks use `${page.id}...`, shared use `shared.${slot}...`', () => {
    const multi: MultiContent = {
      mode: 'multi',
      templateKey: 'corporate-multipage',
      globalStyles,
      chrome: {
        header: [imageBlock('nav-1', 'logo', 'asset-h')],
        footer: [imageBlock('foot-1', 'badge', 'asset-f')],
      },
      pages: [
        {
          id: 'page-home',
          slug: 'home',
          visible: true,
          name: 'Home',
          menu: { label: 'Home' },
          blocks: [imageBlock('hero-1', 'bg', 'asset-p')],
        },
      ],
    };

    const usages = collectAssetUsages(multi, testLibrary);

    // Shared header/footer are traversed (belong to no page) — not mis-swept.
    expect(usages).toContainEqual({ assetId: 'asset-h', slotKey: 'chrome.header.nav-1.logo' });
    expect(usages).toContainEqual({ assetId: 'asset-f', slotKey: 'chrome.footer.foot-1.badge' });
    // Page blocks keyed by page id.
    expect(usages).toContainEqual({ assetId: 'asset-p', slotKey: 'page-home.hero-1.bg' });
    expect(usages).toHaveLength(3);
  });
});

// ── Array recursion — PR #126's contract, unchanged by the schema-driven walk ─

describe('collectAssetUsages — arrays (#126 regression contract)', () => {
  const galleryBlock = (id: string, items: Array<{ id: string; assetId: string }>) =>
    block(id, 'gallery', {
      photos: items.map(({ id: itemId, assetId }) => ({
        id: itemId,
        fields: { caption: 'x', image: { url: 'https://cdn/a.jpg', assetId } },
      })),
    });

  it('images inside array items are collected, keyed by `item.id`', () => {
    const content = single([
      galleryBlock('menu-1', [
        { id: 'item-a', assetId: 'asset-1' },
        { id: 'item-b', assetId: 'asset-2' },
      ]),
    ]);

    expect(collectAssetUsages(content, testLibrary)).toEqual([
      { assetId: 'asset-1', slotKey: 'menu-1.photos[item-a].image' },
      { assetId: 'asset-2', slotKey: 'menu-1.photos[item-b].image' },
    ]);
  });

  it('slotKeys survive a reorder — an index would have swapped them (ADR-0016 §4-4)', () => {
    const before = collectAssetUsages(
      single([
        galleryBlock('menu-1', [
          { id: 'item-a', assetId: 'asset-1' },
          { id: 'item-b', assetId: 'asset-2' },
        ]),
      ]),
      testLibrary,
    );
    const after = collectAssetUsages(
      single([
        galleryBlock('menu-1', [
          { id: 'item-b', assetId: 'asset-2' },
          { id: 'item-a', assetId: 'asset-1' },
        ]),
      ]),
      testLibrary,
    );

    // Same pairs, only the emission order differs — no slot key moved to another asset.
    expect([...after].sort((a, b) => a.slotKey.localeCompare(b.slotKey))).toEqual(
      [...before].sort((a, b) => a.slotKey.localeCompare(b.slotKey)),
    );
  });

  it('array items are traversed in Multi pages and shared header/footer too', () => {
    const multi: MultiContent = {
      mode: 'multi',
      templateKey: 'corporate-multipage',
      globalStyles,
      chrome: {
        header: [galleryBlock('head-1', [{ id: 'i1', assetId: 'asset-h' }])],
        footer: [],
      },
      pages: [
        {
          id: 'page-home',
          slug: 'home',
          visible: true,
          name: 'Home',
          menu: { label: 'Home' },
          blocks: [galleryBlock('gal-1', [{ id: 'i2', assetId: 'asset-p' }])],
        },
      ],
    };

    const usages = collectAssetUsages(multi, testLibrary);
    expect(usages).toContainEqual({
      assetId: 'asset-h',
      slotKey: 'chrome.header.head-1.photos[i1].image',
    });
    expect(usages).toContainEqual({
      assetId: 'asset-p',
      slotKey: 'page-home.gal-1.photos[i2].image',
    });
    expect(usages).toHaveLength(2);
  });

  it('array items nested inside array items are traversed', () => {
    const content = single([
      block('s1', 'nested', {
        groups: [
          {
            id: 'g1',
            fields: {
              rows: [{ id: 'r1', fields: { pic: { url: 'https://cdn/n.jpg', assetId: 'asset-n' } } }],
            },
          },
        ],
      }),
    ]);

    expect(collectAssetUsages(content, testLibrary)).toEqual([
      { assetId: 'asset-n', slotKey: 's1.groups[g1].rows[r1].pic' },
    ]);
  });

  it('ignores array-item images that carry no assetId', () => {
    const content = single([
      block('s1', 'gallery', {
        photos: [{ id: 'i1', fields: { image: { url: 'https://cdn/c.jpg' } } }],
      }),
    ]);

    expect(collectAssetUsages(content, testLibrary)).toEqual([]);
  });
});

// ── Shapes the walk must survive ─────────────────────────────────────────────

describe('collectAssetUsages — tolerated shapes', () => {
  it('ignores non-image fields and images without an assetId', () => {
    const content = single([
      block('s1', 'hero', {
        title: 'hi',
        bg: { url: 'https://cdn/y.jpg' }, // no assetId
        logo: { url: 'https://cdn/z.jpg', assetId: null }, // explicitly cleared
      }),
    ]);
    expect(collectAssetUsages(content, testLibrary)).toEqual([]);
  });

  it('a stored key the schema does not declare cannot derail the keys it does', () => {
    // `UNKNOWN_DATA_FIELD` — content orphaned by a dropped field. The renderer
    // never reads it, so nothing addresses the asset behind it and the sweep
    // reclaiming it is correct; what must not happen is the sibling being lost.
    const content = single([
      block('s1', 'hero', {
        bg: { url: 'https://cdn/y.jpg', assetId: 'asset-live' },
        legacyHeader: { url: 'https://cdn/old.jpg', assetId: 'asset-orphan' },
      }),
    ]);
    expect(collectAssetUsages(content, testLibrary)).toEqual([
      { assetId: 'asset-live', slotKey: 's1.bg' },
    ]);
  });

  it('survives Values whose shape contradicts the schema', () => {
    // Every one of these is a blocking `FIELD_VALUE_TYPE_MISMATCH`, so the save
    // path never reaches the collector with them — it just must not throw.
    const content = single([
      block('s1', 'hero', { bg: 'https://cdn/plain-string.jpg' }),
      block('s2', 'gallery', { photos: { url: 'not-an-array' } }),
      block('s3', 'gallery', { photos: ['not-an-item', { id: 'i1' }] }),
    ]);
    expect(collectAssetUsages(content, testLibrary)).toEqual([]);
  });

  it('a Block whose type is not in the library contributes nothing', () => {
    const content = single([
      block('s1', 'removed-component', { bg: { url: 'https://cdn/y.jpg', assetId: 'asset-x' } }),
    ]);
    expect(collectAssetUsages(content, testLibrary)).toEqual([]);
  });

  it('no library — collects nothing rather than throwing', () => {
    expect(collectAssetUsages(single([imageBlock('hero-1', 'bg', 'asset-a')]), undefined)).toEqual([]);
  });
});

// ── The port adapter (#128) ──────────────────────────────────────────────────

describe('ContentAssetUsageCollector', () => {
  it('resolves the library from the content templateKey and walks it', async () => {
    const content = single([imageBlock('hero-1', 'bg', 'asset-a')]);

    await expect(new ContentAssetUsageCollector().collect(content)).resolves.toEqual([
      { assetId: 'asset-a', slotKey: 'hero-1.bg' },
    ]);
    expect(loadTemplate).toHaveBeenCalledWith('cafe-default');
  });

  it('an unknown templateKey yields no usages (the save that carried it is already rejected)', async () => {
    const content = { ...single([imageBlock('hero-1', 'bg', 'asset-a')]), templateKey: 'nope' };

    await expect(new ContentAssetUsageCollector().collect(content)).resolves.toEqual([]);
  });
});
