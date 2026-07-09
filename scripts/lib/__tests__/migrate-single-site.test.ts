import { describe, it, expect } from 'vitest';
import { migrateSingleSiteJson, type SeedNavMap } from '../migrate-single-site';
import { isSingleContent, getFieldValue, type Field } from '../../../src/domain/entities/template.entity';

const txt = (value: string): Field => ({ type: 'text', label: 'x', value, editable: true });

// Authoritative seed: nav hidden, hero hidden, menu+story visible (nav targets).
const seedNav: SeedNavMap = new Map([
  [
    'cafe-default',
    new Map([
      ['nav-001', { visible: false, label: '네비게이션' }],
      ['hero-001', { visible: false, label: 'Hero' }],
      ['menu-001', { visible: true, label: '메뉴' }],
      ['story-001', { visible: true, label: '카페 소개' }],
    ]),
  ],
]);

function legacy(menuOverrides: Record<string, string> = {}) {
  return {
    templateKey: 'cafe-default',
    globalStyles: { primaryColor: '#000', secondaryColor: '#fff', fontFamily: 'x', fontSize: '16px', layout: 'wide' },
    pages: [
      {
        id: 'home',
        title: 'Home',
        slug: 'home',
        sections: [
          {
            id: 'nav-001',
            type: 'nav',
            visible: true,
            editable: true,
            data: {
              brandName: txt('MONO'),
              menu1: txt(menuOverrides.menu1 ?? '메뉴'),
              menu2: txt(menuOverrides.menu2 ?? '카페 소개'),
              ctaText: txt('오시는 길'),
            },
          },
          { id: 'hero-001', type: 'hero', visible: true, editable: true, data: { label: txt('Hero kicker'), title: txt('t') } },
          { id: 'menu-001', type: 'menu', visible: true, editable: true, data: { label: txt('메뉴') } },
          { id: 'story-001', type: 'story', visible: false, editable: true, data: { label: txt('카페 소개') } },
        ],
      },
    ],
  };
}

describe('migrateSingleSiteJson', () => {
  it('flattens pages → mode:single and lifts sections', () => {
    const { status, json } = migrateSingleSiteJson(legacy(), seedNav);
    expect(status).toBe('migrated');
    expect(isSingleContent(json)).toBe(true);
    if (!isSingleContent(json)) throw new Error('unreachable');
    expect(json.templateKey).toBe('cafe-default');
    expect(json.sections).toHaveLength(4);
    expect('pages' in json).toBe(false);
  });

  it('renames data.label → data.eyebrow and drops section-level editable', () => {
    const { json } = migrateSingleSiteJson(legacy(), seedNav);
    if (!isSingleContent(json)) throw new Error('unreachable');
    const hero = json.sections.find((s) => s.id === 'hero-001')!;
    expect('label' in hero.data).toBe(false);
    expect(getFieldValue(hero.data, 'eyebrow')).toBe('Hero kicker');
    expect('editable' in hero).toBe(false);
  });

  it('strips menuN from the nav section data', () => {
    const { json } = migrateSingleSiteJson(legacy(), seedNav);
    if (!isSingleContent(json)) throw new Error('unreachable');
    const nav = json.sections.find((s) => s.id === 'nav-001')!;
    expect(Object.keys(nav.data)).toEqual(['brandName', 'ctaText']);
  });

  it('injects per-section nav from the seed by id, preserving section.visible independently', () => {
    const { json } = migrateSingleSiteJson(legacy(), seedNav);
    if (!isSingleContent(json)) throw new Error('unreachable');
    const story = json.sections.find((s) => s.id === 'story-001')!;
    expect(story.visible).toBe(false); // own visibility preserved
    expect(story.nav).toEqual({ visible: true, label: '카페 소개' }); // nav.visible independent
    const nav = json.sections.find((s) => s.id === 'nav-001')!;
    expect(nav.nav.visible).toBe(false);
  });

  it('preserves user-edited menu labels via order-zip onto nav targets', () => {
    const { json, notes } = migrateSingleSiteJson(legacy({ menu1: '음료', menu2: '우리 이야기' }), seedNav);
    if (!isSingleContent(json)) throw new Error('unreachable');
    expect(json.sections.find((s) => s.id === 'menu-001')!.nav.label).toBe('음료');
    expect(json.sections.find((s) => s.id === 'story-001')!.nav.label).toBe('우리 이야기');
    expect(notes.join(' ')).toContain('preserved 2');
  });

  it('falls back to visible:false + name-based label for sections absent from the seed', () => {
    const input = legacy();
    input.pages[0].sections.push({ id: 'extra-001', type: 'gallery', visible: true, editable: true, data: { label: txt('Gallery') } });
    const { json, notes } = migrateSingleSiteJson(input, seedNav);
    if (!isSingleContent(json)) throw new Error('unreachable');
    const extra = json.sections.find((s) => s.id === 'extra-001')!;
    expect(extra.nav).toEqual({ visible: false, label: 'Gallery' });
    expect(notes.length).toBe(0); // templateKey known, only the section is novel
  });

  it('is idempotent — already-migrated payloads are skipped', () => {
    const already = { mode: 'single', templateKey: 'cafe-default', globalStyles: {}, sections: [] };
    const { status, json } = migrateSingleSiteJson(already, seedNav);
    expect(status).toBe('skipped-already');
    expect(json).toBe(already);
  });

  it('skips unrecognised payloads (no pages array)', () => {
    expect(migrateSingleSiteJson({ foo: 'bar' }, seedNav).status).toBe('skipped-shape');
    expect(migrateSingleSiteJson(null, seedNav).status).toBe('skipped-shape');
  });

  it('derives nav for an unknown templateKey and notes it', () => {
    const input = { ...legacy(), templateKey: 'custom-xyz' };
    const { json, notes } = migrateSingleSiteJson(input, seedNav);
    if (!isSingleContent(json)) throw new Error('unreachable');
    expect(json.sections.every((s) => s.nav.visible === false)).toBe(true);
    expect(notes.join(' ')).toContain('not in code registry');
  });
});
