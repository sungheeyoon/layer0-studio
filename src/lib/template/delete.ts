import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseTemplateRepositoryImpl } from '@/data/repositories/supabase-template.repository.impl';

/**
 * template:delete engine — the reverse of `new-template` / `template:sync`.
 *
 * A Template lives in several places (source dir, `_generated.ts`, DB row,
 * `template_assets/<key>/`, `template-thumbnails/thumbnails/template-<key>-*`,
 * `public/thumbnails/template-<key>.webp`). Every one of those is derivable from
 * the `templateKey` alone (ADR grilling Q4/Q7) — so this engine takes the key as
 * its only real input and cleans up whatever exists. The source dir is optional:
 * present → normal delete (the skill git-rm's it afterwards), absent → orphan
 * cleanup of the residue a bare `rm` left behind.
 *
 * Split of responsibility (grilling Q3/Q6): this engine cleans DB + storage +
 * public webp + `_generated.ts`. It never touches the source dir — `git rm` is
 * the operator's / skill's job. Row deletion reuses the data-layer repository.
 */

const TEMPLATE_ASSETS_BUCKET = 'template_assets';
const THUMBNAILS_BUCKET = 'template-thumbnails';
const THUMBNAILS_PREFIX = 'thumbnails';
const TEMPLATES_ROOT = path.join('src', 'templates');

export type DeleteBlock = 'EMPTY_MATCH' | 'USER_SITES_REFERENCE';

export interface DeleteTemplatePlan {
  templateKey: string;
  /** Absolute path to the source dir, or null when already removed (orphan). */
  sourceDir: string | null;
  /** Repo-relative source dir, for the `git rm` hint. */
  sourceDirRel: string | null;
  /** DB row id (via findBySlug), or null when no row exists. */
  dbRowId: string | null;
  /** How many user_sites reference this template (blocks deletion unless forced). */
  userSiteCount: number;
  /** Object paths inside the `template_assets` bucket. */
  assetPaths: string[];
  /** Object paths inside the `template-thumbnails` bucket. */
  thumbnailPaths: string[];
  /** Absolute path to the committed public thumbnail, or null when absent. */
  publicThumbnail: string | null;
}

export interface DeleteTemplateResult {
  plan: DeleteTemplatePlan;
  /** Non-null when the deletion was refused (and nothing was touched). */
  block: DeleteBlock | null;
  applied: boolean;
  removed: {
    dbRow: boolean;
    assets: number;
    thumbnails: number;
    publicThumbnail: boolean;
    regenerated: boolean;
  };
}

export interface DeleteTemplateOptions {
  templateKey: string;
  dryRun: boolean;
  /** Bypass ONLY the user_sites reference block (grilling Q2/Q9). */
  force?: boolean;
  /** Written to the template_sync_audit row (grilling Q8). */
  performedBy?: string;
  /** Defaults to process.cwd(). */
  projectRoot?: string;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Resolve the source dir for a templateKey by scanning `src/templates/<cat>/<leaf>`
 * and matching `${cat}-${leaf}`. We iterate real directories rather than splitting
 * the key on '-', so a hyphenated leaf (e.g. `cafe-sun-lit`) resolves unambiguously.
 */
function resolveSourceDir(
  projectRoot: string,
  templateKey: string,
): { abs: string; rel: string } | null {
  const root = path.join(projectRoot, TEMPLATES_ROOT);
  if (!fs.existsSync(root)) return null;

  for (const category of fs.readdirSync(root)) {
    const categoryDir = path.join(root, category);
    if (!fs.statSync(categoryDir).isDirectory()) continue;

    for (const leaf of fs.readdirSync(categoryDir)) {
      const leafDir = path.join(categoryDir, leaf);
      if (!fs.statSync(leafDir).isDirectory()) continue;

      if (`${category}-${leaf}` === templateKey) {
        return {
          abs: leafDir,
          rel: path.join(TEMPLATES_ROOT, category, leaf).split(path.sep).join('/'),
        };
      }
    }
  }
  return null;
}

async function listAssetPaths(
  supabase: SupabaseClient,
  templateKey: string,
): Promise<string[]> {
  const { data, error } = await supabase.storage
    .from(TEMPLATE_ASSETS_BUCKET)
    .list(templateKey, { limit: 1000 });
  if (error) throw error;
  // Assets are flat files under `<key>/` (uploadTemplateAsset), so one level is enough.
  return (data ?? [])
    .filter((f) => f.name && f.id !== null)
    .map((f) => `${templateKey}/${f.name}`);
}

async function listThumbnailPaths(
  supabase: SupabaseClient,
  templateKey: string,
): Promise<string[]> {
  const { data, error } = await supabase.storage
    .from(THUMBNAILS_BUCKET)
    .list(THUMBNAILS_PREFIX, { limit: 1000 });
  if (error) throw error;
  // Hash-named `template-<key>-<md5>.webp` (see sync.ts uploadThumbnail). Match the
  // exact shape rather than a bare prefix so `cafe-default` never sweeps
  // `cafe-default-x`'s thumbnail.
  const re = new RegExp(`^template-${escapeRegExp(templateKey)}-[0-9a-f]{32}\\.(webp|png)$`);
  return (data ?? [])
    .filter((f) => re.test(f.name))
    .map((f) => `${THUMBNAILS_PREFIX}/${f.name}`);
}

async function countUserSites(
  supabase: SupabaseClient,
  templateRowId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from('user_sites')
    .select('id', { count: 'exact', head: true })
    .eq('template_id', templateRowId);
  if (error) throw error;
  return count ?? 0;
}

export async function buildDeletePlan(
  supabase: SupabaseClient,
  templateKey: string,
  projectRoot: string = process.cwd(),
): Promise<DeleteTemplatePlan> {
  const repo = new SupabaseTemplateRepositoryImpl(supabase);

  const source = resolveSourceDir(projectRoot, templateKey);
  const row = await repo.findBySlug(templateKey);
  const userSiteCount = row ? await countUserSites(supabase, row.id) : 0;
  const assetPaths = await listAssetPaths(supabase, templateKey);
  const thumbnailPaths = await listThumbnailPaths(supabase, templateKey);

  const publicAbs = path.join(projectRoot, 'public', 'thumbnails', `template-${templateKey}.webp`);
  const publicThumbnail = fs.existsSync(publicAbs) ? publicAbs : null;

  return {
    templateKey,
    sourceDir: source?.abs ?? null,
    sourceDirRel: source?.rel ?? null,
    dbRowId: row?.id ?? null,
    userSiteCount,
    assetPaths,
    thumbnailPaths,
    publicThumbnail,
  };
}

function planMatchesNothing(plan: DeleteTemplatePlan): boolean {
  return (
    plan.dbRowId === null &&
    plan.sourceDir === null &&
    plan.assetPaths.length === 0 &&
    plan.thumbnailPaths.length === 0 &&
    plan.publicThumbnail === null
  );
}

function regenerateGenerated(projectRoot: string): boolean {
  try {
    execFileSync('node', [path.join(projectRoot, 'scripts', 'generate-templates.mjs')], {
      cwd: projectRoot,
      stdio: 'ignore',
    });
    return true;
  } catch (err) {
    console.warn(
      '[delete] generate:templates failed — run `pnpm generate:templates` manually.',
      err instanceof Error ? err.message : String(err),
    );
    return false;
  }
}

/**
 * Build the plan, decide whether the deletion is allowed, and (unless dryRun)
 * apply it in the safe order: reversible DB row first (its ON DELETE RESTRICT is
 * the real gate), then irreversible storage, then the public webp, then regen.
 * Every step is idempotent — a mid-failure re-run converges.
 */
export async function deleteTemplate(
  supabase: SupabaseClient,
  options: DeleteTemplateOptions,
): Promise<DeleteTemplateResult> {
  const { templateKey, dryRun, force = false, performedBy, projectRoot = process.cwd() } = options;

  const plan = await buildDeletePlan(supabase, templateKey, projectRoot);

  const removed = {
    dbRow: false,
    assets: 0,
    thumbnails: 0,
    publicThumbnail: false,
    regenerated: false,
  };

  // Guards (grilling Q9 / Q2). Both refuse without touching anything.
  if (planMatchesNothing(plan)) {
    return { plan, block: 'EMPTY_MATCH', applied: false, removed };
  }
  if (plan.userSiteCount > 0 && !force) {
    return { plan, block: 'USER_SITES_REFERENCE', applied: false, removed };
  }

  if (dryRun) {
    return { plan, block: null, applied: false, removed };
  }

  // 1. DB row first — its FK RESTRICT is the hard gate. If this throws, nothing
  //    irreversible has happened yet.
  if (plan.dbRowId) {
    const repo = new SupabaseTemplateRepositoryImpl(supabase);
    await repo.delete(plan.dbRowId);
    removed.dbRow = true;
  }

  // 2. template_assets bucket.
  if (plan.assetPaths.length > 0) {
    const { error } = await supabase.storage.from(TEMPLATE_ASSETS_BUCKET).remove(plan.assetPaths);
    if (error) throw error;
    removed.assets = plan.assetPaths.length;
  }

  // 3. template-thumbnails bucket.
  if (plan.thumbnailPaths.length > 0) {
    const { error } = await supabase.storage.from(THUMBNAILS_BUCKET).remove(plan.thumbnailPaths);
    if (error) throw error;
    removed.thumbnails = plan.thumbnailPaths.length;
  }

  // 4. Committed public webp (working tree — shows as a git deletion to commit).
  if (plan.publicThumbnail) {
    fs.rmSync(plan.publicThumbnail, { force: true });
    removed.publicThumbnail = true;
  }

  // 5. Regenerate _generated.ts. No-op while the source dir is still present
  //    (the skill regenerates again after `git rm`); in the orphan case this is
  //    what finally drops the stale key.
  removed.regenerated = regenerateGenerated(projectRoot);

  // Audit (grilling Q8) — reuse template_sync_audit with an action marker.
  await supabase.from('template_sync_audit').insert({
    performed_by: performedBy ?? 'CLI',
    affected_slugs: [templateKey],
    dry_run: false,
    summary: {
      action: 'delete',
      db_row_removed: removed.dbRow,
      assets_removed: removed.assets,
      thumbnails_removed: removed.thumbnails,
      public_removed: removed.publicThumbnail,
      regenerated: removed.regenerated,
      forced: force && plan.userSiteCount > 0,
    },
  });

  return { plan, block: null, applied: true, removed };
}
