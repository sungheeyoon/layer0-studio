-- 025_claim_asset_tombstones.sql
-- Part of #117 / ADR-0014. Batch claim RPC for the Tombstone drain worker,
-- mirroring claim_cleanup_task's UPDATE ... FOR UPDATE SKIP LOCKED pattern
-- (008) but sized for a batch (p_limit) since this is a fresh queue with no
-- existing LIMIT 1 callers to stay compatible with.

CREATE OR REPLACE FUNCTION public.claim_asset_tombstones(p_limit INT DEFAULT 10)
RETURNS SETOF public.asset_tombstones
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.asset_tombstones
  SET status = 'processing',
      updated_at = now()
  WHERE id IN (
    SELECT t.id
    FROM public.asset_tombstones t
    WHERE t.status IN ('pending', 'failed')
      AND t.retry_count < 3
    ORDER BY t.created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT p_limit
  )
  RETURNING *;
END;
$$;
