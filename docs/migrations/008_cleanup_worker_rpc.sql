-- ============================================
-- Layer0 Studio: Cleanup Worker Task Claim RPC
-- ============================================

CREATE OR REPLACE FUNCTION public.claim_cleanup_task()
RETURNS TABLE (
  id UUID,
  asset_id UUID,
  status TEXT,
  retry_count INT,
  last_error TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.cleanup_queue
  SET status = 'processing',
      updated_at = now()
  WHERE public.cleanup_queue.id = (
    SELECT q.id 
    FROM public.cleanup_queue q
    WHERE q.status IN ('pending', 'failed') 
      AND q.retry_count < 3 
      -- AND q.created_at < now() - interval '1 minute'   -- (옵션) 생성 직후 바로 삭제되는 것 방지
    ORDER BY q.created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT 1
  )
  RETURNING 
    public.cleanup_queue.id,
    public.cleanup_queue.asset_id,
    public.cleanup_queue.status,
    public.cleanup_queue.retry_count,
    public.cleanup_queue.last_error,
    public.cleanup_queue.created_at,
    public.cleanup_queue.updated_at;
END;
$$;

-- TTL 강제 파기 (orphan items in assets table not inside asset_usages, created > 1 hour ago)
CREATE OR REPLACE FUNCTION public.sweep_orphaned_assets()
RETURNS SETOF UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1시간 이상 active 되지 않고 pending으로 남았거나, active지만 사용처가 없는 자산들을 cleanup_queue에 강제 삽입
  INSERT INTO public.cleanup_queue (asset_id)
  SELECT a.id 
  FROM public.assets a
  WHERE a.created_at < now() - interval '1 hour'
    AND NOT EXISTS (
      SELECT 1 FROM public.asset_usages u WHERE u.asset_id = a.id
    )
  ON CONFLICT DO NOTHING;

  RETURN;
END;
$$;
