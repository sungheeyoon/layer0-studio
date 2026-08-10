// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Section } from '@/domain/entities/template.entity';
import type { FieldValue } from '@/domain/entities/field-edit';
import type { FieldsSchema } from '@/domain/entities/template.entity';

// ---------------------------------------------------------------------------
// ADR-0016 §4 — the editor edits Values.
//
// The thing under test is an inversion, not a rename: the input kind used to
// come from the *data* (`field.type`), and now comes from the *schema*
// (`fieldsSchema[key].type`). Every assertion here is therefore built on Values
// that carry no type of their own — a bare string, a `{url, assetId}` object,
// an array of `{id, fields}` — so a component that regressed to reading the
// data could not pass by accident.
// ---------------------------------------------------------------------------

vi.mock('@/app/(authenticated)/dashboard/editor/actions', () => ({
  initUploadAction: vi.fn(),
  confirmUploadAction: vi.fn(),
}));
vi.mock('@/utils/supabase/client', () => ({ createClient: vi.fn() }));

// @testing-library's auto-cleanup only self-registers under `globals: true`,
// which this repo does not use — without this the previous test's markup stays.
afterEach(cleanup);

import { SectionFields } from './SectionFields';
import { I18nProvider } from '@/lib/i18n/provider';
import { ko } from '@/lib/i18n/messages/ko';

const onFieldChange = vi.fn();
const onError = vi.fn();

beforeEach(() => {
  onFieldChange.mockClear();
  onError.mockClear();
});

function block(fields: Record<string, unknown>): Section {
  return { id: 'blk-1', type: 'hero', visible: true, fields };
}

function renderFields(schema: FieldsSchema, fields: Record<string, unknown>) {
  return render(
    <I18nProvider locale="ko" dictionary={ko}>
      <SectionFields
        section={block(fields)}
        schema={schema}
        onFieldChange={onFieldChange}
        onError={onError}
        issues={{}}
      />
    </I18nProvider>,
  );
}

/** The Value the component last wrote for `fieldKey`. */
function lastWrite(fieldKey: string): FieldValue | undefined {
  const call = onFieldChange.mock.calls.filter((c) => c[1] === fieldKey).at(-1);
  return call?.[2];
}

describe('SectionFields — the input kind comes from the schema, not the data', () => {
  it('renders a textarea for a textarea descriptor holding a plain string', () => {
    renderFields(
      { body: { type: 'textarea', label: '본문' } },
      { body: '줄바꿈 있는 글' },
    );

    const input = screen.getByLabelText('본문');
    expect(input.tagName).toBe('TEXTAREA');
    expect((input as HTMLTextAreaElement).value).toBe('줄바꿈 있는 글');
  });

  it('renders a url input for a url descriptor holding the same plain string', () => {
    renderFields(
      { link: { type: 'url', label: '링크' } },
      { link: 'https://example.com' },
    );

    const input = screen.getByLabelText('링크') as HTMLInputElement;
    expect(input.tagName).toBe('INPUT');
    expect(input.type).toBe('url');
  });

  it('offers a select the schema options — the Value is only the chosen string', async () => {
    const user = userEvent.setup();
    renderFields(
      { tone: { type: 'select', label: '톤', options: ['light', 'dark'] } },
      { tone: 'dark' },
    );

    // The options come from the schema alone. The old `SelectField` carried its
    // own `options` copy in the content, which is the drift ADR-0016 §4 removes:
    // here the stored Value is the bare string 'dark' and nothing else.
    await user.click(screen.getByLabelText('톤'));
    expect(screen.getByRole('option', { name: 'light' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'dark' })).toBeDefined();

    await user.click(screen.getByRole('option', { name: 'light' }));
    expect(lastWrite('tone')).toBe('light');
  });

  it('skips a field the schema marks non-editable, even when a Value is stored', () => {
    renderFields(
      {
        shown: { type: 'text', label: '보임' },
        hidden: { type: 'text', label: '숨김', editable: false },
      },
      { shown: 'A', hidden: 'B' },
    );

    expect(screen.getByLabelText('보임')).toBeDefined();
    expect(screen.queryByLabelText('숨김')).toBeNull();
  });

  it('renders nothing for a stored key the schema does not describe', () => {
    // A Value carries no type, so an undescribed key has no input to render.
    // The validator reports it as UNKNOWN_DATA_FIELD; the editor stays silent.
    renderFields({ title: { type: 'text', label: '제목' } }, { title: 'A', orphan: 'B' });

    expect(screen.getAllByRole('textbox')).toHaveLength(1);
  });

  it('still renders an input for an optional field with no stored Value', () => {
    // Under the old shape every editable field existed in the data as a Field
    // object, so "absent" was unreachable. Now it is the normal state of an
    // optional field nobody has filled in — and it has to stay fillable.
    renderFields({ eyebrow: { type: 'text', label: '라벨' } }, {});

    const input = screen.getByLabelText('라벨') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('renders fields in schema order, not in the stored key order', () => {
    renderFields(
      {
        first: { type: 'text', label: '하나' },
        second: { type: 'text', label: '둘' },
        third: { type: 'text', label: '셋' },
      },
      { third: 'C', first: 'A', second: 'B' },
    );

    expect(screen.getAllByRole('textbox').map((el) => (el as HTMLInputElement).value))
      .toEqual(['A', 'B', 'C']);
  });
});

describe('SectionFields — number resets to the schema default', () => {
  const schema: FieldsSchema = {
    columns: { type: 'number', label: '열 수', default: 3 },
  };

  it('writes the parsed number as it is typed', async () => {
    const user = userEvent.setup();
    renderFields(schema, { columns: 2 });

    const input = screen.getByLabelText('열 수');
    await user.clear(input);
    await user.type(input, '5');

    expect(lastWrite('columns')).toBe(5);
  });

  it('resets an emptied input to the descriptor default on blur', async () => {
    const user = userEvent.setup();
    renderFields(schema, { columns: 6 });

    const input = screen.getByLabelText('열 수') as HTMLInputElement;
    await user.clear(input);
    await user.tab();

    // ADR-0016 §4-3: the parse happens once, here, so the renderer never sees
    // NaN or null. `default` is mandatory on a number descriptor for exactly
    // this reason — it is the answer to "what does empty mean".
    expect(lastWrite('columns')).toBe(3);
    expect(input.value).toBe('3');
  });

  it('materialises the default for a number that was never stored', async () => {
    const user = userEvent.setup();
    renderFields(schema, {});

    const input = screen.getByLabelText('열 수') as HTMLInputElement;
    expect(input.value).toBe('3');
    await user.click(input);
    await user.tab();

    expect(lastWrite('columns')).toBe(3);
  });
});

describe('SectionFields — image Values', () => {
  it('carries assetId through a manual url edit', async () => {
    const user = userEvent.setup();
    renderFields(
      { photo: { type: 'image', label: '사진' } },
      { photo: { url: 'https://cdn/a.png', assetId: 'asset-a' } },
    );

    // Typing the url writes a whole ImageValue, and `assetId` rides along: an
    // upload that is being swapped out by hand stays referenced, so the orphan
    // sweep (ADR-0003) does not delete a binary mid-edit. Same behaviour as
    // before ADR-0016, where a manual url edit passed no assetId at all.
    await user.type(screen.getByLabelText('사진'), '2');

    expect(lastWrite('photo')).toEqual({ url: 'https://cdn/a.png2', assetId: 'asset-a' });
  });

  it('renders an image field whose Value has never been set', () => {
    renderFields({ photo: { type: 'image', label: '사진' } }, {});
    expect((screen.getByLabelText('사진') as HTMLInputElement).value).toBe('');
  });
});

describe('SectionFields — array items keyed by their own id', () => {
  const schema: FieldsSchema = {
    items: {
      type: 'array',
      label: '항목',
      itemSchema: {
        title: { type: 'text', label: '제목' },
        badge: { type: 'select', label: '배지', options: ['BEST', 'NEW'] },
      },
      maxItems: 3,
    },
  };
  const twoItems = {
    items: [
      { id: 'id-a', fields: { title: 'A', badge: 'BEST' } },
      { id: 'id-b', fields: { title: 'B', badge: 'NEW' } },
    ],
  };

  it('adds an item with a fresh UUID id and schema-seeded empty Values', async () => {
    const user = userEvent.setup();
    renderFields(schema, twoItems);

    await user.click(screen.getByTitle(ko.editor.field.addItem));

    const next = lastWrite('items') as Array<{ id: string; fields: Record<string, unknown> }>;
    expect(next).toHaveLength(3);
    expect(next[2].id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    // Seeded from the schema: text → '', select → its first option.
    expect(next[2].fields).toEqual({ title: '', badge: 'BEST' });
    // The two existing items keep the ids they already had.
    expect(next.slice(0, 2).map((i) => i.id)).toEqual(['id-a', 'id-b']);
  });

  it('reorders by moving the item objects, so each id travels with its own row', async () => {
    const user = userEvent.setup();
    renderFields(schema, twoItems);

    await user.click(screen.getAllByLabelText(ko.editor.field.moveDown)[0]);

    const next = lastWrite('items') as Array<{ id: string; fields: Record<string, unknown> }>;
    expect(next.map((i) => `${i.id}:${i.fields.title}`)).toEqual(['id-b:B', 'id-a:A']);
  });

  it('removes the item at the clicked row', async () => {
    const user = userEvent.setup();
    renderFields(schema, twoItems);

    await user.click(screen.getAllByLabelText(ko.editor.field.delete)[0]);

    const next = lastWrite('items') as Array<{ id: string }>;
    expect(next.map((i) => i.id)).toEqual(['id-b']);
  });

  it('writes an item field without disturbing sibling items or ids', async () => {
    const user = userEvent.setup();
    renderFields(schema, twoItems);

    const rows = screen.getAllByLabelText('제목');
    await user.type(rows[1], '!');

    const next = lastWrite('items') as Array<{ id: string; fields: Record<string, unknown> }>;
    expect(next[1]).toEqual({ id: 'id-b', fields: { title: 'B!', badge: 'NEW' } });
    expect(next[0]).toEqual({ id: 'id-a', fields: { title: 'A', badge: 'BEST' } });
  });

  it('disables the add button at maxItems', () => {
    renderFields(schema, {
      items: [
        { id: 'id-a', fields: { title: 'A' } },
        { id: 'id-b', fields: { title: 'B' } },
        { id: 'id-c', fields: { title: 'C' } },
      ],
    });

    const add = screen.getByTitle(`${ko.editor.field.maxReachedPrefix}3${ko.editor.field.maxReachedSuffix}`);
    expect(add).toBeDisabled();
    expect(onFieldChange).not.toHaveBeenCalled();
  });

  it('renders the empty state for an array field with no stored Value', () => {
    renderFields(schema, {});
    const list = screen.getByText(ko.editor.field.noItems).parentElement!;
    expect(within(list).getByText(ko.editor.field.addFirstItem)).toBeDefined();
  });
});
