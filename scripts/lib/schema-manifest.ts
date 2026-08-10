import type {
  FieldDescriptor,
  FieldsSchema,
} from '@/domain/entities/template.entity';

export const SCHEMA_MANIFEST_VERSION = 1 as const;

export interface SchemaManifest {
  version: typeof SCHEMA_MANIFEST_VERSION;
  templates: Record<string, Record<string, FieldsSchema>>;
}

interface SchemaLibraryEntry {
  meta: { fieldsSchema: FieldsSchema };
}

export type SchemaLibraries = Record<string, Record<string, SchemaLibraryEntry>>;

export type BreakingSchemaChangeCode =
  | 'TEMPLATE_REMOVED'
  | 'COMPONENT_REMOVED'
  | 'FIELD_REMOVED'
  | 'REQUIRED_FIELD_ADDED'
  | 'FIELD_BECAME_REQUIRED'
  | 'FIELD_TYPE_CHANGED'
  | 'SELECT_OPTION_REMOVED';

export interface BreakingSchemaChange {
  code: BreakingSchemaChangeCode;
  path: string;
  message: string;
}

/**
 * A deliberate breaking change must add the repository's normal migration
 * pair: executable SQL plus its runbook, sharing the same numeric/name stem.
 * This is evidence for review, not a claim that CI can prove the SQL is right.
 */
export function findMigrationEvidence(paths: string[]): string[] {
  const extensionsByStem = new Map<string, Set<string>>();
  for (const path of paths) {
    const match = /^docs\/migrations\/(.+)\.(sql|md)$/.exec(path);
    if (!match) continue;
    const [, stem, extension] = match;
    const extensions = extensionsByStem.get(stem) ?? new Set<string>();
    extensions.add(extension);
    extensionsByStem.set(stem, extensions);
  }
  return [...extensionsByStem.entries()]
    .filter(([, extensions]) => extensions.has('sql') && extensions.has('md'))
    .map(([stem]) => stem)
    .sort();
}

function sortedEntries<T>(record: Readonly<Record<string, T>>): Array<[string, T]> {
  return Object.entries(record).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
}

function normalizeDescriptor(descriptor: FieldDescriptor): FieldDescriptor {
  const common = {
    type: descriptor.type,
    label: descriptor.label,
    ...(descriptor.required === undefined ? {} : { required: descriptor.required }),
    ...(descriptor.editable === undefined ? {} : { editable: descriptor.editable }),
  };

  switch (descriptor.type) {
    case 'select':
      return { ...common, type: 'select', options: [...descriptor.options] };
    case 'number':
      return { ...common, type: 'number', default: descriptor.default };
    case 'array':
      return {
        ...common,
        type: 'array',
        itemSchema: normalizeFieldsSchema(descriptor.itemSchema),
        ...(descriptor.minItems === undefined ? {} : { minItems: descriptor.minItems }),
        ...(descriptor.maxItems === undefined ? {} : { maxItems: descriptor.maxItems }),
      };
    default:
      return {
        type: descriptor.type,
        label: descriptor.label,
        ...(descriptor.required === undefined ? {} : { required: descriptor.required }),
        ...(descriptor.editable === undefined ? {} : { editable: descriptor.editable }),
      };
  }
}

export function normalizeFieldsSchema(schema: FieldsSchema): FieldsSchema {
  return Object.fromEntries(
    sortedEntries(schema).map(([key, descriptor]) => [key, normalizeDescriptor(descriptor)]),
  );
}

/** Build the committed, deterministic `templateKey → componentKey → fieldsSchema` snapshot. */
export function createSchemaManifest(libraries: SchemaLibraries): SchemaManifest {
  return {
    version: SCHEMA_MANIFEST_VERSION,
    templates: Object.fromEntries(
      sortedEntries(libraries).map(([templateKey, library]) => [
        templateKey,
        Object.fromEntries(
          sortedEntries(library).map(([componentKey, entry]) => [
            componentKey,
            normalizeFieldsSchema(entry.meta.fieldsSchema),
          ]),
        ),
      ]),
    ),
  };
}

export function serializeSchemaManifest(manifest: SchemaManifest): string {
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

function compareFieldsSchema(
  previous: FieldsSchema,
  current: FieldsSchema,
  parentPath: string,
  changes: BreakingSchemaChange[],
): void {
  for (const [fieldKey, previousDescriptor] of sortedEntries(previous)) {
    const path = `${parentPath}.${fieldKey}`;
    const currentDescriptor = current[fieldKey];

    if (!currentDescriptor) {
      changes.push({
        code: 'FIELD_REMOVED',
        path,
        message: `${path}: field was removed or renamed`,
      });
      continue;
    }

    if (previousDescriptor.type !== currentDescriptor.type) {
      changes.push({
        code: 'FIELD_TYPE_CHANGED',
        path,
        message: `${path}: value type changed from ${previousDescriptor.type} to ${currentDescriptor.type}`,
      });
      continue;
    }

    if (previousDescriptor.required !== true && currentDescriptor.required === true) {
      changes.push({
        code: 'FIELD_BECAME_REQUIRED',
        path,
        message: `${path}: existing optional field became required`,
      });
    }

    if (previousDescriptor.type === 'select' && currentDescriptor.type === 'select') {
      const currentOptions = new Set(currentDescriptor.options);
      for (const option of previousDescriptor.options) {
        if (!currentOptions.has(option)) {
          changes.push({
            code: 'SELECT_OPTION_REMOVED',
            path,
            message: `${path}: select option ${JSON.stringify(option)} was removed`,
          });
        }
      }
    }

    if (previousDescriptor.type === 'array' && currentDescriptor.type === 'array') {
      compareFieldsSchema(
        previousDescriptor.itemSchema,
        currentDescriptor.itemSchema,
        `${path}[]`,
        changes,
      );
    }
  }

  for (const [fieldKey, currentDescriptor] of sortedEntries(current)) {
    if (previous[fieldKey] || currentDescriptor.required !== true) continue;
    const path = `${parentPath}.${fieldKey}`;
    changes.push({
      code: 'REQUIRED_FIELD_ADDED',
      path,
      message: `${path}: new field is required`,
    });
  }
}

/** Compare a base-branch manifest with the current one and return only breaking changes. */
export function findBreakingSchemaChanges(
  previous: SchemaManifest,
  current: SchemaManifest,
): BreakingSchemaChange[] {
  const changes: BreakingSchemaChange[] = [];

  for (const [templateKey, previousLibrary] of sortedEntries(previous.templates)) {
    const currentLibrary = current.templates[templateKey];
    if (!currentLibrary) {
      changes.push({
        code: 'TEMPLATE_REMOVED',
        path: templateKey,
        message: `${templateKey}: template was removed or renamed`,
      });
      continue;
    }

    for (const [componentKey, previousSchema] of sortedEntries(previousLibrary)) {
      const currentSchema = currentLibrary[componentKey];
      const componentPath = `${templateKey}.${componentKey}`;
      if (!currentSchema) {
        changes.push({
          code: 'COMPONENT_REMOVED',
          path: componentPath,
          message: `${componentPath}: component was removed or renamed`,
        });
        continue;
      }
      compareFieldsSchema(previousSchema, currentSchema, componentPath, changes);
    }
  }

  return changes;
}
