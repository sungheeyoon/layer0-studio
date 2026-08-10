/** Pure transform + validation-first planner for migration 027 (ADR-0016 §2–§3). */
import { createHash } from 'crypto';

export type MigratedContent = Record<string, unknown> & { mode: 'single' | 'multi' };

interface LegacyNav {
  visible: boolean;
  label: string;
}

export interface ContentMigrationResult {
  status: 'migrated' | 'unchanged' | 'skipped-shape';
  content: MigratedContent;
  stats: {
    sectionsRenamed: number;
    sharedRenamed: number;
    navConverted: number;
    pageNamesAdded: number;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isLegacyNav(value: unknown): value is LegacyNav {
  return isRecord(value) && typeof value.visible === 'boolean' && typeof value.label === 'string';
}

/** Stable digest: object key order does not count as a data change. */
export function digest(value: unknown): string {
  const canonical = (input: unknown): unknown => {
    if (Array.isArray(input)) return input.map(canonical);
    if (isRecord(input)) {
      return Object.fromEntries(
        Object.keys(input).sort().map((key) => [key, canonical(input[key])]),
      );
    }
    return input;
  };
  return createHash('sha256')
    .update(JSON.stringify(canonical(value) ?? null))
    .digest('hex')
    .slice(0, 16);
}

/**
 * Convert one legacy ContentModel to the Block/menu shape. Already-converted
 * payloads are preserved byte-for-data (after structuredClone), which makes
 * retries safe and lets new Multi pages intentionally keep `menu` absent.
 */
export function migrateContentToBlockMenu(input: unknown): ContentMigrationResult {
  const emptyStats = {
    sectionsRenamed: 0,
    sharedRenamed: 0,
    navConverted: 0,
    pageNamesAdded: 0,
  };
  if (!isRecord(input) || (input.mode !== 'single' && input.mode !== 'multi')) {
    return {
      status: 'skipped-shape',
      content: input as MigratedContent,
      stats: emptyStats,
    };
  }

  const content = structuredClone(input) as MigratedContent;
  const stats = { ...emptyStats };

  const migrateSingleBlock = (raw: unknown): unknown => {
    if (!isRecord(raw)) return raw;
    const block = { ...raw };
    if (isLegacyNav(block.nav)) {
      const nav = block.nav;
      delete block.nav;
      if (nav.visible && !('menu' in block)) block.menu = { label: nav.label };
      stats.navConverted++;
    }
    return block;
  };

  if (content.mode === 'single') {
    const legacySections = Array.isArray(content.sections) ? content.sections : null;
    const currentBlocks = Array.isArray(content.blocks) ? content.blocks : null;
    const source = currentBlocks ?? legacySections;
    if (legacySections) {
      delete content.sections;
      content.blocks = legacySections;
      stats.sectionsRenamed++;
    }
    if (source) content.blocks = source.map(migrateSingleBlock);
  } else {
    if (isRecord(content.shared) && !isRecord(content.chrome)) {
      content.chrome = content.shared;
      delete content.shared;
      stats.sharedRenamed++;
    }

    if (Array.isArray(content.pages)) {
      content.pages = content.pages.map((rawPage) => {
        if (!isRecord(rawPage)) return rawPage;
        const page = { ...rawPage };

        if (Array.isArray(page.sections) && !Array.isArray(page.blocks)) {
          page.blocks = page.sections;
          delete page.sections;
          stats.sectionsRenamed++;
        }

        if (isLegacyNav(page.nav)) {
          const nav = page.nav;
          delete page.nav;
          if (typeof page.name !== 'string') {
            page.name = nav.label;
            stats.pageNamesAdded++;
          }
          if (!('menu' in page)) {
            page.menu = nav.visible
              ? { label: nav.label }
              : { label: nav.label, placement: 'footer' };
          }
          stats.navConverted++;
        }
        return page;
      });
    }
  }

  const changed = Object.values(stats).some((count) => count > 0);
  return { status: changed ? 'migrated' : 'unchanged', content, stats };
}

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

export interface ValidationIssue {
  code: string;
  message: string;
  path?: string;
}

export interface PlanDeps {
  validate(content: MigratedContent): ValidationIssue[];
}

export interface MigrationPayload {
  templates: Array<{ id: string; content: MigratedContent }>;
  userSites: Array<{ id: string; content: MigratedContent; snapshot: MigratedContent | null }>;
}

export interface ColumnDigest {
  ref: string;
  before: string;
  after: string;
  changed: boolean;
}

export interface MigrationPlan {
  ok: boolean;
  payload: MigrationPayload;
  failures: Array<{ ref: string; issues: ValidationIssue[] }>;
  digests: ColumnDigest[];
  stats: {
    templateRows: number;
    userSiteRows: number;
    columns: number;
    columnsChanged: number;
    sectionsRenamed: number;
    sharedRenamed: number;
    navConverted: number;
    pageNamesAdded: number;
    skippedShape: number;
  };
}

/** Transform every stored column in memory, then validate every result. Never writes. */
export function planBlockMenuMigration(rows: SourceRows, deps: PlanDeps): MigrationPlan {
  const failures: MigrationPlan['failures'] = [];
  const digests: ColumnDigest[] = [];
  const stats: MigrationPlan['stats'] = {
    templateRows: rows.templates.length,
    userSiteRows: rows.userSites.length,
    columns: 0,
    columnsChanged: 0,
    sectionsRenamed: 0,
    sharedRenamed: 0,
    navConverted: 0,
    pageNamesAdded: 0,
    skippedShape: 0,
  };

  const convert = (raw: unknown, ref: string): MigratedContent => {
    stats.columns++;
    const result = migrateContentToBlockMenu(raw);
    if (result.status === 'skipped-shape') stats.skippedShape++;
    stats.sectionsRenamed += result.stats.sectionsRenamed;
    stats.sharedRenamed += result.stats.sharedRenamed;
    stats.navConverted += result.stats.navConverted;
    stats.pageNamesAdded += result.stats.pageNamesAdded;

    const before = digest(raw);
    const after = digest(result.content);
    const changed = before !== after;
    if (changed) stats.columnsChanged++;
    digests.push({ ref, before, after, changed });

    const issues = deps.validate(result.content);
    if (issues.length > 0) failures.push({ ref, issues });
    return result.content;
  };

  const payload: MigrationPayload = {
    templates: rows.templates.map((row) => ({
      id: row.id,
      content: convert(row.content, `templates.content#${row.slug}`),
    })),
    userSites: rows.userSites.map((row) => ({
      id: row.id,
      content: convert(row.content, `user_sites.content#${row.id}`),
      snapshot: row.snapshot === null || row.snapshot === undefined
        ? null
        : convert(row.snapshot, `user_sites.snapshot#${row.id}`),
    })),
  };

  return { ok: failures.length === 0, payload, failures, digests, stats };
}

export type MigrationWriter = (payload: MigrationPayload) => Promise<void>;

export async function executeBlockMenuMigration(
  rows: SourceRows,
  deps: PlanDeps,
  writer: MigrationWriter,
): Promise<{ plan: MigrationPlan; written: boolean }> {
  const plan = planBlockMenuMigration(rows, deps);
  if (!plan.ok) return { plan, written: false };
  await writer(plan.payload);
  return { plan, written: true };
}
