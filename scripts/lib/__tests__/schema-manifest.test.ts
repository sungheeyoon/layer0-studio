import { describe, expect, it } from 'vitest';

import type { FieldsSchema } from '@/domain/entities/template.entity';
import {
  createSchemaManifest,
  findMigrationEvidence,
  findBreakingSchemaChanges,
  serializeSchemaManifest,
  type SchemaManifest,
} from '../schema-manifest';

function manifest(fieldsSchema: FieldsSchema): SchemaManifest {
  return {
    version: 1,
    templates: {
      'test-default': {
        hero: fieldsSchema,
      },
    },
  };
}

describe('schema manifest generation', () => {
  it('sorts template, component, field, nested field, and descriptor keys deterministically', () => {
    const result = createSchemaManifest({
      'z-default': {
        zeta: {
          meta: {
            fieldsSchema: {
              items: {
                maxItems: 4,
                itemSchema: {
                  zebra: { label: 'Zebra', type: 'text' },
                  alpha: { required: true, label: 'Alpha', type: 'text' },
                },
                label: 'Items',
                type: 'array',
              },
              alpha: { required: true, label: 'Alpha', type: 'text' },
            },
          },
        },
      },
      'a-default': {
        beta: {
          meta: {
            fieldsSchema: {},
          },
        },
      },
    });

    expect(Object.keys(result.templates)).toEqual(['a-default', 'z-default']);
    expect(Object.keys(result.templates['z-default'])).toEqual(['zeta']);
    expect(Object.keys(result.templates['z-default'].zeta)).toEqual(['alpha', 'items']);
    const items = result.templates['z-default'].zeta.items;
    expect(Object.keys(items)).toEqual(['type', 'label', 'itemSchema', 'maxItems']);
    expect(items.type === 'array' && Object.keys(items.itemSchema)).toEqual(['alpha', 'zebra']);
    expect(serializeSchemaManifest(result)).toBe(`${JSON.stringify(result, null, 2)}\n`);
  });
});

describe('schema compatibility', () => {
  const base = manifest({
    title: { type: 'text', label: 'Title', required: true },
    subtitle: { type: 'textarea', label: 'Subtitle' },
    tone: { type: 'select', label: 'Tone', options: ['light', 'dark'] },
    items: {
      type: 'array',
      label: 'Items',
      itemSchema: {
        name: { type: 'text', label: 'Name', required: true },
      },
    },
  });

  it('allows optional fields, label changes, required relaxation, and select expansion', () => {
    const current = manifest({
      title: { type: 'text', label: 'Renamed label' },
      subtitle: { type: 'textarea', label: 'Subtitle' },
      tone: { type: 'select', label: 'Tone', options: ['dark', 'light', 'system'] },
      description: { type: 'textarea', label: 'Description' },
      items: {
        type: 'array',
        label: 'Items renamed',
        itemSchema: {
          name: { type: 'text', label: 'Display name', required: true },
          note: { type: 'text', label: 'Note' },
        },
      },
    });

    expect(findBreakingSchemaChanges(base, current)).toEqual([]);
  });

  it.each([
    ['field rename/removal', manifest({ heading: { type: 'text', label: 'Title', required: true } }), 'FIELD_REMOVED'],
    ['required field addition', manifest({ ...base.templates['test-default'].hero, cta: { type: 'text', label: 'CTA', required: true } }), 'REQUIRED_FIELD_ADDED'],
    ['existing field made required', manifest({ ...base.templates['test-default'].hero, subtitle: { type: 'textarea', label: 'Subtitle', required: true } }), 'FIELD_BECAME_REQUIRED'],
    ['value type change', manifest({ ...base.templates['test-default'].hero, title: { type: 'number', label: 'Title', default: 1, required: true } }), 'FIELD_TYPE_CHANGED'],
    ['select option narrowing', manifest({ ...base.templates['test-default'].hero, tone: { type: 'select', label: 'Tone', options: ['light'] } }), 'SELECT_OPTION_REMOVED'],
    ['array item schema change', manifest({ ...base.templates['test-default'].hero, items: { type: 'array', label: 'Items', itemSchema: {} } }), 'FIELD_REMOVED'],
  ])('rejects %s', (_name, current, expectedCode) => {
    expect(findBreakingSchemaChanges(base, current).map((change) => change.code)).toContain(expectedCode);
  });

  it('rejects removed templates and components', () => {
    const withoutTemplate: SchemaManifest = { version: 1, templates: {} };
    expect(findBreakingSchemaChanges(base, withoutTemplate)[0]?.code).toBe('TEMPLATE_REMOVED');

    const withoutComponent: SchemaManifest = {
      version: 1,
      templates: { 'test-default': {} },
    };
    expect(findBreakingSchemaChanges(base, withoutComponent)[0]?.code).toBe('COMPONENT_REMOVED');
  });
});

describe('breaking-change migration evidence', () => {
  it('requires a newly-added SQL and runbook pair with the same stem', () => {
    expect(findMigrationEvidence([
      'docs/migrations/027_change_schema.sql',
      'docs/migrations/027_change_schema.md',
      'docs/migrations/028_only_sql.sql',
      'docs/OTHER.md',
    ])).toEqual(['027_change_schema']);
  });
});
