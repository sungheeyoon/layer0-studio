import { describe, it, expect } from 'vitest';
import {
  setFieldValue,
  setItemFieldAt,
  addItem,
  removeItemAt,
  moveItemAt,
  canAddItem,
  canRemoveItem,
  coerceNumberInput,
  type EditableItem,
} from '../entities/field-edit';
import {
  ContentModel,
  ImageValue,
  SingleContent,
  MultiContent,
} from '../entities/template.entity';

// ── Fixtures ─────────────────────────────────────────────────────────────────
//
// `fields` hold Values (ADR-0016 §4): a bare string, an `ImageValue`, an array
// of `{ id, fields }`. No `{type,label,value}` wrapper anywhere — that shape is
// what this module stopped writing.

const item = (id: string, fields: Record<string, unknown>): EditableItem => ({ id, fields });

function makeSingle(): SingleContent {
  return {
    mode: 'single',
    templateKey: 'corporate-default',
    globalStyles: {
      primaryColor: '#000', secondaryColor: '#fff', backgroundColor: '#fff',
      fontFamily: 'sans-serif', fontSize: '16px', layout: 'default',
    },
    sections: [
      {
        id: 'hero', type: 'hero', visible: true, nav: { visible: false, label: 'Hero' },
        fields: {
          title: 'Hello',
          logo: { url: 'a.png', assetId: 'asset-a' } satisfies ImageValue,
          menu: [item('itm-a', { name: 'Coffee' })],
        },
      },
    ],
  };
}

function makeMulti(): MultiContent {
  return {
    mode: 'multi',
    templateKey: 'outdoor-default',
    globalStyles: {
      primaryColor: '#000', secondaryColor: '#fff', backgroundColor: '#fff',
      fontFamily: 'sans-serif', fontSize: '16px', layout: 'default',
    },
    shared: {
      header: [{ id: 'nav', type: 'nav', visible: true, fields: { brand: 'Acme' } }],
      footer: [],
    },
    pages: [
      {
        id: 'home', slug: '', visible: true, nav: { visible: true, label: 'Home' },
        sections: [{ id: 'body', type: 'hero', visible: true, fields: { title: 'Home' } }],
      },
    ],
  };
}

// ── setFieldValue (json tier, both modes) ────────────────────────────────────

describe('setFieldValue', () => {
  it('writes a Value on a Single section', () => {
    const json = makeSingle();
    setFieldValue(json, 'hero', 'title', 'Changed');
    expect(json.sections[0].fields.title).toBe('Changed');
  });

  it('writes a Value on a Multi shared section', () => {
    const json = makeMulti();
    setFieldValue(json, 'nav', 'brand', 'NewBrand');
    expect(json.shared.header[0].fields.brand).toBe('NewBrand');
  });

  it('writes a Value on a Multi page section', () => {
    const json = makeMulti();
    setFieldValue(json, 'body', 'title', 'NewTitle');
    expect(json.pages[0].sections[0].fields.title).toBe('NewTitle');
  });

  it('replaces an image Value whole — url and assetId travel together', () => {
    const json = makeSingle();
    setFieldValue(json, 'hero', 'logo', { url: 'b.png', assetId: 'asset-b' });
    expect(json.sections[0].fields.logo).toEqual({ url: 'b.png', assetId: 'asset-b' });
  });

  it('replaces array items whole', () => {
    const json = makeSingle();
    const next = [item('itm-b', { name: 'Tea' })];
    setFieldValue(json, 'hero', 'menu', next);
    expect(json.sections[0].fields.menu).toEqual(next);
  });

  // The pre-ADR-0016 version skipped a key that was not already present, because
  // every editable field existed in the data as a Field object. An optional
  // field with no Value stored has no such placeholder, so the first edit of one
  // is always a write to an absent key.
  it('creates a key that is not yet stored', () => {
    const json = makeSingle();
    setFieldValue(json, 'hero', 'eyebrow', 'New');
    expect(json.sections[0].fields.eyebrow).toBe('New');
  });

  it('is a no-op for an unknown section', () => {
    const json = makeSingle();
    setFieldValue(json, 'missing', 'title', 'X');
    expect(json.sections[0].fields.title).toBe('Hello');
  });
});

// ── items tier: setItemFieldAt / add / remove / move ─────────────────────────

describe('array item ops', () => {
  const base = (): EditableItem[] => [
    item('id-a', { name: 'A' }),
    item('id-b', { name: 'B' }),
    item('id-c', { name: 'C' }),
  ];

  describe('setItemFieldAt', () => {
    it('writes a Value into the item at index, returning a new array', () => {
      const items = base();
      const next = setItemFieldAt(items, 1, 'name', 'B2');
      expect(next).not.toBe(items);
      expect(next[1].fields.name).toBe('B2');
      expect(items[1].fields.name).toBe('B'); // original untouched
    });

    it('leaves the item id alone', () => {
      const next = setItemFieldAt(base(), 1, 'name', 'B2');
      expect(next[1].id).toBe('id-b');
    });

    it('returns the same reference on an out-of-range index', () => {
      const items = base();
      expect(setItemFieldAt(items, 9, 'name', 'X')).toBe(items);
    });
  });

  describe('addItem', () => {
    it('appends, returning a new array', () => {
      const items = base();
      const next = addItem(items, item('id-d', { name: 'D' }));
      expect(next).toHaveLength(4);
      expect(items).toHaveLength(3);
      expect(next[3].fields.name).toBe('D');
    });
  });

  describe('removeItemAt', () => {
    it('removes at index', () => {
      const next = removeItemAt(base(), 1);
      expect(next.map((i) => i.id)).toEqual(['id-a', 'id-c']);
    });

    it('returns the same reference on an out-of-range index', () => {
      const items = base();
      expect(removeItemAt(items, 9)).toBe(items);
      expect(removeItemAt(items, -1)).toBe(items);
    });
  });

  describe('moveItemAt', () => {
    it('moves up', () => {
      const next = moveItemAt(base(), 1, 'up');
      expect(next.map((i) => i.fields.name)).toEqual(['B', 'A', 'C']);
    });

    it('moves down', () => {
      const next = moveItemAt(base(), 1, 'down');
      expect(next.map((i) => i.fields.name)).toEqual(['A', 'C', 'B']);
    });

    // The invariant the asset `slot_key` rests on (ADR-0016 §4-4 rule 6): the
    // key is `…[${item.id}].${subKey}`, so an id that stayed with the *position*
    // instead of the item would silently repoint one item's asset usage at
    // another's after a reorder.
    it('carries each id with its own item, never with the position', () => {
      const next = moveItemAt(base(), 1, 'up');
      expect(next.map((i) => i.id)).toEqual(['id-b', 'id-a', 'id-c']);
      expect(next.map((i) => `${i.id}:${i.fields.name}`)).toEqual([
        'id-b:B', 'id-a:A', 'id-c:C',
      ]);
    });

    it('returns the same reference at the top boundary', () => {
      const items = base();
      expect(moveItemAt(items, 0, 'up')).toBe(items);
    });

    it('returns the same reference at the bottom boundary', () => {
      const items = base();
      expect(moveItemAt(items, 2, 'down')).toBe(items);
    });

    it('returns the same reference on an out-of-range index', () => {
      const items = base();
      expect(moveItemAt(items, 9, 'up')).toBe(items);
    });
  });
});

// ── predicates ───────────────────────────────────────────────────────────────

describe('canAddItem / canRemoveItem', () => {
  const two: EditableItem[] = [item('a', {}), item('b', {})];

  it('canAddItem: no max → always allowed', () => {
    expect(canAddItem(two)).toBe(true);
  });
  it('canAddItem: below max → allowed, at max → blocked', () => {
    expect(canAddItem(two, 3)).toBe(true);
    expect(canAddItem(two, 2)).toBe(false);
  });
  it('canRemoveItem: no min → always allowed', () => {
    expect(canRemoveItem(two)).toBe(true);
  });
  it('canRemoveItem: above min → allowed, at min → blocked', () => {
    expect(canRemoveItem(two, 1)).toBe(true);
    expect(canRemoveItem(two, 2)).toBe(false);
  });
});

// ── number coercion at the editor boundary (ADR-0016 §4-3) ───────────────────

describe('coerceNumberInput', () => {
  it('parses a numeric string', () => {
    expect(coerceNumberInput('12', 3)).toBe(12);
    expect(coerceNumberInput('-4.5', 3)).toBe(-4.5);
  });

  it('resets an emptied input to the descriptor default', () => {
    expect(coerceNumberInput('', 3)).toBe(3);
    expect(coerceNumberInput('   ', 3)).toBe(3);
  });

  it('resets anything non-finite to the default, so no NaN reaches the content', () => {
    expect(coerceNumberInput('abc', 3)).toBe(3);
    expect(coerceNumberInput('Infinity', 3)).toBe(3);
    expect(Number.isFinite(coerceNumberInput('1e999', 3))).toBe(true);
  });
});

// Guard: ContentModel union stays assignable through the json tier.
const _single: ContentModel = makeSingle();
const _multi: ContentModel = makeMulti();
void _single;
void _multi;
