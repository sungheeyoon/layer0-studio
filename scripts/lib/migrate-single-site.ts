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
  NavMeta,
  SingleSection,
  Field,
  GlobalStyles,
  getFieldValue,
} from '@/domain/entities/template.entity';

/** Legacy section shape stored in the DB before #37. */
interface LegacySection {
  id: string;
  type: string;
  visible?: boolean;
  editable?: boolean;
  title?: string;
  data: Record<string, Field>;
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
export type SeedNavMap = Map<string, Map<string, NavMeta>>;

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
function orderedMenuValues(navData: Record<string, Field>): string[] {
  return Object.keys(navData)
    .filter((k) => MENU_KEY_RE.test(k))
    .sort((a, b) => Number(a.slice(4)) - Number(b.slice(4)))
    .map((k) => getFieldValue(navData[k]))
    .filter((v) => v.length > 0);
}

/** Rename the `label` field key → `eyebrow`, preserving its value. */
function renameLabelToEyebrow(
  data: Record<string, Field>,
): Record<string, Field> {
  if (!('label' in data) || 'eyebrow' in data) return data;
  const { label, ...rest } = data;
  return { eyebrow: label, ...rest };
}

/** Strip section-level `editable`/`title` and (for nav) `menuN`/`menuNUrl`. */
function cleanData(
  type: string,
  data: Record<string, Field>,
): Record<string, Field> {
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

  const sections: SingleSection[] = legacySections.map((s) => {
    const data = cleanData(s.type, s.data ?? {});
    const seeded = seedSections?.get(s.id);
    const nav: NavMeta = seeded
      ? { visible: seeded.visible, label: seeded.label }
      : { visible: false, label: getFieldValue(data, 'eyebrow') || s.type };
    return {
      id: s.id,
      type: s.type,
      visible: s.visible ?? true,
      nav,
      fields: data,
    };
  });

  // Preserve user menu renames: zip the old nav's ordered menuN values onto the
  // nav-target sections (document order). No-op for unedited sites (the seed
  // label already equals the original menuN value).
  const oldNav = legacySections.find((s) => s.type === 'nav');
  if (oldNav) {
    const menuValues = orderedMenuValues(oldNav.data ?? {});
    const targets = sections.filter((s) => s.nav.visible);
    let preserved = 0;
    for (let i = 0; i < Math.min(menuValues.length, targets.length); i++) {
      if (menuValues[i] !== targets[i].nav.label) {
        targets[i].nav.label = menuValues[i];
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
    sections,
  };

  return { status: 'migrated', json: migrated, notes };
}
