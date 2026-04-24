-- ============================================
-- Layer0 Studio: Atomic Save RPC with Lock
-- ============================================

CREATE OR REPLACE FUNCTION public.save_site_template_with_lock(
  p_site_id UUID,
  p_new_json JSONB,
  p_new_usages JSONB -- [{ "asset_id": "uuid", "slot_key": "string" }, ...]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- To ensure it can bypass some RLS if strictly needed, or run as invoker
AS $$
DECLARE
  v_old_json JSONB;
BEGIN
  -- 단계 1 & 2: 락 획득 (FOR UPDATE)
  SELECT site_json INTO v_old_json FROM public.user_sites WHERE id = p_site_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Site % not found', p_site_id;
  END IF;

  -- 단계 3 & 8: Orphaned Assets 찾아서 cleanup_queue 에 Push
  -- 현재 DB에 존재하는 usage 중 새 JSON 에 존재하지 않는 asset_id 들 추출
  INSERT INTO public.cleanup_queue (asset_id)
  SELECT old_u.asset_id 
  FROM public.asset_usages old_u
  WHERE old_u.site_id = p_site_id 
    AND old_u.asset_id NOT IN (
      SELECT (value->>'asset_id')::UUID 
      FROM jsonb_array_elements(p_new_usages)
    )
  ON CONFLICT (asset_id) DO NOTHING;
  
  -- 단계 5: 기존 usage (Transaction 단위에서 일괄) 삭제
  DELETE FROM public.asset_usages WHERE site_id = p_site_id;
  
  -- 단계 6: 새 usage 삽입
  -- json 배열 항목별로 row 재생성
  INSERT INTO public.asset_usages (asset_id, site_id, slot_key)
  SELECT 
    (value->>'asset_id')::UUID, 
    p_site_id, 
    (value->>'slot_key')
  FROM jsonb_array_elements(p_new_usages)
  WHERE (value->>'asset_id') IS NOT NULL
  ON CONFLICT (asset_id, site_id, slot_key) DO NOTHING;

  -- 단계 4: JSON 상태 갱신
  UPDATE public.user_sites 
  SET site_json = p_new_json, 
      updated_at = now() 
  WHERE id = p_site_id;

END;
$$;
