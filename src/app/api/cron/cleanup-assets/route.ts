import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';

// Opt out of caching, this is a worker endpoint run by cron
export const dynamic = 'force-dynamic';
export const revalidate = 0;
// Vercel function budget for this route. The loops below stop well before
// this so a run always finishes cleanly instead of being killed mid-item.
export const maxDuration = 60;

const TIME_BUDGET_MS = 50_000;
const MAX_QUEUE_ITEMS_PER_RUN = 50;
const TOMBSTONE_BATCH_SIZE = 25;
const MAX_TOMBSTONE_BATCHES_PER_RUN = 10;

type SupabaseAdminClient = Awaited<ReturnType<typeof createAdminClient>>;

type CleanupQueueTask = {
  id: string;
  asset_id: string;
  retry_count: number;
};

type AssetTombstone = {
  id: string;
  bucket: string;
  path: string;
  retry_count: number;
};

/**
 * Processes exactly one `cleanup_queue` task (unchanged logic from the
 * original single-item handler): verify the asset is still orphaned, remove
 * its storage object, then drop the asset row.
 */
async function processCleanupQueueTask(supabase: SupabaseAdminClient, task: CleanupQueueTask) {
  const assetId = task.asset_id;

  try {
    // (A) Check usage table again just to be strictly safe
    const { count, error: countError } = await supabase
      .from('asset_usages')
      .select('*', { count: 'exact', head: true })
      .eq('asset_id', assetId);

    if (countError) throw new Error('Failed to verify usage count: ' + countError.message);

    if (count !== null && count > 0) {
      // It's still in use. This shouldn't happen unless re-adopted in an extremely tight window
      console.log(`[Cleanup Cron] Asset ${assetId} re-adopted. Removing from queue.`);
      await supabase.from('cleanup_queue').delete().eq('id', task.id);
      return { assetId, outcome: 'aborted-in-use' as const };
    }

    // (B) Retrieve file info
    const { data: assetData, error: assetFetchError } = await supabase
      .from('assets')
      .select('*')
      .eq('id', assetId)
      .single();

    if (assetFetchError) throw new Error('Failed to fetch asset metadata: ' + assetFetchError.message);

    // (C) Remove physical file from Storage bucket
    if (assetData) {
      const storagePath = `${assetData.user_id}/${assetData.id}/${assetData.filename}`;
      const { error: storageError } = await supabase.storage
        .from('user_assets')
        .remove([storagePath]);

      if (storageError) {
        console.warn(`[Cleanup Cron] Storage file removal failed/not found: ${storageError.message}`);
        // Not throwing to allow DB wipe if file is already missing
      }
    }

    // (D) Remove Asset metadata (This will cascade delete cleanup_queue entry)
    const { error: deleteError } = await supabase
      .from('assets')
      .delete()
      .eq('id', assetId);

    if (deleteError) throw new Error('Failed to delete asset metadata: ' + deleteError.message);

    return { assetId, outcome: 'processed' as const };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Cleanup Cron] Task ${task.id} failed:`, message);

    await supabase.from('cleanup_queue').update({
      status: 'failed',
      last_error: message,
      retry_count: task.retry_count + 1,
      updated_at: new Date().toISOString(),
    }).eq('id', task.id);

    return { assetId, outcome: 'failed' as const, error: message };
  }
}

/**
 * Drains up to MAX_QUEUE_ITEMS_PER_RUN cleanup_queue tasks, claiming one at a
 * time (claim_cleanup_task's SKIP LOCKED contract stays LIMIT 1 — see 008),
 * stopping early once the time budget runs out. This is what turns the old
 * "one asset per cron invocation" throughput into "up to N per invocation".
 */
async function drainCleanupQueue(supabase: SupabaseAdminClient, deadline: number) {
  const results = { processed: 0, abortedInUse: 0, failed: 0 };

  for (let i = 0; i < MAX_QUEUE_ITEMS_PER_RUN && Date.now() < deadline; i++) {
    const { data: claimData, error: claimError } = await supabase.rpc('claim_cleanup_task');

    if (claimError) {
      console.error('[Cleanup Cron] Claim failed:', claimError.message);
      break;
    }
    if (!claimData || claimData.length === 0) break;

    const outcome = await processCleanupQueueTask(supabase, claimData[0]);
    if (outcome.outcome === 'processed') results.processed++;
    else if (outcome.outcome === 'aborted-in-use') results.abortedInUse++;
    else results.failed++;
  }

  return results;
}

/**
 * Drains `asset_tombstones` rows — the Account Erasure safety net (ADR-0014).
 * Any path an inline drain (from `deleteAccountAction`) didn't clear, or that
 * got recorded by any other path deleting an `assets` row, ends up here.
 * Claimed in batches (`claim_asset_tombstones`, 025); each path is removed
 * individually so one bad path can't fail its whole batch's status update.
 */
async function drainAssetTombstones(supabase: SupabaseAdminClient, deadline: number) {
  const results = { done: 0, failed: 0 };

  for (let batch = 0; batch < MAX_TOMBSTONE_BATCHES_PER_RUN && Date.now() < deadline; batch++) {
    const { data, error } = await supabase.rpc('claim_asset_tombstones', {
      p_limit: TOMBSTONE_BATCH_SIZE,
    });

    if (error) {
      console.error('[Cleanup Cron] Tombstone claim failed:', error.message);
      break;
    }

    const tombstones = (data ?? []) as AssetTombstone[];
    if (tombstones.length === 0) break;

    for (const tombstone of tombstones) {
      const { error: storageError } = await supabase.storage
        .from(tombstone.bucket)
        .remove([tombstone.path]);

      if (storageError) {
        console.warn(`[Cleanup Cron] Tombstone ${tombstone.id} storage removal failed: ${storageError.message}`);
        await supabase
          .from('asset_tombstones')
          .update({
            status: 'failed',
            last_error: storageError.message,
            retry_count: tombstone.retry_count + 1,
          })
          .eq('id', tombstone.id);
        results.failed++;
      } else {
        await supabase
          .from('asset_tombstones')
          .update({ status: 'done', last_error: null })
          .eq('id', tombstone.id);
        results.done++;
      }
    }

    if (tombstones.length < TOMBSTONE_BATCH_SIZE) break; // queue drained
  }

  return results;
}

export async function GET(req: Request) {
  if (!process.env.CRON_SECRET) {
    console.error('[Cleanup Cron] CRON_SECRET env var is not set');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createAdminClient();
  const deadline = Date.now() + TIME_BUDGET_MS;

  console.log('[Cleanup Cron] Sweeping orphans...');
  const { error: sweepError } = await supabase.rpc('sweep_orphaned_assets');
  if (sweepError) {
    console.warn('[Cleanup Cron] sweep_orphaned_assets failed:', sweepError.message);
  }

  console.log('[Cleanup Cron] Draining cleanup_queue...');
  const queueResults = await drainCleanupQueue(supabase, deadline);

  console.log('[Cleanup Cron] Draining asset_tombstones...');
  const tombstoneResults = await drainAssetTombstones(supabase, deadline);

  return NextResponse.json({
    cleanupQueue: queueResults,
    assetTombstones: tombstoneResults,
  });
}
