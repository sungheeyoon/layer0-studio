import {
  ContentModel,
  Section,
  FieldDescriptor,
  FieldsSchema,
} from '@/domain/entities/template.entity';
import {
  SiteContentValidationIssue,
  SiteContentValidationResult,
} from '@/domain/usecases/ports/site-content-validator.port';
import { TemplateLibrary } from '@/templates/types';

/**
 * The validation result vocabulary is owned by the domain port
 * (`SiteContentValidator`). These aliases preserve the historical names used
 * across the template/sync code without duplicating the contract.
 */
export type ValidationIssue = SiteContentValidationIssue;
export type ValidationResult = SiteContentValidationResult;

export interface SlotDefinition {
  type: string;
  required: boolean;
}

export interface ValidateOptions {
  /** When provided, templateKey must be in this list. */
  availableTemplateKeys?: string[];
  /** Phase 6: Provides component library and their fields schemas for deep validation. */
  templateLibrary?: TemplateLibrary;
  /**
   * The Template's own `defaultGlobalStyles.backgroundColor`. Only the
   * background-polarity rule reads it; omit it and that rule stays silent
   * rather than guessing (a wrong warning is worse than none).
   */
  templateDefaultBackground?: string;
}

const KNOWN_LAYOUTS = ['wide', 'narrow', 'asymmetric', 'default', 'full'];
const HEX_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
const CSS_LENGTH_RE = /^[\d.]+(%|px|rem|em|vw|vh|ch)$/;
/** `assets.id` is a Postgres uuid; `asset_usages.asset_id` references it. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * WCAG relative luminance, 0 (black) … 1 (white). Returns null for anything
 * that is not a 3- or 6-digit hex colour.
 */
function relativeLuminance(hex: string): number | null {
  if (!HEX_RE.test(hex)) return null;

  let body = hex.slice(1);
  if (body.length === 3) body = body.split('').map((c) => c + c).join('');

  const channel = (pair: string) => {
    const srgb = parseInt(pair, 16) / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };

  return (
    0.2126 * channel(body.slice(0, 2)) +
    0.7152 * channel(body.slice(2, 4)) +
    0.0722 * channel(body.slice(4, 6))
  );
}

/**
 * WCAG's own light/dark split: the luminance at which black and white text
 * contrast equally (√(1.05 × 0.05) − 0.05).
 */
const LUMINANCE_MIDPOINT = 0.1791;

/**
 * One Block's stored data as the domain holds it (ADR-0016 §4-2): opaque Values
 * keyed by field name. The schema — not the data — says what each one should be,
 * so everything here is `unknown` until a `FieldDescriptor` says otherwise.
 */
type BlockValues = Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** What a rejected Value actually was, for the error message. */
function describeValue(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

export function validateContent(
  json: ContentModel,
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

  // Rule 6 (a): mode-specific top-level shape must be present
  if (json.mode === 'single') {
    if (!Array.isArray(json.sections) || json.sections.length === 0) {
      err('SECTIONS_EMPTY', 'sections array must contain at least one section', 'sections');
      return { errors, warnings };
    }
  } else if (json.mode === 'multi') {
    if (!Array.isArray(json.pages) || json.pages.length === 0) {
      err('PAGES_EMPTY', 'pages array must contain at least one page', 'pages');
      return { errors, warnings };
    }
  } else {
    err('UNKNOWN_MODE', `content.mode "${(json as { mode?: string }).mode}" is not 'single' | 'multi'`, 'mode');
    return { errors, warnings };
  }

  // Rule 7: globalStyles required and typed
  if (!json.globalStyles) {
    err('MISSING_GLOBAL_STYLES', 'globalStyles is required', 'globalStyles');
  } else {
    const gs = json.globalStyles;

    // The four rules below are WARNINGS, not errors — see ADR-0015. Each is
    // reachable from a free-text editor input, and the worst outcome of saving
    // one is a CSS custom property that renders at its fallback. Blocking the
    // save instead held every *other* edit in the same ContentModel hostage to
    // one typo, which is the strictly worse failure.
    if (!gs.primaryColor) {
      warn('INVALID_COLOR', 'globalStyles.primaryColor is required', 'globalStyles.primaryColor');
    } else if (!HEX_RE.test(gs.primaryColor)) {
      warn('NON_HEX_COLOR', `globalStyles.primaryColor "${gs.primaryColor}" is not a hex color`, 'globalStyles.primaryColor');
    }

    if (!gs.secondaryColor) {
      warn('INVALID_COLOR', 'globalStyles.secondaryColor is required', 'globalStyles.secondaryColor');
    } else if (!HEX_RE.test(gs.secondaryColor)) {
      warn('NON_HEX_COLOR', `globalStyles.secondaryColor "${gs.secondaryColor}" is not a hex color`, 'globalStyles.secondaryColor');
    }

    // Deliberately no "required" warning here, unlike primary/secondary above.
    // `backgroundColor` was added after Sites already existed, and those rows
    // legitimately carry no value — every render path falls back to the
    // Template default. Flagging that would put a permanent warning on every
    // pre-existing Site for something the owner did not do and need not fix.
    if (gs.backgroundColor && !HEX_RE.test(gs.backgroundColor)) {
      warn('NON_HEX_COLOR', `globalStyles.backgroundColor "${gs.backgroundColor}" is not a hex color`, 'globalStyles.backgroundColor');
    }

    // A Template's text tokens (`ink`, `muted`, `dust`, …) are code-owned and
    // tuned for the luminance of its own default background. Only the tonal
    // *surface* siblings derive from the user's pick. So crossing the light/dark
    // midpoint leaves the text where it was — dark type on a dark page.
    //
    // Warned, never blocked: a deliberately inverted palette is a legitimate
    // taste call, and the renderer still works (ADR-0015 rule 4). Silent when
    // the Template default is unknown, so no caller gets a guessed warning.
    if (options.templateDefaultBackground && gs.backgroundColor) {
      const chosen = relativeLuminance(gs.backgroundColor);
      const base = relativeLuminance(options.templateDefaultBackground);
      if (
        chosen !== null && base !== null &&
        (chosen > LUMINANCE_MIDPOINT) !== (base > LUMINANCE_MIDPOINT)
      ) {
        warn(
          'BACKGROUND_POLARITY_FLIPPED',
          `globalStyles.backgroundColor "${gs.backgroundColor}" flips this template from a ${base > LUMINANCE_MIDPOINT ? 'light' : 'dark'} background to a ${chosen > LUMINANCE_MIDPOINT ? 'light' : 'dark'} one; its text colours do not follow`,
          'globalStyles.backgroundColor',
        );
      }
    }

    if (gs.fontSize && !CSS_LENGTH_RE.test(gs.fontSize)) {
      warn('INVALID_FONT_SIZE', `globalStyles.fontSize "${gs.fontSize}" is not a valid CSS length`, 'globalStyles.fontSize');
    }

    // `layout` is read by no renderer at all — it is injected as no CSS variable
    // by any of the four render paths and appears in no OVERLAY_MAP entry. A
    // field nothing consumes has no standing to block a save.
    if (gs.layout && !KNOWN_LAYOUTS.includes(gs.layout)) {
      warn('UNKNOWN_LAYOUT', `globalStyles.layout "${gs.layout}" is not in allowed values: ${KNOWN_LAYOUTS.join(', ')}`, 'globalStyles.layout');
    }
  }

  /**
   * One stored Value against the descriptor that owns it (ADR-0016 §4).
   *
   * Blocking vs warning follows ADR-0015 rule 4 — a rule blocks the save only
   * when the shape would break the renderer, which after ADR-0016 §6 casts
   * `block.fields` without re-checking it. A Value of the wrong *shape* is the
   * thing that crashes it (`.map` on a string, `.url` on `undefined`); a Value
   * of the right shape carrying a surprising *content* only looks wrong.
   */
  const validateValue = (
    descriptor: FieldDescriptor,
    value: unknown,
    fieldKey: string,
    fieldRef: string,
  ) => {
    const mismatch = (expected: string) =>
      err(
        'FIELD_VALUE_TYPE_MISMATCH',
        `field "${fieldKey}" must hold ${expected} (got ${describeValue(value)})`,
        fieldRef,
      );

    switch (descriptor.type) {
      case 'text':
      case 'textarea':
      case 'url':
      case 'color': {
        if (typeof value !== 'string') return mismatch('a string');

        // A non-hex colour degrades the token it feeds (ADR-0005), but the
        // editor's colour input is free text, so every intermediate keystroke
        // ("#", "#a", "#ab") passes through this state. Blocking here turned an
        // in-progress edit into an unsavable ContentModel.
        if (descriptor.type === 'color' && !HEX_RE.test(value)) {
          warn(
            'INVALID_COLOR_FIELD',
            `color field "${fieldKey}" value "${value}" is not a hex color`,
            fieldRef,
          );
        }
        if (descriptor.type === 'url' && value.startsWith('http://')) {
          warn(
            'INSECURE_URL',
            `field "${fieldKey}" uses http:// — prefer https to avoid mixed-content issues`,
            fieldRef,
          );
        }
        return;
      }

      case 'select': {
        if (typeof value !== 'string') return mismatch('a string');

        // Warned, not blocked: the renderer maps this value to a class or a
        // branch and falls through to its default when it doesn't match. The
        // reachable cause is a schema whose `options` were narrowed under
        // already-stored data — ADR-0016 §6 calls that out as destructive and
        // the manifest gate catches it there, before the data goes stale.
        if (!descriptor.options.includes(value)) {
          warn(
            'SELECT_VALUE_NOT_IN_OPTIONS',
            `field "${fieldKey}" value "${value}" is not one of: ${descriptor.options.join(', ')}`,
            fieldRef,
          );
        }
        return;
      }

      case 'number': {
        // `NaN`/`Infinity` reach a style attribute as garbage. The editor resets
        // an emptied input to the descriptor's `default` (ADR-0016 §4-3), so
        // nothing a user types arrives here non-finite.
        if (typeof value !== 'number' || !Number.isFinite(value)) return mismatch('a finite number');
        return;
      }

      case 'image': {
        // ImageValue stays an object because `assetId` is real content, not
        // schema metadata — ADR-0003's reference counting reads it (ADR-0016 §4-3).
        if (!isRecord(value)) return mismatch('{ url, assetId? }');
        if (typeof value.url !== 'string') {
          return err(
            'FIELD_VALUE_TYPE_MISMATCH',
            `field "${fieldKey}" must hold { url, assetId? } (url is ${describeValue(value.url)})`,
            `${fieldRef}.url`,
          );
        }
        // Blocking, and safe to block: no editor input reaches `assetId` — it is
        // written from `confirmUploadAction`'s response. It must be a UUID, not
        // merely a string: it is copied into `asset_usages.asset_id`, a `uuid`
        // column referencing `assets.id` (ADR-0003), so any other string aborts
        // the save inside the RPC. Checking it here turns an opaque Postgres
        // error into a coded issue that names the field.
        const { assetId } = value;
        if (assetId !== undefined && assetId !== null) {
          if (typeof assetId !== 'string') {
            err(
              'INVALID_ASSET_ID',
              `field "${fieldKey}" assetId must be a UUID string or null (got ${describeValue(assetId)})`,
              `${fieldRef}.assetId`,
            );
          } else if (!UUID_RE.test(assetId)) {
            err(
              'INVALID_ASSET_ID',
              `field "${fieldKey}" assetId "${assetId}" is not a UUID`,
              `${fieldRef}.assetId`,
            );
          }
        }
        if (value.url.startsWith('http://')) {
          warn(
            'INSECURE_URL',
            `field "${fieldKey}" uses http:// — prefer https to avoid mixed-content issues`,
            fieldRef,
          );
        }
        return;
      }

      case 'array': {
        if (!Array.isArray(value)) return mismatch('an array of items');

        // Kept as a runtime guard even though `FieldDescriptor` makes it
        // mandatory at compile time: a library shipped as plain JS would
        // otherwise blow up inside `Object.entries(undefined)` instead of
        // reporting which component is malformed.
        if (!descriptor.itemSchema) {
          return err(
            'MISSING_ITEM_SCHEMA',
            `schema for array field "${fieldKey}" is missing itemSchema`,
            fieldRef,
          );
        }

        // Warnings, deliberately demoted from the errors they used to be. Both
        // are reachable from the editor's add/remove buttons, and neither breaks
        // the renderer — too few items renders a short list, too many renders a
        // long one. Blocking held every other edit in the same ContentModel
        // hostage to one over-full array (ADR-0015 rule 4).
        if (descriptor.minItems !== undefined && value.length < descriptor.minItems) {
          warn(
            'ARRAY_ITEMS_BELOW_MIN',
            `field "${fieldKey}" should have at least ${descriptor.minItems} items (has ${value.length})`,
            fieldRef,
          );
        }
        if (descriptor.maxItems !== undefined && value.length > descriptor.maxItems) {
          warn(
            'ARRAY_ITEMS_ABOVE_MAX',
            `field "${fieldKey}" should have no more than ${descriptor.maxItems} items (has ${value.length})`,
            fieldRef,
          );
        }

        // `item.id` invariants (ADR-0016 §4-4). Both are blocking: a missing or
        // repeated id makes React reuse the wrong item on reorder, and it is the
        // slot_key an asset usage row is written under.
        const seenIds = new Set<string>();
        value.forEach((item, index) => {
          const itemRef = `${fieldRef}[${index}]`;
          if (!isRecord(item)) {
            err(
              'ARRAY_ITEM_MALFORMED',
              `field "${fieldKey}" item must be { id, fields } (got ${describeValue(item)})`,
              itemRef,
            );
            return;
          }

          const id = item.id;
          const hasId = typeof id === 'string' && id.length > 0;
          if (!hasId) {
            err('ARRAY_ITEM_ID_MISSING', `field "${fieldKey}" item is missing a string id`, itemRef);
          } else if (seenIds.has(id)) {
            err('ARRAY_ITEM_ID_DUPLICATE', `field "${fieldKey}" item id "${id}" is not unique`, itemRef);
          } else {
            seenIds.add(id);
          }

          if (!isRecord(item.fields)) {
            err(
              'ARRAY_ITEM_MALFORMED',
              `field "${fieldKey}" item must be { id, fields } (fields is ${describeValue(item.fields)})`,
              `${itemRef}.fields`,
            );
            return;
          }

          // slot_key encoding from ADR-0016 §4-4: the item's own id, never its
          // index — an index points at a different item after a reorder.
          const idPath = hasId ? id : `#${index}`;
          validateValues(
            descriptor.itemSchema,
            item.fields,
            (subKey) => `${fieldRef}[${idPath}].${subKey}`,
          );
        });
        return;
      }
    }
  };

  /**
   * A schema against the Values stored under it. `pathOf` builds the reference
   * for one key, so a Block's fields and an array item's fields can use their
   * own path shapes without this function knowing which it is walking.
   */
  function validateValues(
    schema: FieldsSchema,
    values: BlockValues,
    pathOf: (fieldKey: string) => string,
  ) {
    for (const [fieldKey, descriptor] of Object.entries(schema)) {
      const fieldRef = pathOf(fieldKey);
      const value = values[fieldKey];

      // An absent optional key is a correct state, not a hole: the schema is the
      // source of truth and the renderer falls back (`?? ''`, ADR-0016 §6). Only
      // a required key going missing can crash it.
      if (value === undefined) {
        if (descriptor.required) {
          err('MISSING_REQUIRED_FIELD', `required field "${fieldKey}" is missing`, fieldRef);
        }
        continue;
      }

      // `null` is not the same as absent, and is not a Value at all — `ValuesOf`
      // yields `T | undefined`, never `T | null` (the sole exception being
      // `ImageValue.assetId`, checked below where it lives). Skipping it the way
      // an absent key is skipped would let one stored shape past every rule.
      //
      // Required: blocking, same as missing — the renderer reads a required
      // Value without a fallback. Optional: a warning, because every renderer is
      // required to fall back on optional Values (ADR-0016 §6) and `?? ''` /
      // `?.` both absorb null, so nothing breaks — it is a shape to clean up,
      // not a save to hold (ADR-0015 rule 4).
      if (value === null) {
        if (descriptor.required) {
          err('MISSING_REQUIRED_FIELD', `required field "${fieldKey}" is null`, fieldRef);
        } else {
          warn('NULL_FIELD_VALUE', `field "${fieldKey}" is null; omit the key instead`, fieldRef);
        }
        continue;
      }

      validateValue(descriptor, value, fieldKey, fieldRef);
    }

    // A stored key with no descriptor — data orphaned by a renamed or dropped
    // field. Harmless to the renderer, which never looks it up, so it stays a
    // warning and belongs in a build log rather than under a user's input.
    for (const fieldKey of Object.keys(values)) {
      if (!schema[fieldKey]) {
        warn(
          'UNKNOWN_DATA_FIELD',
          `field "${fieldKey}" is not defined in component schema`,
          pathOf(fieldKey),
        );
      }
    }
  }

  // Per-section validation, shared across modes.
  const sectionIds = new Set<string>();
  const validateSection = (section: Section, secRef: string) => {
      // Rule 4: section.id must be unique across the whole template
      if (sectionIds.has(section.id)) {
        err('DUPLICATE_SECTION_ID', `section id "${section.id}" is not unique`, secRef);
      }
      sectionIds.add(section.id);

      // Every field rule below needs a schema to check against — after ADR-0016
      // a Value carries no `type`/`label` of its own, so with no library there is
      // nothing to compare it to and the fields are simply not validated. The
      // save paths always pass one (`LibraryAwareSiteContentValidator`, sync,
      // `template:verify`); only the standalone structural callers do not.
      if (!options.templateLibrary) return;

      // Rule 2: section.type must be in templateLibrary
      const entry = options.templateLibrary[section.type];
      if (!entry) {
        err(
          'UNKNOWN_COMPONENT_KEY',
          `componentKey "${section.type}" not found in template library for "${json.templateKey}"`,
          `${secRef}.type`,
        );
        return;
      }

      validateValues(
        entry.meta.fieldsSchema,
        section.fields,
        (fieldKey) => `${secRef}.fields.${fieldKey}`,
      );
  };

  // Each nav-projection source (Single section / Multi page) must carry nav:{visible,label}.
  const validateNavMeta = (
    x: { nav?: { visible?: unknown; label?: unknown } },
    ref: string,
  ) => {
    if (!x.nav || typeof x.nav !== 'object') {
      err('MISSING_NAV', 'nav:{visible,label} is required', `${ref}.nav`);
      return;
    }
    if (typeof x.nav.visible !== 'boolean') {
      err('INVALID_NAV_VISIBLE', 'nav.visible must be a boolean', `${ref}.nav.visible`);
    }
    if (typeof x.nav.label !== 'string') {
      err('INVALID_NAV_LABEL', 'nav.label must be a string', `${ref}.nav.label`);
    }
  };

  if (json.mode === 'single') {
    json.sections.forEach((section) => {
      const secRef = `sections[id=${section.id}]`;
      validateSection(section, secRef);
      validateNavMeta(section, secRef);
    });
  } else {
    const pageSlugs = new Set<string>();
    json.pages.forEach((page) => {
      const pageRef = `pages[slug=${page.slug}]`;
      if (!page.slug) {
        err('MISSING_PAGE_SLUG', 'page slug is required', `${pageRef}.slug`);
      } else if (pageSlugs.has(page.slug)) {
        err('DUPLICATE_PAGE_SLUG', `page slug "${page.slug}" is not unique`, pageRef);
      }
      pageSlugs.add(page.slug);
      validateNavMeta(page, pageRef);
      page.sections.forEach((section) =>
        validateSection(section, `${pageRef}.sections[id=${section.id}]`),
      );
    });
    json.shared.header.forEach((section) =>
      validateSection(section, `shared.header.sections[id=${section.id}]`),
    );
    json.shared.footer.forEach((section) =>
      validateSection(section, `shared.footer.sections[id=${section.id}]`),
    );
  }

  return { errors, warnings };
}
