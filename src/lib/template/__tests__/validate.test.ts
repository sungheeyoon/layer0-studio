import { describe, it, expect } from 'vitest';
import { validateContent } from '../validate';
import { SingleContent, ArrayField } from '@/domain/entities/template.entity';
import type { TemplateLibrary } from '@/templates/types';

// -- All shipping templates --
import corporatePreset from '@/templates/corporate/default/template';
import cafePreset from '@/templates/cafe/default/template';
import fitnessPreset from '@/templates/fitness/default/template';
import interiorPreset from '@/templates/interior/default/template';
import legalPreset from '@/templates/legal/default/template';
import medicalPreset from '@/templates/medical/default/template';
import weddingPreset from '@/templates/wedding/default/template';
import cafeModernPreset from '@/templates/cafe/modern/template';
import cafeCozyPreset from '@/templates/cafe/cozy/template';

import { templateMap, getAvailableTemplateKeys } from '@/templates/_generated';

const ALL_TEMPLATE_KEYS = getAvailableTemplateKeys();

function minimalJson(overrides: Partial<SingleContent> = {}): SingleContent {
  return {
    mode: 'single',
    templateKey: 'corporate',
    globalStyles: {
      primaryColor: '#1a1a2e',
      secondaryColor: '#e94560',
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
        fields: {
          title: { type: 'text', label: 'Title', value: 'Hello', editable: true },
        },
      },
    ],
    ...overrides,
  };
}

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

  it('errors when fields field is missing value', () => {
    const json = minimalJson();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (json.sections[0].fields.title as any).value = undefined;
    const result = validateContent(json);
    expect(result.errors.some((e) => e.code === 'MISSING_FIELD_VALUE')).toBe(true);
  });

  it('errors when fields field value is not a string', () => {
    const json = minimalJson();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (json.sections[0].fields.title as any).value = 42;
    const result = validateContent(json);
    expect(result.errors.some((e) => e.code === 'NON_STRING_FIELD_VALUE')).toBe(true);
  });
});

describe('validateContent — color fields (#56)', () => {
  it('errors when a color field value is not hex', () => {
    const json = minimalJson();
    json.sections[0].fields.accent = { type: 'color', label: 'Accent', value: 'red', editable: true };
    const result = validateContent(json);
    expect(result.errors.some((e) => e.code === 'INVALID_COLOR_FIELD')).toBe(true);
  });

  it('passes when a color field value is a valid hex', () => {
    const json = minimalJson();
    json.sections[0].fields.accent = { type: 'color', label: 'Accent', value: '#ff0066', editable: true };
    const result = validateContent(json);
    expect(result.errors.filter((e) => e.code === 'INVALID_COLOR_FIELD')).toHaveLength(0);
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

  it('errors on invalid fontSize', () => {
    const json = minimalJson();
    json.globalStyles.fontSize = 'big';
    const result = validateContent(json);
    expect(result.errors.some((e) => e.code === 'INVALID_FONT_SIZE')).toBe(true);
  });

  it('errors on unknown layout', () => {
    const json = minimalJson();
    json.globalStyles.layout = 'superwide';
    const result = validateContent(json);
    expect(result.errors.some((e) => e.code === 'UNKNOWN_LAYOUT')).toBe(true);
  });
});

describe('validateContent — library rules (Phase 6)', () => {
  const mockLibrary = {
    hero: {
      meta: {
        componentKey: 'hero',
        category: 'hero',
        label: 'Hero',
        fieldsSchema: {
          title: { type: 'text', label: 'Title', required: true },
          image: { type: 'image', label: 'Image', required: false },
        },
      },
    },
  } as unknown as TemplateLibrary;

  it('errors when componentKey is unknown', () => {
    const json = minimalJson();
    json.sections[0].type = 'unknown-comp';
    const result = validateContent(json, { templateLibrary: mockLibrary });
    expect(result.errors.some((e) => e.code === 'UNKNOWN_COMPONENT_KEY')).toBe(true);
  });

  it('errors when required field is missing', () => {
    const json = minimalJson();
    json.sections[0].fields = {}; // title is required
    const result = validateContent(json, { templateLibrary: mockLibrary });
    expect(result.errors.some((e) => e.code === 'MISSING_REQUIRED_FIELD')).toBe(true);
  });

  it('errors on field type mismatch', () => {
    const json = minimalJson();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (json.sections[0].fields.title as any).type = 'image'; // expected text
    const result = validateContent(json, { templateLibrary: mockLibrary });
    expect(result.errors.some((e) => e.code === 'FIELD_TYPE_MISMATCH')).toBe(true);
  });

  it('warns on unknown fields fields', () => {
    const json = minimalJson();
    json.sections[0].fields.extra = { type: 'text', label: 'Extra', value: '...', editable: true };
    const result = validateContent(json, { templateLibrary: mockLibrary });
    expect(result.warnings.some((w) => w.code === 'UNKNOWN_DATA_FIELD')).toBe(true);
  });
});

describe('validateContent — array fields', () => {
  const mockLibrary = {
    'menu-list': {
      meta: {
        componentKey: 'menu-list',
        category: 'menu',
        label: 'Menu List',
        fieldsSchema: {
          items: {
            type: 'array',
            label: 'Items',
            itemSchema: {
              title: { type: 'text', label: 'Title', required: true },
              price: { type: 'text', label: 'Price', required: false },
            },
            minItems: 1,
            maxItems: 2,
          },
        },
      },
    },
  } as unknown as TemplateLibrary;

  it('passes when array items are valid', () => {
    const json = minimalJson();
    json.sections[0].type = 'menu-list';
    json.sections[0].fields = {
      items: {
        type: 'array',
        label: 'Items',
        items: [
          { title: { type: 'text', label: 'Title', value: 'Coffee' } },
        ],
      },
    };
    const result = validateContent(json, { templateLibrary: mockLibrary });
    expect(result.errors).toHaveLength(0);
  });

  it('errors when items is not an array', () => {
    const json = minimalJson();
    json.sections[0].type = 'menu-list';
    json.sections[0].fields = {
      items: {
        type: 'array',
        label: 'Items',
        // @ts-expect-error intentional
        items: 'not-an-array',
      },
    };
    const result = validateContent(json, { templateLibrary: mockLibrary });
    expect(result.errors.some((e) => e.code === 'NON_ARRAY_FIELD_VALUE')).toBe(true);
  });

  it('errors when array item fails nested validation', () => {
    const json = minimalJson();
    json.sections[0].type = 'menu-list';
    json.sections[0].fields = {
      items: {
        type: 'array',
        label: 'Items',
        items: [
          { title: { type: 'text', label: 'Title', value: '' } },
        ],
      },
    };
    // Test missing required field
    (json.sections[0].fields.items as ArrayField).items[0] = {}; // title missing
    const result = validateContent(json, { templateLibrary: mockLibrary });
    expect(result.errors.some((e) => e.code === 'MISSING_REQUIRED_FIELD')).toBe(true);
    expect(result.errors.find((e) => e.code === 'MISSING_REQUIRED_FIELD')?.path).toContain('items.items[0].fields.title');
  });

  it('errors on minItems / maxItems violation', () => {
    const json = minimalJson();
    json.sections[0].type = 'menu-list';
    json.sections[0].fields = {
      items: {
        type: 'array',
        label: 'Items',
        items: [], // minItems is 1
      },
    };
    const resultMin = validateContent(json, { templateLibrary: mockLibrary });
    expect(resultMin.errors.some((e) => e.code === 'ARRAY_ITEMS_BELOW_MIN')).toBe(true);

    (json.sections[0].fields.items as ArrayField).items = [
      { title: { type: 'text', label: 'T', value: '1' } },
      { title: { type: 'text', label: 'T', value: '2' } },
      { title: { type: 'text', label: 'T', value: '3' } }, // maxItems is 2
    ];
    const resultMax = validateContent(json, { templateLibrary: mockLibrary });
    expect(resultMax.errors.some((e) => e.code === 'ARRAY_ITEMS_ABOVE_MAX')).toBe(true);
  });

  it('errors when itemSchema is missing in schema', () => {
    const brokenLibrary = {
      'broken-array': {
        meta: {
          componentKey: 'broken-array',
          fieldsSchema: {
            items: { type: 'array', label: 'Items' }, // missing itemSchema
          },
        },
      },
    } as unknown as TemplateLibrary;

    const json = minimalJson();
    json.sections[0].type = 'broken-array';
    json.sections[0].fields = {
      items: { type: 'array', label: 'Items', items: [] },
    };
    const result = validateContent(json, { templateLibrary: brokenLibrary });
    expect(result.errors.some((e) => e.code === 'MISSING_ITEM_SCHEMA')).toBe(true);
  });
});

describe('validateContent — warnings', () => {
  it('warns when image field uses http://', () => {
    const json = minimalJson();
    json.sections[0].fields.title = {
      type: 'image',
      label: 'Image',
      value: 'http://example.com/img.jpg',
      editable: true,
    };
    const result = validateContent(json);
    expect(result.warnings.some((w) => w.code === 'INSECURE_URL')).toBe(true);
  });
});

// ─── Integration: all 9 presets must have zero errors ──────────────

describe('all presets — errors must be zero', () => {
  const cases = [
    { name: 'corporate-default', preset: corporatePreset,  templateKey: 'corporate-default' },
    { name: 'cafe-default',      preset: cafePreset,       templateKey: 'cafe-default' },
    { name: 'fitness-default',   preset: fitnessPreset,    templateKey: 'fitness-default' },
    { name: 'interior-default',  preset: interiorPreset,   templateKey: 'interior-default' },
    { name: 'legal-default',     preset: legalPreset,      templateKey: 'legal-default' },
    { name: 'medical-default',   preset: medicalPreset,    templateKey: 'medical-default' },
    { name: 'wedding-default',   preset: weddingPreset,    templateKey: 'wedding-default' },
    { name: 'cafe-modern',       preset: cafeModernPreset, templateKey: 'cafe-modern' },
    { name: 'cafe-cozy',         preset: cafeCozyPreset,   templateKey: 'cafe-cozy' },
  ];

  for (const { name, preset, templateKey } of cases) {
    it(`${name} validates with no errors`, async () => {
      const templateLoader = templateMap[templateKey];
      const templateModule = templateLoader ? await templateLoader() : null;
      const templateLibrary = templateModule?.library;

      // The Preset carries the full content verbatim (code is source of truth).
      const content = preset.content;

      const result = validateContent(content, {
        availableTemplateKeys: ALL_TEMPLATE_KEYS,
        templateLibrary,
      });

      if (result.errors.length > 0) {
        console.error(`Errors in ${name}:`, result.errors);
      }
      expect(result.errors).toHaveLength(0);
    });
  }
});
