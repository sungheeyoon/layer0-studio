import { TemplateJson, TemplateField } from '@/domain/entities/template.entity';
import { TemplateLibrary, SectionDataSchema } from '@/themes/types';

export interface ValidationIssue {
  code: string;
  message: string;
  path?: string;
}

export interface ValidationResult {
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export interface SlotDefinition {
  type: string;
  required: boolean;
}

export interface ValidateOptions {
  /** When provided, templateKey must be in this list. */
  availableTemplateKeys?: string[];
  /** Phase 6: Provides component library and their data schemas for deep validation. */
  templateLibrary?: TemplateLibrary;
}

const KNOWN_LAYOUTS = ['wide', 'narrow', 'asymmetric', 'default', 'full'];
const HEX_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
const CSS_LENGTH_RE = /^[\d.]+(%|px|rem|em|vw|vh|ch)$/;

export function validateTemplateJson(
  json: TemplateJson,
  options: ValidateOptions = {},
): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  const err = (code: string, message: string, path?: string) =>
    errors.push({ code, message, path });
  const warn = (code: string, message: string, path?: string) =>
    warnings.push({ code, message, path });

  // Rule 1: templateKey must be in availableTemplateKeys when provided
  if (options.availableTemplateKeys && !options.availableTemplateKeys.includes(json.templateKey)) {
    err('UNKNOWN_TEMPLATE_KEY', `templateKey "${json.templateKey}" not found in registry`, 'templateKey');
  }

  // Rule 6 (a): pages must be a non-empty array
  if (!Array.isArray(json.pages) || json.pages.length === 0) {
    err('PAGES_EMPTY', 'pages array must contain at least one page', 'pages');
    return { errors, warnings };
  }

  // Rule 7: globalStyles required and typed
  if (!json.globalStyles) {
    err('MISSING_GLOBAL_STYLES', 'globalStyles is required', 'globalStyles');
  } else {
    const gs = json.globalStyles;

    if (!gs.primaryColor) {
      err('INVALID_COLOR', 'globalStyles.primaryColor is required', 'globalStyles.primaryColor');
    } else if (!HEX_RE.test(gs.primaryColor)) {
      warn('NON_HEX_COLOR', `globalStyles.primaryColor "${gs.primaryColor}" is not a hex color`, 'globalStyles.primaryColor');
    }

    if (!gs.secondaryColor) {
      err('INVALID_COLOR', 'globalStyles.secondaryColor is required', 'globalStyles.secondaryColor');
    } else if (!HEX_RE.test(gs.secondaryColor)) {
      warn('NON_HEX_COLOR', `globalStyles.secondaryColor "${gs.secondaryColor}" is not a hex color`, 'globalStyles.secondaryColor');
    }

    if (gs.fontSize && !CSS_LENGTH_RE.test(gs.fontSize)) {
      err('INVALID_FONT_SIZE', `globalStyles.fontSize "${gs.fontSize}" is not a valid CSS length`, 'globalStyles.fontSize');
    }

    if (gs.layout && !KNOWN_LAYOUTS.includes(gs.layout)) {
      err('UNKNOWN_LAYOUT', `globalStyles.layout "${gs.layout}" is not in allowed values: ${KNOWN_LAYOUTS.join(', ')}`, 'globalStyles.layout');
    }
  }

  // Rule 6 (b): page.slug must be unique across all pages
  const pageSlugs = new Set<string>();
  for (const page of json.pages) {
    if (pageSlugs.has(page.slug)) {
      err('DUPLICATE_PAGE_SLUG', `page slug "${page.slug}" is not unique`, `pages[slug=${page.slug}]`);
    }
    pageSlugs.add(page.slug);
  }

  for (const page of json.pages) {
    const pageRef = `pages[slug=${page.slug}]`;
    const sectionIds = new Set<string>();

    for (const section of page.sections) {
      const secRef = `${pageRef}.sections[id=${section.id}]`;

      // Rule 4: section.id must be unique within the page
      if (sectionIds.has(section.id)) {
        err('DUPLICATE_SECTION_ID', `section id "${section.id}" is not unique in page "${page.slug}"`, secRef);
      }
      sectionIds.add(section.id);

      // Rule 2: section.type must be in templateLibrary (Phase 6)
      if (options.templateLibrary) {
        const entry = options.templateLibrary[section.type];
        if (!entry) {
          err(
            'UNKNOWN_COMPONENT_KEY',
            `componentKey "${section.type}" not found in template library for "${json.templateKey}"`,
            `${secRef}.type`,
          );
        } else {
          // Rule 2-bis: data schema validation
          const validateSchemaRecursively = (
            schema: SectionDataSchema,
            data: Record<string, TemplateField>,
            ref: string,
          ) => {
            for (const [fieldKey, fieldSchema] of Object.entries(schema)) {
              const field = data[fieldKey];
              const fieldRef = `${ref}.data.${fieldKey}`;

              if (!field && fieldSchema.required) {
                err(
                  'MISSING_REQUIRED_FIELD',
                  `required field "${fieldKey}" is missing`,
                  fieldRef,
                );
              } else if (field) {
                if (field.type !== fieldSchema.type) {
                  err(
                    'FIELD_TYPE_MISMATCH',
                    `field "${fieldKey}" type mismatch: expected ${fieldSchema.type}, got ${field.type}`,
                    fieldRef,
                  );
                }

                if (fieldSchema.type === 'array') {
                  if (!fieldSchema.itemSchema) {
                    err(
                      'MISSING_ITEM_SCHEMA',
                      `schema for array field "${fieldKey}" is missing itemSchema`,
                      fieldRef,
                    );
                  } else if (field.type === 'array') {
                    if (!Array.isArray(field.items)) {
                      err(
                        'NON_ARRAY_FIELD_VALUE',
                        `field "${fieldKey}" value must be an array of items`,
                        fieldRef,
                      );
                    } else {
                      if (fieldSchema.minItems !== undefined && field.items.length < fieldSchema.minItems) {
                        err(
                          'ARRAY_ITEMS_BELOW_MIN',
                          `field "${fieldKey}" must have at least ${fieldSchema.minItems} items`,
                          fieldRef,
                        );
                      }
                      if (fieldSchema.maxItems !== undefined && field.items.length > fieldSchema.maxItems) {
                        err(
                          'ARRAY_ITEMS_ABOVE_MAX',
                          `field "${fieldKey}" must have no more than ${fieldSchema.maxItems} items`,
                          fieldRef,
                        );
                      }

                      // Recursive validation of items
                      field.items.forEach((item, index) => {
                        validateSchemaRecursively(
                          fieldSchema.itemSchema!,
                          item,
                          `${fieldRef}.items[${index}]`,
                        );
                      });
                    }
                  }
                }
              }
            }

            // Warn on unknown fields
            for (const fieldKey of Object.keys(data)) {
              if (!schema[fieldKey]) {
                warn(
                  'UNKNOWN_DATA_FIELD',
                  `field "${fieldKey}" is not defined in component schema`,
                  `${ref}.data.${fieldKey}`,
                );
              }
            }
          };

          validateSchemaRecursively(entry.meta.dataSchema, section.data, secRef);
        }
      }

      // Rules 5 & 8: basic data integrity
      for (const [fieldKey, field] of Object.entries(section.data)) {
        const fieldRef = `${secRef}.data.${fieldKey}`;

        if (!field.type) {
          err('MISSING_FIELD_TYPE', `data field "${fieldKey}" is missing type`, fieldRef);
        }
        if (field.label === undefined || field.label === null) {
          err('MISSING_FIELD_LABEL', `data field "${fieldKey}" is missing label`, fieldRef);
        }

        if (field.type === 'array') {
          // Array fields don't have a 'value' property, they have 'items'
          if (field.items === undefined || field.items === null) {
            err('NON_ARRAY_FIELD_VALUE', `array field "${fieldKey}" is missing items`, fieldRef);
          } else if (!Array.isArray(field.items)) {
            err('NON_ARRAY_FIELD_VALUE', `array field "${fieldKey}" items must be an array`, fieldRef);
          }
        } else {
          if (field.value === undefined || field.value === null) {
            err('MISSING_FIELD_VALUE', `data field "${fieldKey}" is missing value`, fieldRef);
          } else if (typeof field.value !== 'string') {
            err(
              'NON_STRING_FIELD_VALUE',
              `data field "${fieldKey}" value must be a string (got ${typeof field.value})`,
              fieldRef,
            );
          }

          // Rule 10: image/url fields should use https (warn only)
          if ((field.type === 'image' || field.type === 'url') && typeof field.value === 'string') {
            if (field.value.startsWith('http://')) {
              warn(
                'INSECURE_URL',
                `data field "${fieldKey}" uses http:// — prefer https to avoid mixed-content issues`,
                fieldRef,
              );
            }
          }
        }
      }
    }
  }

  return { errors, warnings };
}
