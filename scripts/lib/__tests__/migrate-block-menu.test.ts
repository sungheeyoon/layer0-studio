import { describe, expect, it, vi } from 'vitest';

import {
  executeBlockMenuMigration,
  migrateContentToBlockMenu,
  planBlockMenuMigration,
  type SourceRows,
} from '../migrate-block-menu';

const globalStyles = {
  primaryColor: '#000000',
  secondaryColor: '#ffffff',
  backgroundColor: '#ffffff',
  fontFamily: 'Inter',
  fontSize: '16px',
  layout: 'wide',
};

const singleLegacy = {
  mode: 'single',
  templateKey: 'cafe-default',
  globalStyles,
  sections: [
    { id: 'hero', type: 'hero', visible: true, nav: { visible: true, label: '홈' }, fields: {} },
    { id: 'story', type: 'story', visible: true, nav: { visible: false, label: '소개' }, fields: {} },
  ],
};

const multiLegacy = {
  mode: 'multi',
  templateKey: 'outdoor-default',
  globalStyles,
  shared: {
    header: [{ id: 'nav', type: 'nav', visible: true, fields: {} }],
    footer: [{ id: 'footer', type: 'footer', visible: true, fields: {} }],
  },
  pages: [
    {
      id: 'home', slug: 'home', visible: true,
      nav: { visible: true, label: '홈' },
      sections: [{ id: 'hero', type: 'hero', visible: true, fields: {} }],
    },
    {
      id: 'privacy', slug: 'privacy', visible: true,
      nav: { visible: false, label: '개인정보' },
      sections: [{ id: 'legal', type: 'text', visible: true, fields: {} }],
    },
  ],
};

describe('migrateContentToBlockMenu', () => {
  it('renames Single sections and converts nav presence to menu presence', () => {
    const result = migrateContentToBlockMenu(singleLegacy);
    expect(result.status).toBe('migrated');
    expect(result.content).toEqual({
      mode: 'single',
      templateKey: 'cafe-default',
      globalStyles,
      blocks: [
        { id: 'hero', type: 'hero', visible: true, menu: { label: '홈' }, fields: {} },
        { id: 'story', type: 'story', visible: true, fields: {} },
      ],
    });
  });

  it('renames Multi shared/page sections and preserves footer links explicitly', () => {
    const result = migrateContentToBlockMenu(multiLegacy);
    expect(result.content).toEqual({
      mode: 'multi',
      templateKey: 'outdoor-default',
      globalStyles,
      chrome: {
        header: [{ id: 'nav', type: 'nav', visible: true, fields: {} }],
        footer: [{ id: 'footer', type: 'footer', visible: true, fields: {} }],
      },
      pages: [
        {
          id: 'home', slug: 'home', visible: true, name: '홈', menu: { label: '홈' },
          blocks: [{ id: 'hero', type: 'hero', visible: true, fields: {} }],
        },
        {
          id: 'privacy', slug: 'privacy', visible: true, name: '개인정보',
          menu: { label: '개인정보', placement: 'footer' },
          blocks: [{ id: 'legal', type: 'text', visible: true, fields: {} }],
        },
      ],
    });
  });

  it('is idempotent and preserves already-authored menu-none Multi pages', () => {
    const once = migrateContentToBlockMenu(multiLegacy);
    const current = structuredClone(once.content) as Record<string, unknown>;
    const pages = current.pages as Array<Record<string, unknown>>;
    delete pages[0].menu;

    const twice = migrateContentToBlockMenu(current);
    expect(twice.status).toBe('unchanged');
    expect(twice.content).toEqual(current);
  });

  it('leaves an unrecognised payload untouched', () => {
    const input = { hello: 'world' };
    const result = migrateContentToBlockMenu(input);
    expect(result.status).toBe('skipped-shape');
    expect(result.content).toBe(input);
  });
});

describe('migration plan and execution', () => {
  const rows: SourceRows = {
    templates: [{ id: 't1', slug: 'cafe-default', content: singleLegacy }],
    userSites: [{ id: 's1', siteName: 'Site', content: singleLegacy, snapshot: multiLegacy }],
  };

  it('plans all three stored columns and validates before writing', () => {
    const validate = vi.fn(() => []);
    const plan = planBlockMenuMigration(rows, { validate });
    expect(plan.ok).toBe(true);
    expect(plan.stats).toMatchObject({ templateRows: 1, userSiteRows: 1, columns: 3, columnsChanged: 3 });
    expect(validate).toHaveBeenCalledTimes(3);
    expect(plan.payload.templates).toHaveLength(1);
    expect(plan.payload.userSites).toHaveLength(1);
  });

  it('never calls the writer when any transformed payload fails validation', async () => {
    const writer = vi.fn();
    const result = await executeBlockMenuMigration(rows, {
      validate: (content) => content.mode === 'multi'
        ? [{ code: 'TEST', message: 'invalid', path: 'pages' }]
        : [],
    }, writer);
    expect(result.written).toBe(false);
    expect(writer).not.toHaveBeenCalled();
  });

  it('writes the complete payload exactly once after all validation passes', async () => {
    const writer = vi.fn();
    const result = await executeBlockMenuMigration(rows, { validate: () => [] }, writer);
    expect(result.written).toBe(true);
    expect(writer).toHaveBeenCalledTimes(1);
    expect(writer).toHaveBeenCalledWith(result.plan.payload);
  });
});
