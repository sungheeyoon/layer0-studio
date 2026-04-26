-- ============================================
-- Layer0 Studio: Optimistic Concurrency Control
-- Adds expected_updated_at check to save RPC.
-- Returns 'OK' | 'STALE_VERSION' instead of VOID.
-- ============================================

-- Drop the old VOID signature first
DROP FUNCTION IF EXISTS public.save_site_template_with_lock(UUID, JSONB, JSONB);

CREATE OR REPLACE FUNCTION public.save_site_template_with_lock(
  p_site_id              UUID,
  p_new_json             JSONB,
  p_new_usages           JSONB,           -- [{ "asset_id": "uuid", "slot_key": "string" }, ...]
  p_expected_updated_at  TIMESTAMPTZ DEFAULT NULL
)
RETURNS TEXT  -- 'OK' | 'STALE_VERSION'
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_json           JSONB;
  v_current_updated_at TIMESTAMPTZ;
BEGIN
  -- Lock the row
  SELECT site_json, updated_at
  INTO   v_old_json, v_current_updated_at
  FROM   public.user_sites
  WHERE  id = p_site_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Site % not found', p_site_id;
  END IF;

  -- Optimistic concurrency check
  IF p_expected_updated_at IS NOT NULL
     AND v_current_updated_at IS DISTINCT FROM p_expected_updated_at THEN
    RETURN 'STALE_VERSION';
  END IF;

  -- Push orphaned assets to cleanup queue
  INSERT INTO public.cleanup_queue (asset_id)
  SELECT old_u.asset_id
  FROM   public.asset_usages old_u
  WHERE  old_u.site_id = p_site_id
    AND  old_u.asset_id NOT IN (
           SELECT (value->>'asset_id')::UUID
           FROM   jsonb_array_elements(p_new_usages)
         )
  ON CONFLICT (asset_id) DO NOTHING;

  -- Replace usages
  DELETE FROM public.asset_usages WHERE site_id = p_site_id;

  INSERT INTO public.asset_usages (asset_id, site_id, slot_key)
  SELECT
    (value->>'asset_id')::UUID,
    p_site_id,
    (value->>'slot_key')
  FROM jsonb_array_elements(p_new_usages)
  WHERE (value->>'asset_id') IS NOT NULL
  ON CONFLICT (asset_id, site_id, slot_key) DO NOTHING;

  -- Update JSON
  UPDATE public.user_sites
  SET    site_json  = p_new_json,
         updated_at = now()
  WHERE  id = p_site_id;

  RETURN 'OK';
END;
$$;
