import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Opt out of caching, this is a worker endpoint run by cron
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  // Authorization boundary: typically check API key or internal header if called from Vercel Cron
  // if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  const supabase = await createClient();

  // 1. Sweep orphans
  console.log('[Cleanup Cron] Sweeping orphans...');
  const { error: sweepError } = await supabase.rpc('sweep_orphaned_assets');
  if (sweepError) {
    console.warn('[Cleanup Cron] sweep_orphaned_assets failed:', sweepError.message);
  }

  // 2. Consume from cleanup_queue using Claim pattern (RETURNING *)
  console.log('[Cleanup Cron] Claiming a task from queue...');
  const { data: claimData, error: claimError } = await supabase.rpc('claim_cleanup_task');

  if (claimError) {
    console.error('[Cleanup Cron] Claim failed:', claimError.message);
    return NextResponse.json({ error: 'Claim failed' }, { status: 500 });
  }

  // claimData returns an array, but with LIMIT 1 it either has 1 or 0 elements
  if (!claimData || claimData.length === 0) {
    return NextResponse.json({ message: 'No pending tasks left in queue' });
  }

  const task = claimData[0];
  const assetId = task.asset_id;

  try {
    console.log(`[Cleanup Cron] Processing asset ID: ${assetId}`);

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
      return NextResponse.json({ message: 'Aborted: Asset in use.' });
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

    console.log(`[Cleanup Cron] Successfully cleared asset ${assetId}`);

    return NextResponse.json({ message: `Processed ${assetId}` });
  } catch (err: any) {
    console.error(`[Cleanup Cron] Task ${task.id} failed:`, err.message);

    // Rollback task status
    await supabase.from('cleanup_queue').update({
      status: 'failed',
      last_error: err.message,
      retry_count: task.retry_count + 1,
      updated_at: new Date().toISOString()
    }).eq('id', task.id);

    return NextResponse.json({ error: 'Processing error', details: err.message }, { status: 500 });
  }
}
