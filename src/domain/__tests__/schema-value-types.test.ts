import { describe, it, expect } from 'vitest';
import type {
  FieldsSchema,
  ValuesOf,
  ImageValue,
} from '@/domain/entities/template.entity';

/**
 * ADR-0016 §4-1 — compile-time contract for the schema-first model.
 *
 * The assertions that matter here are the `@ts-expect-error` lines: each one
 * fails the build (`pnpm tsc --noEmit`) if the guarantee it pins stops holding.
 * Vitest runs the file too, but the real gate is the type-checker — a stray
 * `@ts-expect-error` that no longer suppresses anything is itself an error.
 *
 * This exists because the *previous* design (a hand-written Content interface
 * plus `satisfies BlockFieldsSchema<T>`) claimed these guarantees and had
 * almost none of them: `text|textarea|url|color|select` are all `string` at
 * runtime, so the mapped type could not tell them apart.
 */

const menuSchema = {
  eyebrow: { type: 'text', label: '섹션 라벨' },
  title: { type: 'textarea', label: '섹션 타이틀', required: true },
  tone: { type: 'select', label: '톤', options: ['light', 'dark'], required: true },
  columns: { type: 'number', label: '열 수', default: 3, required: true },
  hero: { type: 'image', label: '대표 이미지' },
  items: {
    type: 'array',
    label: '메뉴 항목',
    required: true,
    minItems: 1,
    itemSchema: {
      title: { type: 'text', label: '제목', required: true },
      price: { type: 'text', label: '가격' },
      image: { type: 'image', label: '이미지' },
    },
  },
} as const satisfies FieldsSchema;

type MenuContent = ValuesOf<typeof menuSchema>;

describe('ValuesOf — schema drives the Value type', () => {
  it('the schema survives as a runtime value the editor can read', () => {
    // `as const` must not erase the object — the editor renders inputs from it.
    expect(menuSchema.title.type).toBe('textarea');
    expect(menuSchema.tone.options).toEqual(['light', 'dark']);
    expect(menuSchema.columns.default).toBe(3);
    expect(Object.keys(menuSchema.items.itemSchema)).toEqual(['title', 'price', 'image']);
  });

  it('accepts a well-formed Content', () => {
    const content: MenuContent = {
      title: '오늘의 메뉴',
      tone: 'dark',
      columns: 3,
      items: [{ id: 'i1', fields: { title: '라떼' } }],
    };
    expect(content.items).toHaveLength(1);
  });

  it('narrows select to the options literal union', () => {
    const tone: MenuContent['tone'] = 'light';
    // @ts-expect-error 'blue' is not in options
    const bad: MenuContent['tone'] = 'blue';
    expect([tone, bad]).toBeTruthy();
  });

  it('types number as a real number, not a string', () => {
    const n: MenuContent['columns'] = 3;
    // @ts-expect-error columns is number
    const bad: MenuContent['columns'] = '3';
    expect([n, bad]).toBeTruthy();
  });

  it('maps image to ImageValue', () => {
    const img: ImageValue = { url: 'https://cdn/x.jpg', assetId: 'a1' };
    const content: MenuContent = {
      title: 't', tone: 'dark', columns: 1, items: [], hero: img,
    };
    expect(content.hero?.url).toBe('https://cdn/x.jpg');
  });

  it('required drives optionality — a required key cannot be omitted', () => {
    // @ts-expect-error `title` is required: true
    const missing: MenuContent = { tone: 'dark', columns: 1, items: [] };
    expect(missing).toBeTruthy();
  });

  it('optional keys may be omitted', () => {
    // `eyebrow` and `hero` are absent and that is fine.
    const content: MenuContent = { title: 't', tone: 'dark', columns: 1, items: [] };
    expect(content.eyebrow).toBeUndefined();
  });

  it('array items carry `id` beside `fields`, and recurse into itemSchema', () => {
    const content: MenuContent = {
      title: 't', tone: 'dark', columns: 1,
      items: [{ id: 'i1', fields: { title: '라떼', price: '6500' } }],
    };
    expect(content.items[0].id).toBe('i1');
  });

  it('array item required keys are enforced recursively', () => {
    const content: MenuContent = {
      title: 't', tone: 'dark', columns: 1,
      // @ts-expect-error item `title` is required: true
      items: [{ id: 'i1', fields: { price: '6500' } }],
    };
    expect(content).toBeTruthy();
  });

  it('array items require an id', () => {
    const content: MenuContent = {
      title: 't', tone: 'dark', columns: 1,
      // @ts-expect-error `id` is missing
      items: [{ fields: { title: '라떼' } }],
    };
    expect(content).toBeTruthy();
  });

  it('rejects a key the schema does not declare', () => {
    const content: MenuContent = {
      title: 't', tone: 'dark', columns: 1, items: [],
      // @ts-expect-error `subtitle` is not in the schema
      subtitle: 'nope',
    };
    expect(content).toBeTruthy();
  });
});

describe('FieldsSchema — the descriptor itself is constrained', () => {
  it('requires `default` on a number descriptor', () => {
    const schema = {
      // @ts-expect-error number descriptors must carry `default`
      count: { type: 'number', label: '수' },
    } as const satisfies FieldsSchema;
    expect(schema).toBeTruthy();
  });

  it('requires `options` on a select descriptor', () => {
    const schema = {
      // @ts-expect-error select descriptors must carry `options`
      tone: { type: 'select', label: '톤' },
    } as const satisfies FieldsSchema;
    expect(schema).toBeTruthy();
  });

  it('requires `itemSchema` on an array descriptor', () => {
    const schema = {
      // @ts-expect-error array descriptors must carry `itemSchema`
      rows: { type: 'array', label: '행' },
    } as const satisfies FieldsSchema;
    expect(schema).toBeTruthy();
  });

  it('rejects an unknown field type', () => {
    const schema = {
      // @ts-expect-error 'richtext' is not a FieldType
      body: { type: 'richtext', label: '본문' },
    } as const satisfies FieldsSchema;
    expect(schema).toBeTruthy();
  });
});
