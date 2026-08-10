import { describe, it, expect } from 'vitest';
import { validateContent } from '../validate';
import { SingleContent, FieldsSchema } from '@/domain/entities/template.entity';
import type { TemplateLibrary } from '@/templates/types';

import { templateMap, presetMap, getAvailableTemplateKeys } from '@/templates/_generated';
import { MIGRATED_TEMPLATE_KEYS } from '@/templates/__tests__/migrated-templates';

const ALL_TEMPLATE_KEYS = getAvailableTemplateKeys();

/**
 * Rules deleted rather than ported, and why. ADR-0016 §4 makes the schema the
 * only source of truth, so a Value no longer carries the metadata these checked:
 *
 * - `MISSING_FIELD_TYPE` / `MISSING_FIELD_LABEL` — a Value has neither. The
 *   descriptor holds `type` and `label`, and `FieldDescriptor` requires both at
 *   compile time, so the state these guarded is unreachable.
 * - `FIELD_TYPE_MISMATCH` — it existed *only* to catch content whose stored
 *   `type` had drifted from the schema's. With one source of truth there is
 *   nothing to drift. Its useful half (does the data fit the schema?) is now
 *   `FIELD_VALUE_TYPE_MISMATCH`, which checks the Value's actual shape.
 * - `MISSING_FIELD_VALUE` / `NON_STRING_FIELD_VALUE` / `NON_ARRAY_FIELD_VALUE` —
 *   folded into `FIELD_VALUE_TYPE_MISMATCH` (wrong shape) and
 *   `MISSING_REQUIRED_FIELD` (absent when the schema demands it). One code for
 *   "this Value does not fit its descriptor" — no consumer branched on the
 *   narrower ones. An absent *optional* key is no longer an issue at all: it is
 *   a correct state the renderer falls back for.
 *
 * `UNKNOWN_DATA_FIELD` survives with a new meaning — no longer "a field the
 * component does not declare" but "stored data orphaned by a schema change".
 */

/** Builds a library from bare schemas — the only part of a library this file exercises. */
function libraryOf(schemas: Record<string, FieldsSchema>): TemplateLibrary {
  return Object.fromEntries(
    Object.entries(schemas).map(([componentKey, fieldsSchema]) => [
      componentKey,
      {
        Component: (() => null) as unknown as TemplateLibrary[string]['Component'],
        meta: { componentKey, category: 'test', label: componentKey, fieldsSchema },
      },
    ]),
  );
}

function minimalJson(overrides: Partial<SingleContent> = {}): SingleContent {
  return {
    mode: 'single',
    templateKey: 'corporate',
    globalStyles: {
      primaryColor: '#1a1a2e',
      secondaryColor: '#e94560',
      backgroundColor: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      layout: 'wide',
    },
    sections: [
      {
        id: 'hero-001',
        type: 'hero',
        visible: true,
        nav: { visible: false, label: 'Hero' },
        // Values, not Field objects (ADR-0016 §4).
        fields: { title: 'Hello' },
      },
    ],
    ...overrides,
  };
}

/** `minimalJson` with the first section's fields and component key replaced. */
function withBlock(type: string, fields: Record<string, unknown>): SingleContent {
  const json = minimalJson();
  json.sections[0].type = type;
  json.sections[0].fields = fields;
  return json;
}

const codes = (issues: readonly { code: string }[]) => issues.map((i) => i.code);

/** A real `assets.id` shape — the column is a Postgres uuid. */
const ASSET_ID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';

// ─── Unit tests ────────────────────────────────────────────────────

describe('validateContent — structure', () => {
  it('passes a well-formed JSON with no options', () => {
    const result = validateContent(minimalJson());
    expect(result.errors).toHaveLength(0);
  });

  it('errors when sections is empty', () => {
    const result = validateContent(minimalJson({ sections: [] }));
    expect(result.errors.some((e) => e.code === 'SECTIONS_EMPTY')).toBe(true);
  });

  it('errors on duplicate section ids', () => {
    const json = minimalJson();
    json.sections.push({ ...json.sections[0] }); // same id
    const result = validateContent(json);
    expect(result.errors.some((e) => e.code === 'DUPLICATE_SECTION_ID')).toBe(true);
  });

  it('errors when a single section is missing nav', () => {
    const json = minimalJson();
    // @ts-expect-error intentional: drop the required nav projection source
    delete json.sections[0].nav;
    const result = validateContent(json);
    expect(result.errors.some((e) => e.code === 'MISSING_NAV')).toBe(true);
  });

  // The consequence of ADR-0016 §4 worth stating out loud: a Value carries no
  // `type` or `label`, so without a schema to compare it against there is no
  // field rule left to run. Every save path supplies a library
  // (`LibraryAwareSiteContentValidator`, sync, `template:verify`); the
  // structure-only callers get structure-only answers.
  it('runs no field rules at all when no templateLibrary is given', () => {
    const json = withBlock('hero', { title: 42, nonsense: { deeply: ['wrong'] } });
    const result = validateContent(json);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});

describe('validateContent — templateKey', () => {
  it('errors when templateKey is not in availableTemplateKeys', () => {
    const result = validateContent(minimalJson(), { availableTemplateKeys: ['cafe'] });
    expect(result.errors.some((e) => e.code === 'UNKNOWN_TEMPLATE_KEY')).toBe(true);
  });

  it('passes when templateKey is in availableTemplateKeys', () => {
    const result = validateContent(minimalJson(), { availableTemplateKeys: ['corporate'] });
    expect(result.errors.filter((e) => e.code === 'UNKNOWN_TEMPLATE_KEY')).toHaveLength(0);
  });

  it('skips templateKey check when availableTemplateKeys is not provided', () => {
    const result = validateContent(minimalJson({ templateKey: 'nonexistent' }));
    expect(result.errors.filter((e) => e.code === 'UNKNOWN_TEMPLATE_KEY')).toHaveLength(0);
  });
});

describe('validateContent — globalStyles', () => {
  it('errors when globalStyles is missing', () => {
    const json = minimalJson();
    // @ts-expect-error intentional
    delete json.globalStyles;
    const result = validateContent(json);
    expect(result.errors.some((e) => e.code === 'MISSING_GLOBAL_STYLES')).toBe(true);
  });

  it('warns on non-hex primaryColor', () => {
    const json = minimalJson();
    json.globalStyles.primaryColor = 'red';
    const result = validateContent(json);
    expect(result.warnings.some((w) => w.code === 'NON_HEX_COLOR')).toBe(true);
    expect(result.errors.filter((e) => e.code === 'INVALID_COLOR')).toHaveLength(0);
  });

  it('warns — but does not block — on invalid fontSize', () => {
    const json = minimalJson();
    json.globalStyles.fontSize = 'big';
    const result = validateContent(json);
    expect(result.warnings.some((w) => w.code === 'INVALID_FONT_SIZE')).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('warns — but does not block — on unknown layout', () => {
    const json = minimalJson();
    json.globalStyles.layout = 'superwide';
    const result = validateContent(json);
    expect(result.warnings.some((w) => w.code === 'UNKNOWN_LAYOUT')).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('warns — but does not block — on an empty colour', () => {
    const json = minimalJson();
    json.globalStyles.primaryColor = '';
    const result = validateContent(json);
    expect(result.warnings.some((w) => w.code === 'INVALID_COLOR')).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  // The guard for ADR-0015's principle: no rule a user can reach from an editor
  // input may block the save. If a new blocking rule lands on globalStyles, this
  // fails and forces the author to justify it as a renderer/integrity break.
  it('never blocks a save on any globalStyles value the editor can produce', () => {
    const json = minimalJson();
    json.globalStyles = {
      primaryColor: '',
      secondaryColor: 'not-a-colour',
      backgroundColor: 'not-a-colour',
      fontFamily: '',
      fontSize: '16',
      layout: 'full-width',
    };
    expect(validateContent(json).errors).toHaveLength(0);
  });

  it('warns when backgroundColor is set but not a hex colour', () => {
    const json = minimalJson();
    json.globalStyles.backgroundColor = 'papayawhip';
    const result = validateContent(json);
    expect(result.warnings.some((w) => w.code === 'NON_HEX_COLOR' && w.path === 'globalStyles.backgroundColor')).toBe(true);
  });

  // `backgroundColor` was added after Sites existed. Those rows carry no value
  // and every render path falls back to the Template default, so an absent
  // value is a correct state — not something to nag a Site owner about. This
  // differs deliberately from primaryColor/secondaryColor, which predate any
  // Site and are genuinely empty only if the user cleared them.
  it('stays silent when backgroundColor is absent (pre-existing Sites)', () => {
    const json = minimalJson();
    json.globalStyles.backgroundColor = '';
    const empty = validateContent(json);
    expect(empty.warnings.some((w) => w.path === 'globalStyles.backgroundColor')).toBe(false);

    // @ts-expect-error — a row written before the axis existed has no key at all
    delete json.globalStyles.backgroundColor;
    const absent = validateContent(json);
    expect(absent.warnings.some((w) => w.path === 'globalStyles.backgroundColor')).toBe(false);
    expect(absent.errors).toHaveLength(0);
  });
});

describe('validateContent — background polarity (text colours are code-fixed)', () => {
  // A Template's text tokens are tuned for the luminance of its own default
  // background and do NOT follow the user's pick (only the tonal surface
  // siblings derive). Flipping a light Template to a dark background therefore
  // leaves dark text on a dark page. Warned, never blocked — ADR-0015 rule 4.
  const withBg = (bg: string) => {
    const json = minimalJson();
    json.globalStyles.backgroundColor = bg;
    return json;
  };

  it('warns when a light template is given a dark background', () => {
    const result = validateContent(withBg('#1B2A41'), { templateDefaultBackground: '#F5F0E8' });
    expect(result.warnings.some((w) => w.code === 'BACKGROUND_POLARITY_FLIPPED')).toBe(true);
    expect(result.warnings.find((w) => w.code === 'BACKGROUND_POLARITY_FLIPPED')?.path)
      .toBe('globalStyles.backgroundColor');
  });

  it('warns when a dark template is given a light background', () => {
    const result = validateContent(withBg('#FFFFFF'), { templateDefaultBackground: '#080808' });
    expect(result.warnings.some((w) => w.code === 'BACKGROUND_POLARITY_FLIPPED')).toBe(true);
  });

  it('stays silent when the background keeps the template polarity', () => {
    const darker = validateContent(withBg('#E8DFD0'), { templateDefaultBackground: '#F5F0E8' });
    expect(darker.warnings.some((w) => w.code === 'BACKGROUND_POLARITY_FLIPPED')).toBe(false);

    const lighter = validateContent(withBg('#1E1E1E'), { templateDefaultBackground: '#080808' });
    expect(lighter.warnings.some((w) => w.code === 'BACKGROUND_POLARITY_FLIPPED')).toBe(false);
  });

  it('stays silent when the template default is unknown (no false positives)', () => {
    const result = validateContent(withBg('#1B2A41'));
    expect(result.warnings.some((w) => w.code === 'BACKGROUND_POLARITY_FLIPPED')).toBe(false);
  });

  it('stays silent when either colour is not parseable as hex', () => {
    const result = validateContent(withBg('papayawhip'), { templateDefaultBackground: '#F5F0E8' });
    expect(result.warnings.some((w) => w.code === 'BACKGROUND_POLARITY_FLIPPED')).toBe(false);
  });

  it('never blocks the save', () => {
    const result = validateContent(withBg('#000000'), { templateDefaultBackground: '#FFFFFF' });
    expect(result.errors).toHaveLength(0);
  });
});

// ─── Value ↔ schema rules (ADR-0016 §4) ────────────────────────────

describe('validateContent — component key', () => {
  const templateLibrary = libraryOf({
    hero: { title: { type: 'text', label: 'Title' } },
  });

  it('errors when componentKey is unknown', () => {
    const json = withBlock('unknown-comp', {});
    const result = validateContent(json, { templateLibrary });
    expect(result.errors.some((e) => e.code === 'UNKNOWN_COMPONENT_KEY')).toBe(true);
  });

  // An unknown component means no schema, so the fields cannot be judged at all.
  // Reporting one clear cause beats a pile of downstream noise about a block the
  // renderer will skip anyway (`library[type]` misses → `return null`).
  it('reports the unknown key alone, not every field under it', () => {
    const json = withBlock('unknown-comp', { title: 42 });
    const result = validateContent(json, { templateLibrary });
    expect(codes(result.errors)).toEqual(['UNKNOWN_COMPONENT_KEY']);
  });
});

describe('validateContent — required / optional', () => {
  const templateLibrary = libraryOf({
    hero: {
      title: { type: 'text', label: 'Title', required: true },
      subtitle: { type: 'text', label: 'Subtitle' },
    },
  });

  it('errors when a required field is missing', () => {
    const result = validateContent(withBlock('hero', {}), { templateLibrary });
    expect(result.errors.some((e) => e.code === 'MISSING_REQUIRED_FIELD')).toBe(true);
    expect(result.errors.find((e) => e.code === 'MISSING_REQUIRED_FIELD')?.path)
      .toBe('sections[id=hero-001].fields.title');
  });

  it('errors when a required field is present but null', () => {
    const result = validateContent(withBlock('hero', { title: null }), { templateLibrary });
    expect(result.errors.some((e) => e.code === 'MISSING_REQUIRED_FIELD')).toBe(true);
  });

  // `null` is not "absent". `ValuesOf` yields `T | undefined` and never `T | null`,
  // so a stored null is a shape no renderer was typed against — but every
  // renderer must fall back on an optional Value (ADR-0016 §6) and both `?? ''`
  // and `?.` absorb null, so it is reported and not blocked (ADR-0015 rule 4).
  // Without this it was the one value that skipped every shape rule.
  it('warns — but does not block — when an optional field is null', () => {
    const result = validateContent(
      withBlock('hero', { title: 'Hi', subtitle: null }),
      { templateLibrary },
    );
    expect(result.warnings.some((w) => w.code === 'NULL_FIELD_VALUE')).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('stays silent on an absent optional key, unlike an explicit null', () => {
    const result = validateContent(withBlock('hero', { title: 'Hi' }), { templateLibrary });
    expect(codes(result.warnings)).not.toContain('NULL_FIELD_VALUE');
  });

  // Presence, not non-emptiness. Clearing an input is an ordinary edit and the
  // renderer's `|| 'fallback'` covers it; blocking it would make a half-finished
  // page unsavable (ADR-0015 rule 4).
  it('accepts an empty string in a required field', () => {
    const result = validateContent(withBlock('hero', { title: '' }), { templateLibrary });
    expect(result.errors).toHaveLength(0);
  });

  // The defence `getFieldValue`'s `if (!field) return ''` used to provide is now
  // the renderer's own `?? ''` (ADR-0016 §6), so an absent optional key is a
  // correct state rather than a hole to report.
  it('stays silent when an optional field is absent', () => {
    const result = validateContent(withBlock('hero', { title: 'Hi' }), { templateLibrary });
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});

describe('validateContent — Value shape', () => {
  const templateLibrary = libraryOf({
    hero: {
      title: { type: 'text', label: 'Title' },
      body: { type: 'textarea', label: 'Body' },
      count: { type: 'number', label: 'Count', default: 3 },
      photo: { type: 'image', label: 'Photo' },
      tone: { type: 'select', label: 'Tone', options: ['light', 'dark'] },
    },
  });

  it('errors when a text field holds a non-string', () => {
    const result = validateContent(withBlock('hero', { title: 42 }), { templateLibrary });
    expect(result.errors.some((e) => e.code === 'FIELD_VALUE_TYPE_MISMATCH')).toBe(true);
  });

  // The gauge that makes a half-finished migration visible (ADR-0016 §8-2): a
  // Block still holding pre-ADR-0016 `{type,label,value}` Field objects is an
  // object where a string belongs, and every un-migrated Template trips it.
  it('errors on a legacy Field object left in place of a Value', () => {
    const legacy = { title: { type: 'text', label: 'Title', value: 'Hello' } };
    const result = validateContent(withBlock('hero', legacy), { templateLibrary });
    expect(result.errors.some((e) => e.code === 'FIELD_VALUE_TYPE_MISMATCH')).toBe(true);
  });

  it('errors when a number field holds a non-finite value', () => {
    for (const bad of ['3', NaN, Infinity]) {
      const result = validateContent(withBlock('hero', { count: bad }), { templateLibrary });
      expect(codes(result.errors)).toContain('FIELD_VALUE_TYPE_MISMATCH');
    }
    expect(validateContent(withBlock('hero', { count: 3 }), { templateLibrary }).errors).toHaveLength(0);
  });

  it('errors when an image field is a bare string instead of { url }', () => {
    const result = validateContent(
      withBlock('hero', { photo: 'https://cdn.example.com/a.jpg' }),
      { templateLibrary },
    );
    expect(result.errors.some((e) => e.code === 'FIELD_VALUE_TYPE_MISMATCH')).toBe(true);
  });

  it('accepts an image with a url, with or without an assetId', () => {
    const bare = validateContent(withBlock('hero', { photo: { url: 'https://a/b.jpg' } }), { templateLibrary });
    expect(bare.errors).toHaveLength(0);

    const withAsset = validateContent(
      withBlock('hero', { photo: { url: 'https://a/b.jpg', assetId: ASSET_ID } }),
      { templateLibrary },
    );
    expect(withAsset.errors).toHaveLength(0);

    const cleared = validateContent(
      withBlock('hero', { photo: { url: 'https://a/b.jpg', assetId: null } }),
      { templateLibrary },
    );
    expect(cleared.errors).toHaveLength(0);
  });

  // Blocking is safe here precisely because no editor input reaches `assetId` —
  // it is written from `confirmUploadAction`'s response.
  it('errors when assetId is neither a string nor null', () => {
    const result = validateContent(
      withBlock('hero', { photo: { url: 'https://a/b.jpg', assetId: 42 } }),
      { templateLibrary },
    );
    expect(result.errors.some((e) => e.code === 'INVALID_ASSET_ID')).toBe(true);
  });

  // "A string" is not the bar: the value is copied into `asset_usages.asset_id`,
  // a `uuid` column referencing `assets.id`. A non-UUID string aborts the save
  // inside the RPC with a Postgres type error naming nothing useful.
  it('errors when assetId is a string but not a UUID', () => {
    const result = validateContent(
      withBlock('hero', { photo: { url: 'https://a/b.jpg', assetId: 'asset-1' } }),
      { templateLibrary },
    );
    expect(result.errors.some((e) => e.code === 'INVALID_ASSET_ID')).toBe(true);
  });

  it('warns — but does not block — when a select value is outside its options', () => {
    const result = validateContent(withBlock('hero', { tone: 'sepia' }), { templateLibrary });
    expect(result.warnings.some((w) => w.code === 'SELECT_VALUE_NOT_IN_OPTIONS')).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('stays silent when a select value is one of its options', () => {
    const result = validateContent(withBlock('hero', { tone: 'dark' }), { templateLibrary });
    expect(result.warnings).toHaveLength(0);
  });

  it('warns on stored data the schema does not declare', () => {
    const result = validateContent(withBlock('hero', { title: 'Hi', legacyKey: 'x' }), { templateLibrary });
    expect(result.warnings.some((w) => w.code === 'UNKNOWN_DATA_FIELD')).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('validateContent — colour and URL warnings (ADR-0015)', () => {
  const templateLibrary = libraryOf({
    hero: {
      accent: { type: 'color', label: 'Accent' },
      link: { type: 'url', label: 'Link' },
      photo: { type: 'image', label: 'Photo' },
    },
  });

  it('warns — but does not block — when a color field is not hex', () => {
    const result = validateContent(withBlock('hero', { accent: 'red' }), { templateLibrary });
    expect(result.warnings.some((w) => w.code === 'INVALID_COLOR_FIELD')).toBe(true);
    // The save must still go through: the editor's color input is free text, so
    // every keystroke of a hex value passes through a non-hex state.
    expect(result.errors).toHaveLength(0);
  });

  it('passes when a color field is a valid hex', () => {
    const result = validateContent(withBlock('hero', { accent: '#ff0066' }), { templateLibrary });
    expect(result.warnings).toHaveLength(0);
  });

  it('warns when a url field uses http://', () => {
    const result = validateContent(withBlock('hero', { link: 'http://example.com' }), { templateLibrary });
    expect(result.warnings.some((w) => w.code === 'INSECURE_URL')).toBe(true);
  });

  it('warns when an image url uses http://', () => {
    const result = validateContent(
      withBlock('hero', { photo: { url: 'http://example.com/img.jpg' } }),
      { templateLibrary },
    );
    expect(result.warnings.some((w) => w.code === 'INSECURE_URL')).toBe(true);
  });
});

describe('validateContent — array fields', () => {
  const templateLibrary = libraryOf({
    'menu-list': {
      items: {
        type: 'array',
        label: 'Items',
        itemSchema: {
          title: { type: 'text', label: 'Title', required: true },
          price: { type: 'text', label: 'Price' },
        },
        minItems: 1,
        maxItems: 2,
      },
    },
  });

  const list = (items: unknown) => withBlock('menu-list', { items });

  it('passes when array items are valid', () => {
    const result = validateContent(
      list([{ id: 'i1', fields: { title: 'Coffee' } }]),
      { templateLibrary },
    );
    expect(result.errors).toHaveLength(0);
  });

  it('errors when the value is not an array', () => {
    const result = validateContent(list('not-an-array'), { templateLibrary });
    expect(result.errors.some((e) => e.code === 'FIELD_VALUE_TYPE_MISMATCH')).toBe(true);
  });

  it('errors when an item is not a { id, fields } object', () => {
    const result = validateContent(list(['just-a-string']), { templateLibrary });
    expect(result.errors.some((e) => e.code === 'ARRAY_ITEM_MALFORMED')).toBe(true);
  });

  it('errors when an item carries no fields object', () => {
    const result = validateContent(list([{ id: 'i1' }]), { templateLibrary });
    expect(result.errors.some((e) => e.code === 'ARRAY_ITEM_MALFORMED')).toBe(true);
  });

  it('recurses into itemSchema', () => {
    const result = validateContent(
      list([{ id: 'i1', fields: { price: '4000' } }]), // title is required
      { templateLibrary },
    );
    expect(result.errors.some((e) => e.code === 'MISSING_REQUIRED_FIELD')).toBe(true);
    // The path uses the item's own id, matching the asset slot_key encoding of
    // ADR-0016 §4-4 — an index would point at a different item after a reorder.
    expect(result.errors.find((e) => e.code === 'MISSING_REQUIRED_FIELD')?.path)
      .toBe('sections[id=hero-001].fields.items[i1].title');
  });

  it('recurses into a nested array', () => {
    const nested = libraryOf({
      'menu-list': {
        items: {
          type: 'array',
          label: 'Sections',
          itemSchema: {
            rows: {
              type: 'array',
              label: 'Rows',
              itemSchema: { name: { type: 'text', label: 'Name', required: true } },
            },
          },
        },
      },
    });

    const result = validateContent(
      list([{ id: 'i1', fields: { rows: [{ id: 'r1', fields: {} }] } }]),
      { templateLibrary: nested },
    );
    expect(result.errors.find((e) => e.code === 'MISSING_REQUIRED_FIELD')?.path)
      .toBe('sections[id=hero-001].fields.items[i1].rows[r1].name');
  });

  it('errors when an item has no id', () => {
    const result = validateContent(list([{ fields: { title: 'Coffee' } }]), { templateLibrary });
    expect(result.errors.some((e) => e.code === 'ARRAY_ITEM_ID_MISSING')).toBe(true);
  });

  it('errors when an item id is empty or not a string', () => {
    for (const id of ['', 7, null]) {
      const result = validateContent(list([{ id, fields: { title: 'Coffee' } }]), { templateLibrary });
      expect(codes(result.errors)).toContain('ARRAY_ITEM_ID_MISSING');
    }
  });

  it('errors when two items in the same array share an id', () => {
    const result = validateContent(
      list([
        { id: 'dup', fields: { title: 'A' } },
        { id: 'dup', fields: { title: 'B' } },
      ]),
      { templateLibrary },
    );
    expect(result.errors.some((e) => e.code === 'ARRAY_ITEM_ID_DUPLICATE')).toBe(true);
  });

  // Uniqueness is per array, not global (ADR-0016 §4-4 rule 2) — two different
  // arrays reusing an id collide in nothing: React reconciles within one list and
  // the slot_key is prefixed by the field path.
  it('allows the same id in two different arrays', () => {
    const twoArrays = libraryOf({
      'menu-list': {
        a: { type: 'array', label: 'A', itemSchema: { title: { type: 'text', label: 'T' } } },
        b: { type: 'array', label: 'B', itemSchema: { title: { type: 'text', label: 'T' } } },
      },
    });
    const json = withBlock('menu-list', {
      a: [{ id: 'shared', fields: { title: 'A' } }],
      b: [{ id: 'shared', fields: { title: 'B' } }],
    });
    expect(validateContent(json, { templateLibrary: twoArrays }).errors).toHaveLength(0);
  });

  // Demoted from errors. Both are reachable from the editor's add/remove
  // buttons and neither breaks the renderer — it maps over whatever is there.
  // As errors they held every other edit in the same ContentModel hostage to one
  // over-full array, which ADR-0015 rule 4 rules out.
  it('warns — but does not block — on minItems / maxItems violations', () => {
    const below = validateContent(list([]), { templateLibrary });
    expect(below.warnings.some((w) => w.code === 'ARRAY_ITEMS_BELOW_MIN')).toBe(true);
    expect(below.errors).toHaveLength(0);

    const above = validateContent(
      list([
        { id: 'i1', fields: { title: '1' } },
        { id: 'i2', fields: { title: '2' } },
        { id: 'i3', fields: { title: '3' } },
      ]),
      { templateLibrary },
    );
    expect(above.warnings.some((w) => w.code === 'ARRAY_ITEMS_ABOVE_MAX')).toBe(true);
    expect(above.errors).toHaveLength(0);
  });

  // `FieldDescriptor` makes `itemSchema` mandatory on an array, so this is only
  // reachable from a library shipped as plain JS. Kept so that case reports the
  // offending component instead of throwing inside `Object.entries(undefined)`.
  it('errors when the schema declares an array with no itemSchema', () => {
    const broken = {
      'menu-list': {
        meta: {
          componentKey: 'menu-list',
          category: 'test',
          label: 'Broken',
          fieldsSchema: { items: { type: 'array', label: 'Items' } },
        },
      },
    } as unknown as TemplateLibrary;

    const result = validateContent(list([]), { templateLibrary: broken });
    expect(result.errors.some((e) => e.code === 'MISSING_ITEM_SCHEMA')).toBe(true);
  });
});

// The field-level counterpart of the globalStyles guard above. Every value here
// is one an editor input can produce; if a future rule blocks any of them, this
// fails and forces the author to justify it as a renderer break (ADR-0015 §4).
describe('validateContent — no user-reachable field value blocks a save', () => {
  it('keeps errors empty for every editable value the UI can emit', () => {
    const templateLibrary = libraryOf({
      hero: {
        title: { type: 'text', label: 'Title', required: true },
        accent: { type: 'color', label: 'Accent' },
        link: { type: 'url', label: 'Link' },
        tone: { type: 'select', label: 'Tone', options: ['light', 'dark'] },
        photo: { type: 'image', label: 'Photo' },
        items: {
          type: 'array',
          label: 'Items',
          minItems: 2,
          maxItems: 2,
          itemSchema: { name: { type: 'text', label: 'Name', required: true } },
        },
      },
    });

    const json = withBlock('hero', {
      title: '',                                   // cleared input
      accent: '#a',                                // mid-typing hex
      link: 'http://insecure.example.com',         // pasted http URL
      tone: 'sepia',                               // options narrowed under it
      photo: { url: '', assetId: null },           // removed image
      items: [],                                   // emptied list
    });

    const result = validateContent(json, { templateLibrary });
    expect(result.errors).toHaveLength(0);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

// ─── Migration gauge (ADR-0016 §8-2) ───────────────────────────────


describe('all presets — Value migration gauge', () => {
  it('only names templates that exist', () => {
    for (const key of MIGRATED_TEMPLATE_KEYS) {
      expect(ALL_TEMPLATE_KEYS).toContain(key);
    }
  });

  // Driven by the registry, never a hand-kept list: ADR-0016 §8 is explicit that
  // the conversion covers "every Template in the registry" and that no count is
  // written down, because a written count goes stale the next time one is added.
  for (const templateKey of ALL_TEMPLATE_KEYS) {
    const migrated = MIGRATED_TEMPLATE_KEYS.has(templateKey);

    it(`${templateKey} ${migrated ? 'validates with no errors' : 'is still on Field objects and is rejected'}`, async () => {
      const [{ default: preset }, templateModule] = await Promise.all([
        presetMap[templateKey](),
        templateMap[templateKey](),
      ]);

      // The Preset carries the full content verbatim (code is source of truth).
      const result = validateContent(preset.content, {
        availableTemplateKeys: ALL_TEMPLATE_KEYS,
        templateLibrary: templateModule.library,
      });

      if (migrated) {
        if (result.errors.length > 0) console.error(`Errors in ${templateKey}:`, result.errors);
        expect(result.errors).toHaveLength(0);
      } else {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });
  }
});
