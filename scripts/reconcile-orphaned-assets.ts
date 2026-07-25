/**
 * Reconciles the `user_assets` storage bucket against `auth.users` and
 * `assets` to find pre-existing leaks the Account Erasure pipeline (#117,
 * ADR-0014) can't retroactively fix — Tombstones only cover deletes from now
 * on. One-time / occasional dry-run script, not a scheduled worker.
 *
 * Storage layout is `${user_id}/${asset_id}/${filename}` (see
 * confirmAssetUpload / the cron cleanup route), so a 3-way cross-reference
 * of bucket prefixes <-> auth.users <-> assets rows separates two distinct
 * orphan kinds:
 *   (a) no matching auth.users row for the user_id prefix
 *       -> leaked by a past account deletion (the #116/#117 bug)
 *   (b) auth.users row exists, but no `assets` row for the asset_id prefix
 *       -> leaked by some other path (e.g. upload never confirmed)
 *
 * Usage:
 *   pnpm reconcile:orphaned-assets                # dry-run (default)
 *   pnpm reconcile:orphaned-assets --apply         # delete what was found
 *   pnpm reconcile:orphaned-assets --apply --yes   # skip the confirm countdown
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const BUCKET = 'user_assets';
const PAGE_SIZE = 1000;
// Objects newer than this are left alone even when orphan kind (b) matches —
// the Reserve-Confirm upload flow (ADR-0003) is briefly "orphaned" between
// initUploadAction and confirmUploadAction. Mirrors sweep_orphaned_assets'
// own 1-hour margin (008).
const MIN_ORPHAN_AGE_MS = 60 * 60 * 1000;

const args = process.argv.slice(2);
const isApply = args.includes('--apply');
const isYes = args.includes('--yes');

type StorageEntry = {
  name: string;
  id: string | null;
  created_at?: string | null;
};

async function listAll(path: string): Promise<StorageEntry[]> {
  const out: StorageEntry[] = [];
  let offset = 0;
  for (;;) {
    const { data, error } = await supabase.storage.from(BUCKET).list(path, {
      limit: PAGE_SIZE,
      offset,
    });
    if (error) throw new Error(`storage.list(${JSON.stringify(path)}) failed: ${error.message}`);
    if (!data || data.length === 0) break;
    out.push(...data);
    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  return out;
}

/** Supabase Storage has no real directories: a "folder" entry has id === null. */
const isFolder = (e: StorageEntry) => e.id === null;
const isFile = (e: StorageEntry) => e.id !== null;

type OrphanKindA = { kind: 'no-auth-user'; userId: string; objectCount: number };
type OrphanKindB = { kind: 'no-asset-row'; userId: string; assetId: string; paths: string[]; ageMs: number };

async function countdown(seconds: number) {
  for (let i = seconds; i > 0; i--) {
    process.stdout.write(`\r⚠️  Deleting in ${i}s... (Ctrl+C to cancel) `);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  console.log('\r🚀 Deleting now...                            ');
}

async function run() {
  console.log(`🔍 reconcile:orphaned-assets — ${isApply ? 'APPLY' : 'DRY-RUN (Preview)'}`);

  const userPrefixes = (await listAll('')).filter(isFolder).map((e) => e.name);
  console.log(`\nFound ${userPrefixes.length} user prefix(es) in "${BUCKET}".`);

  const kindA: OrphanKindA[] = [];
  const kindB: OrphanKindB[] = [];
  const pathsToDelete: string[] = [];

  for (const userId of userPrefixes) {
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    const userExists = !authError && !!authUser?.user;

    const assetEntries = await listAll(userId);
    const assetFolders = assetEntries.filter(isFolder).map((e) => e.name);

    if (!userExists) {
      let objectCount = 0;
      for (const assetId of assetFolders) {
        const files = (await listAll(`${userId}/${assetId}`)).filter(isFile);
        objectCount += files.length;
        for (const f of files) pathsToDelete.push(`${userId}/${assetId}/${f.name}`);
      }
      kindA.push({ kind: 'no-auth-user', userId, objectCount });
      continue;
    }

    if (assetFolders.length === 0) continue;

    const { data: assetRows, error: assetsError } = await supabase
      .from('assets')
      .select('id')
      .in('id', assetFolders);
    if (assetsError) throw new Error(`assets lookup failed for user ${userId}: ${assetsError.message}`);

    const knownAssetIds = new Set((assetRows ?? []).map((r) => r.id as string));

    for (const assetId of assetFolders) {
      if (knownAssetIds.has(assetId)) continue;

      const files = (await listAll(`${userId}/${assetId}`)).filter(isFile);
      const now = Date.now();
      const ages = files.map((f) => now - (f.created_at ? new Date(f.created_at).getTime() : now));
      const minAge = ages.length > 0 ? Math.min(...ages) : Infinity;

      const paths = files.map((f) => `${userId}/${assetId}/${f.name}`);
      kindB.push({ kind: 'no-asset-row', userId, assetId, paths, ageMs: minAge });

      if (minAge >= MIN_ORPHAN_AGE_MS) {
        pathsToDelete.push(...paths);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`(a) no matching auth.users row (leaked by account deletion): ${kindA.length} prefix(es)`);
  for (const a of kindA.slice(0, 20)) {
    console.log(`  - ${a.userId}  (${a.objectCount} object(s))`);
  }
  if (kindA.length > 20) console.log(`  ... and ${kindA.length - 20} more`);

  console.log(`\n(b) auth.users exists, no matching assets row (leaked by another path): ${kindB.length} prefix(es)`);
  for (const b of kindB.slice(0, 20)) {
    const tooYoung = b.ageMs < MIN_ORPHAN_AGE_MS ? '  (< 1h old — skipped, likely in-flight upload)' : '';
    console.log(`  - ${b.userId}/${b.assetId}  (${b.paths.length} object(s))${tooYoung}`);
  }
  if (kindB.length > 20) console.log(`  ... and ${kindB.length - 20} more`);

  console.log('='.repeat(60));
  console.log(`Total objects eligible for deletion: ${pathsToDelete.length}`);

  if (!isApply) {
    console.log('\n💡 Run with --apply to delete these objects from storage.');
    return;
  }

  if (pathsToDelete.length === 0) {
    console.log('\n✨ Nothing to delete.');
    return;
  }

  if (!isYes) {
    await countdown(5);
  }

  // Storage `.remove()` accepts at most a few hundred paths reliably in one call.
  const CHUNK = 100;
  let removed = 0;
  for (let i = 0; i < pathsToDelete.length; i += CHUNK) {
    const chunk = pathsToDelete.slice(i, i + CHUNK);
    const { error } = await supabase.storage.from(BUCKET).remove(chunk);
    if (error) {
      console.error(`\n❌ Failed to remove batch starting at ${i}: ${error.message}`);
      continue;
    }
    removed += chunk.length;
  }

  console.log(`\n✅ Removed ${removed}/${pathsToDelete.length} object(s) from "${BUCKET}".`);
}

run().catch((err: unknown) => {
  console.error('Fatal error during reconciliation:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
