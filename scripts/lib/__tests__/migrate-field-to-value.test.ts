import { describe, it, expect, vi } from 'vitest';
import {
  migrateContentToValues,
  planFieldValueMigration,
  executeFieldValueMigration,
  digest,
  type MigrationPayload,
  type SourceRows,
  type PlanDeps,
} from '../migrate-field-to-value';
import type { FieldsSchema } from '../../../src/domain/entities/template.entity';
import type { SiteContentValidationIssue } from '../../../src/domain/usecases/ports/site-content-validator.port';

const globalStyles = {
  primaryColor: '#000000',
  secondaryColor: '#ffffff',
  backgroundColor: '#ffffff',
  fontFamily: 'Inter',
  fontSize: '16px',
  layout: 'wide',
};

/** The pre-ADR-0016 storage shape this migration reads. */
const txt = (value: string) => ({ type: 'text', label: 'x', value, editable: true });
const img = (value: string, assetId?: string | null) => ({
  type: 'image',
  label: 'x',
  ...(assetId === undefined ? {} : { assetId }),
  value,
});
const num = (value: string) => ({ type: 'number', label: 'x', value });
const arr = (items: Array<Record<string, unknown>>) => ({ type: 'array', label: 'x', items });

const heroSchema = {
  title: { type: 'text', label: '제목' },
  count: { type: 'number', label: '개수', default: 3 },
} as const satisfies FieldsSchema;

const gallerySchema = {
  photos: {
    type: 'array',
    label: '사진',
    itemSchema: {
      caption: { type: 'text', label: '설명' },
      image: { type: 'image', label: '이미지' },
    },
  },
} as const satisfies FieldsSchema;

const schemas: Record<string, FieldsSchema> = { hero: heroSchema, gallery: gallerySchema };

/** Deterministic ids so the fixtures can assert on them. */
function seqIds() {
  let n = 0;
  return () => `generated-${++n}`;
}

function legacySingle(fields: Record<string, unknown>, type = 'hero') {
  return {
    mode: 'single',
    templateKey: 'cafe-default',
    globalStyles,
    blocks: [
      { id: 'sec-1', type, visible: true, menu: { label: '' }, fields },
    ],
  };
}

const opts = { schemaFor: (t: string) => schemas[t], newId: seqIds() };

/** The first Block's `fields`, without repeating the cast at every call site. */
function blockFields(content: unknown, index = 0): Record<string, unknown> {
  return (content as unknown as { blocks: Array<{ fields: Record<string, unknown> }> }).blocks[index]
    .fields;
}

describe('migrateContentToValues — scalar Values', () => {
  it('unwraps `{ type, label, value }` down to the value itself', () => {
    const r = migrateContentToValues(legacySingle({ title: txt('안녕') }), {
      schemaFor: (t) => schemas[t],
    });
    expect(r.status).toBe('migrated');
    expect(blockFields(r.content)).toEqual({ title: '안녕' });
  });

  it('turns a stringified number into a number, and an unusable one into the schema default', () => {
    const ok = migrateContentToValues(legacySingle({ count: num('42') }), { schemaFor: (t) => schemas[t] });
    const empty = migrateContentToValues(legacySingle({ count: num('') }), { schemaFor: (t) => schemas[t] });

    const zero = migrateContentToValues(legacySingle({ count: num('0') }), { schemaFor: (t) => schemas[t] });

    expect(blockFields(ok.content).count).toBe(42);
    // A deliberate zero is data, not an empty input.
    expect(blockFields(zero.content).count).toBe(0);
    // The legacy shape stored every value as a string, so an emptied number
    // input was persisted as ''. `default` is what the editor resets it to.
    expect(blockFields(empty.content).count).toBe(3);
    expect(empty.notes.join('\n')).toMatch(/not usable/);
  });

  it('keeps a key the schema does not declare rather than dropping data', () => {
    const r = migrateContentToValues(legacySingle({ title: txt('t'), orphan: txt('남은 값') }), {
      schemaFor: (t) => schemas[t],
    });
    expect(blockFields(r.content)).toEqual({ title: 't', orphan: '남은 값' });
  });
});

describe('migrateContentToValues — images', () => {
  it('becomes { url, assetId } and never loses the assetId', () => {
    // Losing `assetId` leaves a live image with no `asset_usages` row, which
    // `sweep_orphaned_assets` deletes the binary for an hour later (ADR-0003).
    const r = migrateContentToValues(
      legacySingle({ photo: img('https://cdn/a.jpg', 'f2a7c0de-0000-4000-8000-000000000001') }),
      opts,
    );
    expect(blockFields(r.content).photo).toEqual({
      url: 'https://cdn/a.jpg',
      assetId: 'f2a7c0de-0000-4000-8000-000000000001',
    });
  });

  it('an image that never had an assetId does not gain one', () => {
    const r = migrateContentToValues(legacySingle({ photo: img('https://cdn/a.jpg') }), opts);
    expect(blockFields(r.content).photo).toEqual({ url: 'https://cdn/a.jpg' });
  });

  it('an explicitly cleared assetId stays null', () => {
    const r = migrateContentToValues(legacySingle({ photo: img('https://cdn/a.jpg', null) }), opts);
    expect(blockFields(r.content).photo).toEqual({ url: 'https://cdn/a.jpg', assetId: null });
  });
});

describe('migrateContentToValues — arrays', () => {
  type Item = { id: string; fields: Record<string, unknown> };
  const photosOf = (r: { content: unknown }) => blockFields(r.content).photos as Item[];

  it('becomes `{ id, fields }[]` with an id per item', () => {
    const r = migrateContentToValues(
      legacySingle(
        {
          photos: arr([
            { caption: txt('첫째'), image: img('https://cdn/1.jpg', 'a1') },
            { caption: txt('둘째'), image: img('https://cdn/2.jpg') },
          ]),
        },
        'gallery',
      ),
      { schemaFor: (t) => schemas[t], newId: seqIds() },
    );

    expect(photosOf(r)).toEqual([
      { id: 'generated-1', fields: { caption: '첫째', image: { url: 'https://cdn/1.jpg', assetId: 'a1' } } },
      { id: 'generated-2', fields: { caption: '둘째', image: { url: 'https://cdn/2.jpg' } } },
    ]);
    expect(r.idsAssigned).toBe(2);
  });

  it('reuses the editor `_key` as the id when one survived in the data', () => {
    const r = migrateContentToValues(
      legacySingle(
        { photos: arr([{ _key: txt('k7x9'), caption: txt('첫째') }]) },
        'gallery',
      ),
      { schemaFor: (t) => schemas[t], newId: seqIds() },
    );

    // `_key` was the item's identity in the editor, so it becomes the id — and
    // it must not survive as a field, where it would be orphaned data.
    expect(photosOf(r)).toEqual([{ id: 'k7x9', fields: { caption: '첫째' } }]);
    expect(r.idsAssigned).toBe(0);
  });

  it('recurses through arrays nested in array items', () => {
    const r = migrateContentToValues(
      legacySingle({ groups: arr([{ rows: arr([{ pic: img('https://cdn/n.jpg', 'n1') }]) }]) }),
      { newId: seqIds() },
    );

    const groups = blockFields(r.content).groups as Array<{
      id: string;
      fields: { rows: Array<{ id: string; fields: Record<string, unknown> }> };
    }>;
    expect(groups[0].fields.rows[0].fields).toEqual({ pic: { url: 'https://cdn/n.jpg', assetId: 'n1' } });
    expect(groups[0].id).toBe('generated-1');
    expect(groups[0].fields.rows[0].id).toBe('generated-2');
  });
});

describe('migrateContentToValues — Multi mode', () => {
  it('converts shared header/footer and every page', () => {
    const legacyMulti = {
      mode: 'multi',
      templateKey: 'corporate-multipage',
      globalStyles,
      chrome: {
        header: [{ id: 'nav-1', type: 'hero', visible: true, fields: { title: txt('헤더') } }],
        footer: [{ id: 'foot-1', type: 'hero', visible: true, fields: { title: txt('푸터') } }],
      },
      pages: [
        {
          id: 'page-home',
          slug: 'home',
          visible: true,
          menu: { label: 'Home' },
          blocks: [{ id: 'hero-1', type: 'hero', visible: true, fields: { title: txt('본문') } }],
        },
      ],
    };

    const r = migrateContentToValues(legacyMulti, opts);
    const c = r.content as unknown as {
      chrome: { header: Array<{ fields: unknown }>; footer: Array<{ fields: unknown }> };
      pages: Array<{ blocks: Array<{ fields: unknown }> }>;
    };
    expect(c.chrome.header[0].fields).toEqual({ title: '헤더' });
    expect(c.chrome.footer[0].fields).toEqual({ title: '푸터' });
    expect(c.pages[0].blocks[0].fields).toEqual({ title: '본문' });
  });
});

describe('migrateContentToValues — idempotency (ADR-0016 §4-4 invariant 5)', () => {
  it('a second run changes nothing and preserves existing item ids', () => {
    const legacy = legacySingle(
      { photos: arr([{ caption: txt('첫째'), image: img('https://cdn/1.jpg', 'a1') }]) },
      'gallery',
    );

    const first = migrateContentToValues(legacy, { schemaFor: (t) => schemas[t], newId: seqIds() });
    const second = migrateContentToValues(first.content, {
      schemaFor: (t) => schemas[t],
      // Any id minted on a re-run would be a bug, so make one impossible to miss.
      newId: () => 'MUST-NOT-BE-USED',
    });

    expect(second.status).toBe('unchanged');
    expect(second.idsAssigned).toBe(0);
    expect(digest(second.content)).toBe(digest(first.content));
  });

  it('finishes a half-converted payload without disturbing the converted part', () => {
    const halfway = legacySingle(
      {
        title: '이미 Value',
        photos: [{ id: 'kept-id', fields: { caption: txt('아직 Field') } }],
      },
      'gallery',
    );

    const r = migrateContentToValues(halfway, { schemaFor: (t) => schemas[t], newId: seqIds() });
    const fields = blockFields(r.content);
    expect(fields.title).toBe('이미 Value');
    expect(fields.photos).toEqual([{ id: 'kept-id', fields: { caption: '아직 Field' } }]);
  });

  it('leaves an unrecognisable payload untouched instead of guessing', () => {
    const r = migrateContentToValues({ pages: [{ id: 'home' }] });
    expect(r.status).toBe('skipped-shape');
    expect(r.content).toEqual({ pages: [{ id: 'home' }] });
  });
});

// ─── Planning and execution ──────────────────────────────────────────────────

const noIssues: SiteContentValidationIssue[] = [];
const anIssue: SiteContentValidationIssue[] = [
  { code: 'FIELD_VALUE_TYPE_MISMATCH', message: 'nope', path: 'sections[0].fields.title' },
];

function rows(): SourceRows {
  return {
    templates: [{ id: 't1', slug: 'cafe-default', content: legacySingle({ title: txt('템플릿') }) }],
    userSites: [
      {
        id: 's1',
        siteName: 'My Site',
        content: legacySingle({ title: txt('사이트') }),
        snapshot: legacySingle({ title: txt('스냅샷') }),
      },
    ],
  };
}

const deps = (validate: PlanDeps['validate']): PlanDeps => ({
  schemaFor: (_templateKey, blockType) => schemas[blockType],
  validate,
  newId: seqIds(),
});

describe('planFieldValueMigration', () => {
  it('covers all three columns and reports a per-column before/after digest', () => {
    const plan = planFieldValueMigration(rows(), deps(() => noIssues));

    expect(plan.ok).toBe(true);
    expect(plan.stats.columns).toBe(3);
    expect(plan.stats.columnsChanged).toBe(3);
    expect(plan.digests.map((d) => d.ref)).toEqual([
      'templates.content#cafe-default',
      'user_sites.content#s1',
      'user_sites.snapshot#s1',
    ]);
    expect(plan.digests.every((d) => d.before !== d.after)).toBe(true);
  });

  it('leaves a null snapshot null', () => {
    const source = rows();
    source.userSites[0].snapshot = null;

    const plan = planFieldValueMigration(source, deps(() => noIssues));
    expect(plan.userSites[0].snapshot).toBeNull();
    expect(plan.stats.columns).toBe(2);
  });

  it('collects validation failures against the column they came from', () => {
    const plan = planFieldValueMigration(rows(), deps((c) => (c.templateKey === 'cafe-default' ? anIssue : noIssues)));

    expect(plan.ok).toBe(false);
    expect(plan.failures.map((f) => f.ref)).toContain('templates.content#cafe-default');
    expect(plan.failures[0].issues).toEqual(anIssue);
  });
});

describe('executeFieldValueMigration', () => {
  it('writes once, with every row in a single payload', async () => {
    const writer = vi.fn(async (_payload: MigrationPayload) => {});
    const { written, plan } = await executeFieldValueMigration(rows(), deps(() => noIssues), writer);

    expect(written).toBe(true);
    expect(writer).toHaveBeenCalledTimes(1);
    const payload = writer.mock.calls[0][0];
    expect(payload.templates).toHaveLength(1);
    expect(payload.userSites).toHaveLength(1);
    expect(plan.ok).toBe(true);
  });

  // The reason the plan/write split exists at all (ADR-0016 §8-1): "transform →
  // write → validate → abort on error" cannot abort, because by then the write
  // has happened. One bad row must stop *every* row, including the good ones.
  it('writes NOTHING when a single row fails validation', async () => {
    const writer = vi.fn(async (_payload: MigrationPayload) => {});
    const { written, plan } = await executeFieldValueMigration(
      rows(),
      deps((c) => (c.templateKey === 'cafe-default' ? anIssue : noIssues)),
      writer,
    );

    expect(written).toBe(false);
    expect(writer).not.toHaveBeenCalled();
    expect(plan.failures.length).toBeGreaterThan(0);
  });
});
