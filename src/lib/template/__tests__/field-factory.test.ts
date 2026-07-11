import { describe, it, expect } from 'vitest';
import { makeEmptyItem } from '../field-factory';
import { SectionFieldsSchema } from '@/templates/types';
import { TextField, SelectField, ImageField, ArrayField } from '@/domain/entities/template.entity';

describe('makeEmptyItem', () => {
  it('always stamps an editor _key (non-editable text field with a random value)', () => {
    const out = makeEmptyItem({});
    expect(out._key).toBeDefined();
    const key = out._key as TextField;
    expect(key.type).toBe('text');
    expect(key.editable).toBe(false);
    expect(typeof key.value).toBe('string');
    expect(key.value.length).toBeGreaterThan(0);
  });

  it('gives distinct _key values across calls', () => {
    const a = makeEmptyItem({}) as { _key: TextField };
    const b = makeEmptyItem({}) as { _key: TextField };
    expect(a._key.value).not.toBe(b._key.value);
  });

  it('builds empty scalar fields for text/textarea/url/color/number', () => {
    const schema: SectionFieldsSchema = {
      a: { type: 'text', label: 'A' },
      b: { type: 'textarea', label: 'B' },
      c: { type: 'url', label: 'C' },
      d: { type: 'color', label: 'D' },
      e: { type: 'number', label: 'E' },
    };
    const out = makeEmptyItem(schema);
    for (const key of ['a', 'b', 'c', 'd', 'e']) {
      const f = out[key] as TextField;
      expect(f.value).toBe('');
    }
    expect(out.a.type).toBe('text');
    expect(out.e.type).toBe('number');
  });

  it('builds an empty image field', () => {
    const out = makeEmptyItem({ img: { type: 'image', label: 'Img' } });
    const f = out.img as ImageField;
    expect(f.type).toBe('image');
    expect(f.value).toBe('');
  });

  it('defaults a select field to its first option', () => {
    const out = makeEmptyItem({ pick: { type: 'select', label: 'Pick', options: ['x', 'y', 'z'] } });
    const f = out.pick as SelectField;
    expect(f.type).toBe('select');
    expect(f.value).toBe('x');
    expect(f.options).toEqual(['x', 'y', 'z']);
  });

  it('defaults a select field with no options to an empty value', () => {
    const out = makeEmptyItem({ pick: { type: 'select', label: 'Pick' } });
    const f = out.pick as SelectField;
    expect(f.value).toBe('');
    expect(f.options).toEqual([]);
  });

  it('builds a nested array field as an empty list', () => {
    const out = makeEmptyItem({
      rows: { type: 'array', label: 'Rows', itemSchema: { name: { type: 'text', label: 'Name' } } },
    });
    const f = out.rows as ArrayField;
    expect(f.type).toBe('array');
    expect(f.items).toEqual([]);
  });
});
