import { TemplateJson } from '@/domain/entities/template.entity';

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
  /** When provided, themeKey must be in this list. */
  availableThemeKeys?: string[];
  /** When provided, section.type is checked against this list and required slots are enforced. */
  themeSlots?: SlotDefinition[];
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

  // Rule 1: themeKey must be in availableThemeKeys when provided
  if (options.availableThemeKeys && !options.availableThemeKeys.includes(json.themeKey)) {
    err('UNKNOWN_THEME_KEY', `themeKey "${json.themeKey}" not found in registry`, 'themeKey');
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

  const slotTypeSet = options.themeSlots
    ? new Set(options.themeSlots.map((s) => s.type))
    : null;
  const requiredSlotTypes = options.themeSlots
    ? options.themeSlots.filter((s) => s.required).map((s) => s.type)
    : [];

  for (const page of json.pages) {
    const pageRef = `pages[slug=${page.slug}]`;

    // Rule 3: required slots must appear in every page
    if (requiredSlotTypes.length > 0) {
      const presentTypes = new Set(page.sections.map((s) => s.type));
      for (const reqType of requiredSlotTypes) {
        if (!presentTypes.has(reqType)) {
          err(
            'MISSING_REQUIRED_SLOT',
            `Page "${page.slug}" is missing required section type "${reqType}"`,
            `${pageRef}.sections`,
          );
        }
      }
    }

    const sectionIds = new Set<string>();

    for (const section of page.sections) {
      const secRef = `${pageRef}.sections[id=${section.id}]`;

      // Rule 4: section.id must be unique within the page
      if (sectionIds.has(section.id)) {
        err('DUPLICATE_SECTION_ID', `section id "${section.id}" is not unique in page "${page.slug}"`, secRef);
      }
      sectionIds.add(section.id);

      // Rule 2: section.type must be in themeSlots when provided
      if (slotTypeSet && !slotTypeSet.has(section.type)) {
        err(
          'UNKNOWN_SECTION_TYPE',
          `section type "${section.type}" is not defined in theme slots for "${json.themeKey}"`,
          `${secRef}.type`,
        );
      }

      // Rule 9: section.order is deprecated — renderer ignores it (warn only)
      if (section.order !== undefined) {
        warn(
          'DEPRECATED_SECTION_ORDER',
          `section "${section.id}" has an order field — render order is determined by array position`,
          `${secRef}.order`,
        );
      }

      // Rules 5 & 8: data fields must have type/label/value, and value must be a string
      for (const [fieldKey, field] of Object.entries(section.data)) {
        const fieldRef = `${secRef}.data.${fieldKey}`;

        if (!field.type) {
          err('MISSING_FIELD_TYPE', `data field "${fieldKey}" is missing type`, fieldRef);
        }
        if (field.label === undefined || field.label === null) {
          err('MISSING_FIELD_LABEL', `data field "${fieldKey}" is missing label`, fieldRef);
        }
        if (field.value === undefined || field.value === null) {
          err('MISSING_FIELD_VALUE', `data field "${fieldKey}" is missing value`, fieldRef);
        } else if (typeof field.value !== 'string') {
          err('NON_STRING_FIELD_VALUE', `data field "${fieldKey}" value must be a string (got ${typeof field.value})`, fieldRef);
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

  return { errors, warnings };
}
