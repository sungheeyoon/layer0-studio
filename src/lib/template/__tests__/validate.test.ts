import { describe, it, expect } from 'vitest';
import { validateTemplateJson } from '../validate';
import { TemplateJson } from '@/domain/entities/template.entity';
import type { ThemeLibrary } from '@/themes/types';

// -- All 7 presets + their slots --
import corporatePreset from '@/themes/corporate/presets/default.preset';
import { slots as corporateSlots } from '@/themes/corporate/slots';
import cafePreset from '@/themes/cafe/presets/default.preset';
import { slots as cafeSlots } from '@/themes/cafe/slots';
import fitnessPreset from '@/themes/fitness/presets/default.preset';
import { slots as fitnessSlots } from '@/themes/fitness/slots';
import interiorPreset from '@/themes/interior/presets/default.preset';
import { slots as interiorSlots } from '@/themes/interior/slots';
import legalPreset from '@/themes/legal/presets/default.preset';
import { slots as legalSlots } from '@/themes/legal/slots';
import medicalPreset from '@/themes/medical/presets/default.preset';
import { slots as medicalSlots } from '@/themes/medical/slots';
import weddingPreset from '@/themes/wedding/presets/default.preset';
import { slots as weddingSlots } from '@/themes/wedding/slots';

const ALL_THEME_KEYS = ['cafe', 'corporate', 'fitness', 'interior', 'legal', 'medical', 'wedding'];

function minimalJson(overrides: Partial<TemplateJson> = {}): TemplateJson {
  return {
    themeKey: 'corporate',
    globalStyles: {
      primaryColor: '#1a1a2e',
      secondaryColor: '#e94560',
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      layout: 'wide',
    },
    pages: [
      {
        id: 'home',
        title: 'Home',
        slug: '/',
        order: 0,
        sections: [
          {
            id: 'hero-001',
            type: 'hero',
            order: 0,
            visible: true,
            editable: true,
            data: {
              title: { type: 'text', label: 'Title', value: 'Hello', editable: true },
            },
          },
        ],
      },
    ],
    ...overrides,
  };
}

// ─── Unit tests ────────────────────────────────────────────────────

describe('validateTemplateJson — structure', () => {
  it('passes a well-formed JSON with no options', () => {
    const result = validateTemplateJson(minimalJson());
    expect(result.errors).toHaveLength(0);
  });

  it('errors when pages is empty', () => {
    const result = validateTemplateJson(minimalJson({ pages: [] }));
    expect(result.errors.some((e) => e.code === 'PAGES_EMPTY')).toBe(true);
  });

  it('errors on duplicate page slugs', () => {
    const json = minimalJson();
    json.pages.push({ ...json.pages[0], id: 'home-2' }); // same slug
    const result = validateTemplateJson(json);
    expect(result.errors.some((e) => e.code === 'DUPLICATE_PAGE_SLUG')).toBe(true);
  });

  it('errors on duplicate section ids within a page', () => {
    const json = minimalJson();
    json.pages[0].sections.push({ ...json.pages[0].sections[0] }); // same id
    const result = validateTemplateJson(json);
    expect(result.errors.some((e) => e.code === 'DUPLICATE_SECTION_ID')).toBe(true);
  });

  it('errors when data field is missing value', () => {
    const json = minimalJson();
    // @ts-expect-error intentional bad data
    json.pages[0].sections[0].data.title.value = undefined;
    const result = validateTemplateJson(json);
    expect(result.errors.some((e) => e.code === 'MISSING_FIELD_VALUE')).toBe(true);
  });

  it('errors when data field value is not a string', () => {
    const json = minimalJson();
    // @ts-expect-error intentional bad data
    json.pages[0].sections[0].data.title.value = 42;
    const result = validateTemplateJson(json);
    expect(result.errors.some((e) => e.code === 'NON_STRING_FIELD_VALUE')).toBe(true);
  });
});

describe('validateTemplateJson — themeKey', () => {
  it('errors when themeKey is not in availableThemeKeys', () => {
    const result = validateTemplateJson(minimalJson(), { availableThemeKeys: ['cafe'] });
    expect(result.errors.some((e) => e.code === 'UNKNOWN_THEME_KEY')).toBe(true);
  });

  it('passes when themeKey is in availableThemeKeys', () => {
    const result = validateTemplateJson(minimalJson(), { availableThemeKeys: ['corporate'] });
    expect(result.errors.filter((e) => e.code === 'UNKNOWN_THEME_KEY')).toHaveLength(0);
  });

  it('skips themeKey check when availableThemeKeys is not provided', () => {
    const result = validateTemplateJson(minimalJson({ themeKey: 'nonexistent' }));
    expect(result.errors.filter((e) => e.code === 'UNKNOWN_THEME_KEY')).toHaveLength(0);
  });
});

describe('validateTemplateJson — globalStyles', () => {
  it('errors when globalStyles is missing', () => {
    const json = minimalJson();
    // @ts-expect-error intentional
    delete json.globalStyles;
    const result = validateTemplateJson(json);
    expect(result.errors.some((e) => e.code === 'MISSING_GLOBAL_STYLES')).toBe(true);
  });

  it('warns on non-hex primaryColor', () => {
    const json = minimalJson();
    json.globalStyles.primaryColor = 'red';
    const result = validateTemplateJson(json);
    expect(result.warnings.some((w) => w.code === 'NON_HEX_COLOR')).toBe(true);
    expect(result.errors.filter((e) => e.code === 'INVALID_COLOR')).toHaveLength(0);
  });

  it('errors on invalid fontSize', () => {
    const json = minimalJson();
    json.globalStyles.fontSize = 'big';
    const result = validateTemplateJson(json);
    expect(result.errors.some((e) => e.code === 'INVALID_FONT_SIZE')).toBe(true);
  });

  it('errors on unknown layout', () => {
    const json = minimalJson();
    json.globalStyles.layout = 'superwide';
    const result = validateTemplateJson(json);
    expect(result.errors.some((e) => e.code === 'UNKNOWN_LAYOUT')).toBe(true);
  });
});

describe('validateTemplateJson — slot rules (with themeSlots)', () => {
  const slots = [
    { type: 'hero', required: true },
    { type: 'about', required: false },
  ];

  it('errors when section.type is unknown', () => {
    const json = minimalJson();
    json.pages[0].sections[0].type = 'unicorn';
    const result = validateTemplateJson(json, { themeSlots: slots });
    expect(result.errors.some((e) => e.code === 'UNKNOWN_SECTION_TYPE')).toBe(true);
  });

  it('errors when required slot is absent from a page', () => {
    const json = minimalJson();
    json.pages[0].sections[0].type = 'about'; // hero is required but missing now
    const result = validateTemplateJson(json, { themeSlots: slots });
    expect(result.errors.some((e) => e.code === 'MISSING_REQUIRED_SLOT')).toBe(true);
  });
});

describe('validateTemplateJson — warnings', () => {
  it('warns when image field uses http://', () => {
    const json = minimalJson();
    json.pages[0].sections[0].data.title = {
      type: 'image',
      label: 'Image',
      value: 'http://example.com/img.jpg',
      editable: true,
    };
    const result = validateTemplateJson(json);
    expect(result.warnings.some((w) => w.code === 'INSECURE_URL')).toBe(true);
  });

  it('warns when section has an order field (deprecated)', () => {
    const json = minimalJson();
    json.pages[0].sections[0].order = 1;
    const result = validateTemplateJson(json);
    expect(result.warnings.some((w) => w.code === 'DEPRECATED_SECTION_ORDER')).toBe(true);
  });
});

describe('validateTemplateJson — library rules (Phase 6)', () => {
  const mockLibrary = {
    hero: {
      meta: {
        componentKey: 'hero',
        category: 'hero',
        label: 'Hero',
        dataSchema: {
          title: { type: 'text', label: 'Title', required: true },
          image: { type: 'image', label: 'Image', required: false },
        },
      },
    },
  } as unknown as ThemeLibrary;

  it('errors when componentKey is unknown', () => {
    const json = minimalJson();
    json.pages[0].sections[0].type = 'unknown-comp';
    const result = validateTemplateJson(json, { themeLibrary: mockLibrary });
    expect(result.errors.some((e) => e.code === 'UNKNOWN_COMPONENT_KEY')).toBe(true);
  });

  it('errors when required field is missing', () => {
    const json = minimalJson();
    json.pages[0].sections[0].data = {}; // title is required
    const result = validateTemplateJson(json, { themeLibrary: mockLibrary });
    expect(result.errors.some((e) => e.code === 'MISSING_REQUIRED_FIELD')).toBe(true);
  });

  it('errors on field type mismatch', () => {
    const json = minimalJson();
    // @ts-expect-error intentional bad data
    json.pages[0].sections[0].data.title.type = 'image'; // expected text
    const result = validateTemplateJson(json, { themeLibrary: mockLibrary });
    expect(result.errors.some((e) => e.code === 'FIELD_TYPE_MISMATCH')).toBe(true);
  });

  it('warns on unknown data fields', () => {
    const json = minimalJson();
    json.pages[0].sections[0].data.extra = { type: 'text', label: 'Extra', value: '...', editable: true };
    const result = validateTemplateJson(json, { themeLibrary: mockLibrary });
    expect(result.warnings.some((w) => w.code === 'UNKNOWN_DATA_FIELD')).toBe(true);
  });
});

// ─── Integration: all 7 presets must have zero errors ──────────────

describe('all presets — errors must be zero', () => {
  const cases = [
    { name: 'corporate-default', preset: corporatePreset, slots: corporateSlots },
    { name: 'cafe-default',      preset: cafePreset,      slots: cafeSlots },
    { name: 'fitness-default',   preset: fitnessPreset,   slots: fitnessSlots },
    { name: 'interior-default',  preset: interiorPreset,  slots: interiorSlots },
    { name: 'legal-default',     preset: legalPreset,     slots: legalSlots },
    { name: 'medical-default',   preset: medicalPreset,   slots: medicalSlots },
    { name: 'wedding-default',   preset: weddingPreset,   slots: weddingSlots },
  ];

  for (const { name, preset, slots } of cases) {
    it(`${name} validates with no errors`, () => {
      const result = validateTemplateJson(preset.templateJson, {
        availableThemeKeys: ALL_THEME_KEYS,
        themeSlots: slots,
      });
      if (result.errors.length > 0) {
        console.error(`Errors in ${name}:`, result.errors);
      }
      expect(result.errors).toHaveLength(0);
    });
  }
});
