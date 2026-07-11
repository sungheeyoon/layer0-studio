import { describe, it, expect } from 'vitest';
import {
  writeField,
  setFieldValue,
  setItemFieldAt,
  addItem,
  removeItemAt,
  moveItemAt,
  canAddItem,
  canRemoveItem,
  type FieldItem,
} from '../entities/field-edit';
import {
  ContentModel,
  SingleContent,
  MultiContent,
  Field,
  TextField,
  ImageField,
  ArrayField,
} from '../entities/template.entity';

// ── Fixtures ─────────────────────────────────────────────────────────────────

const text = (value: string): TextField => ({ type: 'text', label: 'T', value });
const image = (value: string, assetId?: string | null): ImageField => ({
  type: 'image',
  label: 'Img',
  value,
  ...(assetId !== undefined ? { assetId } : {}),
});
const item = (fields: Record<string, Field>): FieldItem => fields;

const arrayField = (items: FieldItem[]): ArrayField => ({ type: 'array', label: 'List', items });

function makeSingle(): SingleContent {
  return {
    mode: 'single',
    templateKey: 'corporate-default',
    globalStyles: {
      primaryColor: '#000', secondaryColor: '#fff',
      fontFamily: 'sans-serif', fontSize: '16px', layout: 'default',
    },
    sections: [
      {
        id: 'hero', type: 'hero', visible: true, nav: { visible: false, label: 'Hero' },
        fields: {
          title: text('Hello'),
          logo: image('a.png', 'asset-a'),
          menu: arrayField([item({ name: text('Coffee') })]),
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
      primaryColor: '#000', secondaryColor: '#fff',
      fontFamily: 'sans-serif', fontSize: '16px', layout: 'default',
    },
    shared: {
      header: [{ id: 'nav', type: 'nav', visible: true, fields: { brand: text('Acme') } }],
      footer: [],
    },
    pages: [
      {
        id: 'home', slug: '', visible: true, nav: { visible: true, label: 'Home' },
        sections: [{ id: 'body', type: 'hero', visible: true, fields: { title: text('Home') } }],
      },
    ],
  };
}

// ── writeField (the shared primitive) ────────────────────────────────────────

describe('writeField', () => {
  it('sets a scalar value on a text field', () => {
    const f = text('old');
    writeField(f, 'new');
    expect(f.value).toBe('new');
  });

  it('stamps assetId on an image field', () => {
    const f = image('old.png', null);
    writeField(f, 'new.png', 'asset-1');
    expect(f.value).toBe('new.png');
    expect(f.assetId).toBe('asset-1');
  });

  it('does not stamp assetId on a non-image field', () => {
    const f = text('x');
    writeField(f, 'y', 'asset-1');
    expect(f.value).toBe('y');
    expect((f as TextField & { assetId?: string }).assetId).toBeUndefined();
  });

  it('replaces items on an array field', () => {
    const f = arrayField([item({ a: text('1') })]);
    const next = [item({ a: text('2') })];
    writeField(f, next);
    expect(f.items).toBe(next);
  });

  it('is a no-op when a string is aimed at an array field', () => {
    const f = arrayField([item({ a: text('1') })]);
    writeField(f, 'oops');
    expect(f.items).toHaveLength(1);
  });

  it('is a no-op when array items are aimed at a scalar field', () => {
    const f = text('keep');
    writeField(f, [item({ a: text('x') })]);
    expect(f.value).toBe('keep');
  });
});

// ── setFieldValue (json tier, both modes) ────────────────────────────────────

describe('setFieldValue', () => {
  it('writes a field on a Single section', () => {
    const json = makeSingle();
    setFieldValue(json, 'hero', 'title', 'Changed');
    expect((json.sections[0].fields.title as TextField).value).toBe('Changed');
  });

  it('writes a field on a Multi shared section', () => {
    const json = makeMulti();
    setFieldValue(json, 'nav', 'brand', 'NewBrand');
    expect((json.shared.header[0].fields.brand as TextField).value).toBe('NewBrand');
  });

  it('writes a field on a Multi page section', () => {
    const json = makeMulti();
    setFieldValue(json, 'body', 'title', 'NewTitle');
    expect((json.pages[0].sections[0].fields.title as TextField).value).toBe('NewTitle');
  });

  it('stamps assetId on an image field via the json tier', () => {
    const json = makeSingle();
    setFieldValue(json, 'hero', 'logo', 'b.png', 'asset-b');
    const logo = json.sections[0].fields.logo as ImageField;
    expect(logo.value).toBe('b.png');
    expect(logo.assetId).toBe('asset-b');
  });

  it('is a no-op for an unknown section', () => {
    const json = makeSingle();
    setFieldValue(json, 'missing', 'title', 'X');
    expect((json.sections[0].fields.title as TextField).value).toBe('Hello');
  });

  it('is a no-op for an unknown field', () => {
    const json = makeSingle();
    setFieldValue(json, 'hero', 'nope', 'X');
    expect(json.sections[0].fields.nope).toBeUndefined();
  });
});

// ── items tier: setItemFieldAt / add / remove / move ─────────────────────────

describe('array item ops', () => {
  const base = (): FieldItem[] => [
    item({ name: text('A') }),
    item({ name: text('B') }),
    item({ name: text('C') }),
  ];

  describe('setItemFieldAt', () => {
    it('writes a field on the item at index, returning a new array', () => {
      const items = base();
      const next = setItemFieldAt(items, 1, 'name', 'B2');
      expect(next).not.toBe(items);
      expect((next[1].name as TextField).value).toBe('B2');
      expect((items[1].name as TextField).value).toBe('B'); // original untouched
    });

    it('returns the same reference on an out-of-range index', () => {
      const items = base();
      expect(setItemFieldAt(items, 9, 'name', 'X')).toBe(items);
    });
  });

  describe('addItem', () => {
    it('appends, returning a new array', () => {
      const items = base();
      const next = addItem(items, item({ name: text('D') }));
      expect(next).toHaveLength(4);
      expect(items).toHaveLength(3);
      expect((next[3].name as TextField).value).toBe('D');
    });
  });

  describe('removeItemAt', () => {
    it('removes at index', () => {
      const next = removeItemAt(base(), 1);
      expect(next.map((i) => (i.name as TextField).value)).toEqual(['A', 'C']);
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
      expect(next.map((i) => (i.name as TextField).value)).toEqual(['B', 'A', 'C']);
    });

    it('moves down', () => {
      const next = moveItemAt(base(), 1, 'down');
      expect(next.map((i) => (i.name as TextField).value)).toEqual(['A', 'C', 'B']);
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
  const two: FieldItem[] = [item({}), item({})];

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

// Guard: ContentModel union stays assignable through the json tier.
const _single: ContentModel = makeSingle();
const _multi: ContentModel = makeMulti();
void _single;
void _multi;
