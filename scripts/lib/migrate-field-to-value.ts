/**
 * Migration 026 — convert stored Block data from the legacy `Field` object to
 * the ADR-0016 §4 Value, and give every array item a permanent `id`.
 *
 * Before (schema metadata stored *beside* every value, in the data):
 *   "fields": {
 *     "title": { "type": "text",  "label": "제목", "value": "안녕" },
 *     "photo": { "type": "image", "label": "사진", "value": "https://…", "assetId": "…" },
 *     "items": { "type": "array", "label": "항목", "items": [ { "name": { "type": "text", … } } ] }
 *   }
 *
 * After (the schema is the only source of truth; the data is just values):
 *   "fields": {
 *     "title": "안녕",
 *     "photo": { "url": "https://…", "assetId": "…" },
 *     "items": [ { "id": "…", "fields": { "name": "…" } } ]
 *   }
 *
 * Everything here is pure and deterministic — no DB, no registry — so the whole
 * transform can be unit-tested and dry-run. The runner
 * (`scripts/migrate-026-field-to-value.ts`) supplies the rows, the schemas and
 * the validator; the runbook is `docs/migrations/026_field_to_value.md`.
 *
 * **Validation runs before anything is written** (ADR-0016 §8-1). That ordering
 * is the reason this file exposes a *plan* rather than a write: "transform →
 * write → validate → abort on error" cannot abort, because the write already
 * happened. `executeFieldValueMigration` will not call its writer unless every
 * transformed row validated clean.
 */
import { createHash } from 'crypto';
import {
  ContentModel,
  FieldsSchema,
  FieldDescriptor,
} from '@/domain/entities/template.entity';
import { SiteContentValidationIssue } from '@/domain/usecases/ports/site-content-validator.port';

// ─── The legacy shape ────────────────────────────────────────────────────────

/**
 * The pre-ADR-0016 `Field` object. Described here rather than imported: #136
 * deleted the union from the domain, and this migration is one of the two
 * remaining readers of the shape (the other is 018's transform).
 */
interface LegacyField {
  type?: string;
  label?: string;
  editable?: boolean;
  value?: unknown;
  assetId?: unknown;
  options?: unknown;
  items?: unknown;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * A legacy `Field` is recognised by carrying its own `type` string — the very
 * thing ADR-0016 removes from the data. No Value shape has a `type` key: a
 * scalar is a string or a number, an `ImageValue` is `{ url, assetId? }`, and an
 * array Value is an array. So this discriminates cleanly, which is what makes
 * the transform idempotent — a second run sees Values and passes them through.
 */
function isLegacyField(v: unknown): v is LegacyField {
  return isRecord(v) && typeof v.type === 'string';
}

/**
 * The editor-only `_key` pseudo-Field that `injectKeys`/`stripKeys` stamped on
 * array items for stable React keys (deleted in #134). It was stripped before
 * every save, so it should not be in the database — but where it did survive it
 * *is* the item's identity, so it becomes the item's `id` rather than garbage.
 */
const LEGACY_ITEM_KEY = '_key';

// ─── Result types ────────────────────────────────────────────────────────────

export interface ContentMigrationResult {
  status: 'migrated' | 'unchanged' | 'skipped-shape';
  content: ContentModel;
  notes: string[];
  /** Legacy `Field` wrappers unwrapped into Values. */
  unwrapped: number;
  /** Array items that had no `id` and were given one. */
  idsAssigned: number;
}

export interface FieldToValueOptions {
  /** Resolve a Block's `fieldsSchema` by componentKey. Used only where the data alone is ambiguous. */
  schemaFor?(blockType: string): FieldsSchema | undefined;
  /** Injectable so tests get deterministic ids. Defaults to `crypto.randomUUID()`. */
  newId?(): string;
}

// ─── The transform ───────────────────────────────────────────────────────────

/**
 * Convert one Site/Template content payload in place of its legacy self.
 * Idempotent: content that is already Value-shaped comes back `unchanged`, and
 * array items keep the ids they already have (ADR-0016 §4-4 invariant 5).
 */
export function migrateContentToValues(
  input: unknown,
  options: FieldToValueOptions = {},
): ContentMigrationResult {
  const newId = options.newId ?? (() => crypto.randomUUID());
  const notes: string[] = [];
  let unwrapped = 0;
  let idsAssigned = 0;

  if (!isRecord(input) || (input.mode !== 'single' && input.mode !== 'multi')) {
    return {
      status: 'skipped-shape',
      content: input as ContentModel,
      notes: ['not a `mode`-discriminated ContentModel — left untouched'],
      unwrapped: 0,
      idsAssigned: 0,
    };
  }

  const content = structuredClone(input) as unknown as ContentModel;

  /** One stored entry → its Value. `descriptor` is consulted only where the data is ambiguous. */
  const toValue = (
    stored: unknown,
    descriptor: FieldDescriptor | undefined,
    ref: string,
  ): unknown => {
    // Already a Value — except an array, whose *items* may still be legacy.
    if (!isLegacyField(stored)) {
      if (Array.isArray(stored)) {
        return stored.map((item, index) =>
          toItem(item, descriptor?.type === 'array' ? descriptor.itemSchema : undefined, `${ref}[${index}]`),
        );
      }
      return stored;
    }

    unwrapped++;

    switch (stored.type) {
      case 'array': {
        const items = Array.isArray(stored.items) ? stored.items : [];
        if (!Array.isArray(stored.items)) {
          notes.push(`${ref}: array field had no \`items\` array — wrote an empty list`);
        }
        const itemSchema = descriptor?.type === 'array' ? descriptor.itemSchema : undefined;
        return items.map((item, index) => toItem(item, itemSchema, `${ref}[${index}]`));
      }

      case 'image': {
        // `assetId` is the reference-counting handle ADR-0003's orphan sweep
        // reads. Losing it here would leave a live image with no `asset_usages`
        // row, which the sweep deletes the binary for an hour later.
        const value: Record<string, unknown> = { url: typeof stored.value === 'string' ? stored.value : '' };
        if ('assetId' in stored) value.assetId = stored.assetId;
        return value;
      }

      case 'number': {
        // The legacy shape stored every value as a string, including numbers, so
        // an emptied input was persisted as `''`. That has to be spelled out:
        // `Number('')` is `0`, not `NaN`, so an unset field would otherwise
        // migrate to a real, wrong zero — while a deliberate `'0'` still lands
        // on 0, as it should.
        const raw = typeof stored.value === 'string' ? stored.value.trim() : stored.value;
        const n = raw === '' || raw === null || raw === undefined ? NaN : Number(raw);
        if (Number.isFinite(n)) return n;
        // The schema's `default` is what the editor resets an emptied number
        // input to (ADR-0016 §4-3) — the migration lands on the same value.
        const fallback = descriptor?.type === 'number' ? descriptor.default : 0;
        notes.push(`${ref}: number value ${JSON.stringify(stored.value)} is not usable — used ${fallback}`);
        return fallback;
      }

      default:
        return typeof stored.value === 'string' ? stored.value : stored.value ?? '';
    }
  };

  /** One array item → `{ id, fields }`, whether it arrives legacy or already converted. */
  const toItem = (item: unknown, itemSchema: FieldsSchema | undefined, ref: string): unknown => {
    if (!isRecord(item)) return item;

    // Already `{ id, fields }` — keep the id (idempotency) and walk the fields,
    // which may still hold legacy wrappers from a half-finished run.
    if (typeof item.id === 'string' && item.id.length > 0 && isRecord(item.fields)) {
      return { id: item.id, fields: toFields(item.fields, itemSchema, `${ref}.fields`) };
    }

    // Legacy: the item *is* the record of fields, with no id of its own.
    const { [LEGACY_ITEM_KEY]: legacyKey, ...rest } = item;
    const carriedId =
      isLegacyField(legacyKey) && typeof legacyKey.value === 'string' && legacyKey.value.length > 0
        ? legacyKey.value
        : null;

    if (carriedId) {
      notes.push(`${ref}: reused the editor's \`_key\` as the item id`);
    } else {
      idsAssigned++;
    }

    return { id: carriedId ?? newId(), fields: toFields(rest, itemSchema, `${ref}.fields`) };
  };

  /** A whole `fields` record. Data-driven: a key the schema forgot is converted, never dropped. */
  const toFields = (
    fields: Record<string, unknown>,
    schema: FieldsSchema | undefined,
    ref: string,
  ): Record<string, unknown> => {
    const out: Record<string, unknown> = {};
    for (const [key, stored] of Object.entries(fields)) {
      out[key] = toValue(stored, schema?.[key], `${ref}.${key}`);
    }
    return out;
  };

  const migrateBlock = (block: { id: string; type: string; fields?: unknown }, ref: string) => {
    if (!isRecord(block.fields)) return;
    block.fields = toFields(block.fields, options.schemaFor?.(block.type), `${ref}.fields`);
  };

  if (content.mode === 'single') {
    (content.sections ?? []).forEach((section) => migrateBlock(section, `sections[${section.id}]`));
  } else {
    for (const slot of ['header', 'footer'] as const) {
      (content.shared?.[slot] ?? []).forEach((section) =>
        migrateBlock(section, `shared.${slot}[${section.id}]`),
      );
    }
    (content.pages ?? []).forEach((page) =>
      (page.sections ?? []).forEach((section) => migrateBlock(section, `pages[${page.id}].${section.id}`)),
    );
  }

  return {
    status: unwrapped === 0 && idsAssigned === 0 ? 'unchanged' : 'migrated',
    content,
    notes,
    unwrapped,
    idsAssigned,
  };
}

// ─── Planning (validate before writing anything) ─────────────────────────────

export interface TemplateRow {
  id: string;
  slug: string;
  content: unknown;
}

export interface UserSiteRow {
  id: string;
  siteName: string;
  content: unknown;
  snapshot: unknown;
}

export interface SourceRows {
  templates: TemplateRow[];
  userSites: UserSiteRow[];
}

export interface PlanFailure {
  /** `<table>.<column>#<id>` — enough to find the row by hand. */
  ref: string;
  issues: SiteContentValidationIssue[];
}

/** One column's before/after digest, for the row-count + checksum reconciliation in §8-1 step 3. */
export interface ColumnDigest {
  ref: string;
  before: string;
  after: string;
  changed: boolean;
}

export interface MigrationPlan {
  /** True only when every transformed column validated clean. The writer runs on nothing else. */
  ok: boolean;
  templates: Array<{ id: string; content: ContentModel }>;
  userSites: Array<{ id: string; content: ContentModel; snapshot: ContentModel | null }>;
  failures: PlanFailure[];
  digests: ColumnDigest[];
  notes: string[];
  stats: {
    templateRows: number;
    userSiteRows: number;
    columns: number;
    columnsChanged: number;
    fieldsUnwrapped: number;
    idsAssigned: number;
    skippedShape: number;
  };
}

export interface PlanDeps {
  /** The Template library's schema for a Block, by templateKey + componentKey. */
  schemaFor(templateKey: string, blockType: string): FieldsSchema | undefined;
  /** Blocking errors only — warnings do not hold a migration, same as a save (ADR-0015 rule 4). */
  validate(content: ContentModel): SiteContentValidationIssue[];
  newId?(): string;
}

/** Stable digest of a JSON payload: object keys sorted, so key order cannot show up as a change. */
export function digest(value: unknown): string {
  const canonical = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(canonical);
    if (isRecord(v)) {
      return Object.fromEntries(
        Object.keys(v)
          .sort()
          .map((k) => [k, canonical(v[k])]),
      );
    }
    return v;
  };
  return createHash('sha256').update(JSON.stringify(canonical(value) ?? null)).digest('hex').slice(0, 16);
}

/**
 * Transform every row in memory and validate the results. Writes nothing, ever.
 *
 * A row that is not a recognisable `ContentModel` is carried through untouched
 * and counted (`skippedShape`) rather than silently dropped — the runner prints
 * it, and a human decides. It still goes through validation, so a payload that
 * the renderer could not use cannot ride along unnoticed.
 */
export function planFieldValueMigration(rows: SourceRows, deps: PlanDeps): MigrationPlan {
  const failures: PlanFailure[] = [];
  const digests: ColumnDigest[] = [];
  const notes: string[] = [];
  const stats = {
    templateRows: rows.templates.length,
    userSiteRows: rows.userSites.length,
    columns: 0,
    columnsChanged: 0,
    fieldsUnwrapped: 0,
    idsAssigned: 0,
    skippedShape: 0,
  };

  const convert = (raw: unknown, ref: string): ContentModel => {
    stats.columns++;

    const templateKey =
      isRecord(raw) && typeof raw.templateKey === 'string' ? raw.templateKey : '';
    const result = migrateContentToValues(raw, {
      newId: deps.newId,
      schemaFor: (blockType) => deps.schemaFor(templateKey, blockType),
    });

    stats.fieldsUnwrapped += result.unwrapped;
    stats.idsAssigned += result.idsAssigned;
    if (result.status === 'skipped-shape') stats.skippedShape++;
    for (const note of result.notes) notes.push(`${ref}: ${note}`);

    const before = digest(raw);
    const after = digest(result.content);
    if (before !== after) stats.columnsChanged++;
    digests.push({ ref, before, after, changed: before !== after });

    const issues = deps.validate(result.content);
    if (issues.length > 0) failures.push({ ref, issues });

    return result.content;
  };

  const templates = rows.templates.map((row) => ({
    id: row.id,
    content: convert(row.content, `templates.content#${row.slug}`),
  }));

  const userSites = rows.userSites.map((row) => ({
    id: row.id,
    content: convert(row.content, `user_sites.content#${row.id}`),
    // A null snapshot is left null rather than invented: the column is written
    // back exactly as it was read when there is nothing there to convert.
    snapshot:
      row.snapshot === null || row.snapshot === undefined
        ? null
        : convert(row.snapshot, `user_sites.snapshot#${row.id}`),
  }));

  return { ok: failures.length === 0, templates, userSites, failures, digests, notes, stats };
}

// ─── Execution (the only door to a write) ────────────────────────────────────

export interface MigrationPayload {
  templates: Array<{ id: string; content: ContentModel }>;
  userSites: Array<{ id: string; content: ContentModel; snapshot: ContentModel | null }>;
}

export type MigrationWriter = (payload: MigrationPayload) => Promise<void>;

export interface ExecuteResult {
  plan: MigrationPlan;
  written: boolean;
}

/**
 * Plan, then write — and only in that order.
 *
 * `writer` is called exactly once, with every row in one payload, and only when
 * the plan validated clean. Splitting the write per row would put the abort
 * decision *after* some rows were already committed, which is the failure mode
 * ADR-0016 §8-1 rewrote the procedure to remove.
 */
export async function executeFieldValueMigration(
  rows: SourceRows,
  deps: PlanDeps,
  writer: MigrationWriter,
): Promise<ExecuteResult> {
  const plan = planFieldValueMigration(rows, deps);
  if (!plan.ok) return { plan, written: false };

  await writer({ templates: plan.templates, userSites: plan.userSites });
  return { plan, written: true };
}
