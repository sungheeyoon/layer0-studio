/**
 * Migration 018 — convert an existing Single `user_sites` JSON from the legacy
 * `{ pages: [home] }` shape to the new `{ mode:'single', sections }` union
 * (ADR-0007). Pure & deterministic so it can be unit-tested and dry-run.
 *
 * Per-row transform (applied to both `site_json` and `template_snapshot`):
 *   1. Flatten `pages[0].sections` → top-level `sections`, set `mode:'single'`,
 *      drop the page wrapper. Keep `templateKey` + `globalStyles`.
 *   2. Rename each section's `data.label` key → `data.eyebrow` (the on-screen
 *      kicker; nav text is a separate concern — see step 4).
 *   3. Strip `menu1~N` / `menuNUrl` from the nav section's `data`.
 *   4. Inject per-section `nav:{visible,label}` from the authoritative code seed
 *      (matched by templateKey + section id). User menu renames are preserved by
 *      zipping the old nav section's ordered `menuN` values onto the nav-target
 *      sections in document order (Phase 0 seeded `nav.visible:true` on exactly
 *      those sections, in order — see #37). Drop section-level `editable`/`title`.
 *
 * slot_key namespace (`${page.id}.${section.id}.${key}` → `${section.id}.${key}`)
 * is NOT touched here — it lives on asset rows and self-heals on the next save
 * via the lock RPC (asset_id unchanged, so no orphan mis-sweep). See PLAN §4.
 */
import {
  ContentModel,
  SingleBlock,
  GlobalStyles,
} from '@/domain/entities/template.entity';

interface SeedNavMeta { visible: boolean; label: string }

/**
 * The pre-ADR-0016 `Field` object: schema metadata (`type`/`label`) stored
 * *beside* every value, in the data. The domain no longer knows this shape —
 * #136 deleted the union and its `getFieldValue` accessor — but this migration
 * reads rows written while it was still the storage format, so it carries its
 * own description of it. Nothing else should: a new reader of this shape would
 * be a regression, not a dependency.
 *
 * 018 moves these objects across verbatim (only *which* key holds them changes);
 * converting them to Values is ADR-0016 §8-1's own migration.
 */
interface LegacyField {
  type?: string;
  label?: string;
  value?: string;
}

type LegacyFields = Record<string, LegacyField>;

/** The one read 018 needs: a legacy field's string value, blank when absent. */
function legacyValue(field: LegacyField | undefined): string {
  if (!field || field.type === 'array') return '';
  return field.value ?? '';
}

/** Legacy section shape stored in the DB before #37. */
interface LegacySection {
  id: string;
  type: string;
  visible?: boolean;
  editable?: boolean;
  title?: string;
  data: LegacyFields;
}

interface LegacyPage {
  id: string;
  sections?: LegacySection[];
}

interface LegacyTemplateJson {
  templateKey: string;
  globalStyles: GlobalStyles;
  pages?: LegacyPage[];
}

/** Authoritative nav, from the code seeds: templateKey → (sectionId → NavMeta). */
export type SeedNavMap = Map<string, Map<string, SeedNavMeta>>;

export type MigrateStatus =
  | 'migrated'
  | 'skipped-already' // already in the new `mode` shape
  | 'skipped-shape'; // not a recognisable legacy Single payload

export interface MigrateResult {
  status: MigrateStatus;
  /** The migrated JSON, or the input untouched when skipped. */
  json: ContentModel;
  notes: string[];
}

const MENU_KEY_RE = /^menu\d+$/; // user-facing menu label fields
const MENU_ANY_KEY_RE = /^menu\d+(Url)?$/; // labels + wedding's per-item URLs

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Old nav `menuN` values, ordered by N, with blanks dropped. */
function orderedMenuValues(navData: LegacyFields): string[] {
  return Object.keys(navData)
    .filter((k) => MENU_KEY_RE.test(k))
    .sort((a, b) => Number(a.slice(4)) - Number(b.slice(4)))
    .map((k) => legacyValue(navData[k]))
    .filter((v) => v.length > 0);
}

/** Rename the `label` field key → `eyebrow`, preserving its value. */
function renameLabelToEyebrow(data: LegacyFields): LegacyFields {
  if (!('label' in data) || 'eyebrow' in data) return data;
  const { label, ...rest } = data;
  return { eyebrow: label, ...rest };
}

/** Strip section-level `editable`/`title` and (for nav) `menuN`/`menuNUrl`. */
function cleanData(type: string, data: LegacyFields): LegacyFields {
  const renamed = renameLabelToEyebrow(data);
  if (type !== 'nav') return renamed;
  return Object.fromEntries(
    Object.entries(renamed).filter(([k]) => !MENU_ANY_KEY_RE.test(k)),
  );
}

/**
 * Transform one legacy Single payload into the new `{ mode:'single' }` shape.
 * Idempotent: a payload already carrying `mode` is returned untouched.
 */
export function migrateSingleSiteJson(
  input: unknown,
  seedNav: SeedNavMap,
): MigrateResult {
  const notes: string[] = [];

  if (isRecord(input) && 'mode' in input) {
    return { status: 'skipped-already', json: input as unknown as ContentModel, notes };
  }

  if (!isRecord(input) || !Array.isArray((input as unknown as LegacyTemplateJson).pages)) {
    return { status: 'skipped-shape', json: input as unknown as ContentModel, notes };
  }

  const legacy = input as unknown as LegacyTemplateJson;
  const pages = legacy.pages ?? [];
  if (pages.length === 0 || !Array.isArray(pages[0].sections)) {
    return { status: 'skipped-shape', json: input as unknown as ContentModel, notes };
  }
  if (pages.length > 1) {
    notes.push(
      `expected 1 page for a Single site, found ${pages.length}; using pages[0] ("${pages[0].id}")`,
    );
  }

  const templateKey = legacy.templateKey;
  const seedSections = seedNav.get(templateKey);
  if (!seedSections) {
    notes.push(
      `templateKey "${templateKey}" not in code registry — nav derived (visible:false) for all sections`,
    );
  }

  const legacySections = pages[0].sections ?? [];

  const blocks: SingleBlock[] = legacySections.map((s) => {
    const data = cleanData(s.type, s.data ?? {});
    const seeded = seedSections?.get(s.id);
    const nav: SeedNavMeta = seeded
      ? { visible: seeded.visible, label: seeded.label }
      : { visible: false, label: legacyValue(data.eyebrow) || s.type };
    return {
      id: s.id,
      type: s.type,
      visible: s.visible ?? true,
      ...(nav.visible ? { menu: { label: nav.label } } : {}),
      fields: data,
    };
  });

  // Preserve user menu renames: zip the old nav's ordered menuN values onto the
  // nav-target sections (document order). No-op for unedited sites (the seed
  // label already equals the original menuN value).
  const oldNav = legacySections.find((s) => s.type === 'nav');
  if (oldNav) {
    const menuValues = orderedMenuValues(oldNav.data ?? {});
    const targets = blocks.filter((s) => s.menu);
    let preserved = 0;
    for (let i = 0; i < Math.min(menuValues.length, targets.length); i++) {
      if (menuValues[i] !== targets[i].menu!.label) {
        targets[i].menu!.label = menuValues[i];
        preserved++;
      }
    }
    if (preserved > 0) {
      notes.push(`preserved ${preserved} user-edited menu label(s)`);
    }
  }

  const migrated: ContentModel = {
    mode: 'single',
    templateKey,
    globalStyles: legacy.globalStyles,
    blocks,
  };

  return { status: 'migrated', json: migrated, notes };
}
