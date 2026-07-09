-- ============================================
-- Layer0 Studio: JSON 컬럼 → content / snapshot 리네임
-- ADR-0013. 코드의 TemplateJson → ContentModel 리네임을 DB 스키마에 정합.
--
--   templates.template_json      → content
--   user_sites.site_json         → content
--   user_sites.template_snapshot → snapshot
--
-- ⚠️ 이것은 하위호환이 아닌 파괴적 스키마 변경이다. 구 컬럼명을 참조하는
--    코드(배포 전)와 신 컬럼명을 기대하는 코드(배포 후)가 공존할 수 없다.
--    반드시 **coordinated deploy**: 이 마이그레이션 적용과 해당 코드 배포를
--    함께 진행한다(짧은 순간 불일치 감수 — 초기 규모라 수용, ADR-0007 참조).
--
-- 참고: JSONB *내부* 키 리네임(section.data → section.fields)은 이 마이그레이션에
--       포함하지 않는다. 그건 데이터 백필이 필요한 별도 작업(마이그레이션 022).
-- ============================================

BEGIN;

-- 1) 컬럼 rename.
--    인덱스·제약·RLS 정책은 컬럼에 (이름이 아니라 내부 id로) 바인딩되어
--    RENAME COLUMN 시 자동 승계된다. 별도 조치 불필요.
ALTER TABLE public.templates   RENAME COLUMN template_json      TO content;
ALTER TABLE public.user_sites  RENAME COLUMN site_json          TO content;
ALTER TABLE public.user_sites  RENAME COLUMN template_snapshot  TO snapshot;

-- 2) save_site_template_with_lock 재생성.
--    함수 본문은 텍스트로 컴파일되어 RENAME COLUMN 으로 자동 갱신되지 않으므로
--    content 컬럼 기준으로 다시 만든다. 시그니처는 010 과 동일
--    (UUID, JSONB, JSONB, TIMESTAMPTZ) RETURNS TEXT — 호출부(.rpc) 변경 없음.
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
  SELECT content, updated_at
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

  -- Update content
  UPDATE public.user_sites
  SET    content    = p_new_json,
         updated_at = now()
  WHERE  id = p_site_id;

  RETURN 'OK';
END;
$$;

COMMIT;
