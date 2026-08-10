import { describe, it, expect } from 'vitest';
import { emptyValue, makeEmptyItem } from '../field-factory';
import { FieldsSchema, ImageValue } from '@/domain/entities/template.entity';

/** ADR-0016 §4-4 invariant 1: ids are `crypto.randomUUID()`. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('makeEmptyItem', () => {
  it('stamps a UUID id beside fields, not inside them', () => {
    const out = makeEmptyItem({ a: { type: 'text', label: 'A' } });

    expect(out.id).toMatch(UUID_RE);
    // The id is a sibling of `fields` (ADR-0016 §4-3) — `itemSchema` describes
    // only editable keys, so nothing puts an `id` descriptor in there.
    expect(out.fields.id).toBeUndefined();
    expect(Object.keys(out.fields)).toEqual(['a']);
  });

  it('gives distinct ids across calls', () => {
    expect(makeEmptyItem({}).id).not.toBe(makeEmptyItem({}).id);
  });

  it('builds empty string Values for text/textarea/url/color', () => {
    const schema: FieldsSchema = {
      a: { type: 'text', label: 'A' },
      b: { type: 'textarea', label: 'B' },
      c: { type: 'url', label: 'C' },
      d: { type: 'color', label: 'D' },
    };
    const { fields } = makeEmptyItem(schema);
    expect(fields).toEqual({ a: '', b: '', c: '', d: '' });
  });

  it('seeds a number Value from the descriptor default, not from zero', () => {
    // `default` is mandatory on a number descriptor (ADR-0016 §4-3): it is both
    // the seed here and what the editor resets an emptied input to.
    const { fields } = makeEmptyItem({ n: { type: 'number', label: 'N', default: 3 } });
    expect(fields.n).toBe(3);
  });

  it('builds an image Value as an object with an empty url', () => {
    const { fields } = makeEmptyItem({ img: { type: 'image', label: 'Img' } });
    // ImageValue stays an object because `assetId` is real content (ADR-0016 §4-3).
    expect(fields.img).toEqual({ url: '' });
  });

  it('defaults a select Value to its first option', () => {
    const { fields } = makeEmptyItem({
      pick: { type: 'select', label: 'Pick', options: ['x', 'y', 'z'] },
    });
    // The Value is the bare chosen string — the `options` copy the old
    // SelectField carried alongside it was the drift ADR-0016 §4 removes.
    expect(fields.pick).toBe('x');
  });

  // ADR-0016 §4-1 made `options` mandatory on a select descriptor, so *omitting*
  // it is now a compile error — but an empty array still satisfies
  // `readonly string[]`, so "a select with no options to choose from" is still
  // reachable and the `?? ''` still has to hold it.
  it('defaults a select with empty options to an empty string', () => {
    const { fields } = makeEmptyItem({ pick: { type: 'select', label: 'Pick', options: [] } });
    expect(fields.pick).toBe('');
  });

  it('builds a nested array Value as an empty list', () => {
    const { fields } = makeEmptyItem({
      rows: { type: 'array', label: 'Rows', itemSchema: { name: { type: 'text', label: 'Name' } } },
    });
    expect(fields.rows).toEqual([]);
  });
});

describe('emptyValue', () => {
  it('returns a fresh ImageValue per call, not a shared one', () => {
    const a = emptyValue({ type: 'image', label: 'Img' }) as ImageValue;
    const b = emptyValue({ type: 'image', label: 'Img' }) as ImageValue;
    a.url = 'https://cdn/x.png';
    expect(b.url).toBe('');
  });

  it('returns a fresh array per call, not a shared one', () => {
    const a = emptyValue({ type: 'array', label: 'L', itemSchema: {} }) as unknown[];
    const b = emptyValue({ type: 'array', label: 'L', itemSchema: {} }) as unknown[];
    a.push('x');
    expect(b).toEqual([]);
  });
});
