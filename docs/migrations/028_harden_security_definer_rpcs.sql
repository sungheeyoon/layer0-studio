-- ============================================
-- Layer0 Studio: SECURITY DEFINER 함수 하드닝
--
-- 문제: 이 저장소의 SECURITY DEFINER 함수 전부가
--   (a) EXECUTE 권한을 회수한 적이 없고 — PostgreSQL 은 신규 함수의 EXECUTE 를
--       기본적으로 PUBLIC 에 부여한다. Supabase 의 anon/authenticated 롤은
--       PUBLIC 을 상속하므로 익명 키만으로 PostgREST `/rest/v1/rpc/<name>` 호출이
--       가능하다.
--   (b) search_path 를 고정하지 않았고,
--   (c) 함수 본문 안에 호출자 검증이 없다.
--
-- SECURITY DEFINER 는 소유자(postgres) 권한으로 실행되므로 RLS 를 우회한다.
-- 즉 "RLS 가 있으니 괜찮다"가 성립하지 않는다. 애플리케이션 레이어의 소유권
-- 검사(loadOwned / withUser)는 RPC 를 직접 때리는 호출자에게는 존재하지 않는다.
--
-- 영향:
--   * save_site_template_with_lock — 로그인한 아무 사용자나 남의 site_id 를 넣어
--     콘텐츠를 통째로 덮어쓸 수 있다. p_expected_updated_at 을 생략하면
--     낙관적 동시성 검사(ADR-0004)까지 건너뛴다.
--   * request_account_erasure — 인자로 받은 user_id 의 assets / user_sites 를
--     삭제한다. 남의 UUID 를 넣으면 그 사용자의 사이트가 전부 사라진다.
--     이 저장소에서 가장 심각한 노출이다.
--
-- 원칙: 함수마다 정당한 호출자가 하나뿐이므로 그 롤에만 EXECUTE 를 준다.
--   * save_site_template_with_lock → 사용자 세션(authenticated). 본문에서
--     auth.uid() 로 소유권을 직접 검사한다.
--   * 나머지 전부 → 서비스 롤 전용(크론 라우트 / deleteAccountAction 은
--     createAdminClient 로 호출한다). authenticated 에게 줄 이유가 없다.
--
-- 적용 전후 확인 쿼리.
--
-- ⚠️ proacl 을 눈으로 읽어 판정하지 말 것. **`proacl IS NULL` 이 곧 "기본 권한"
--    이고, 함수의 기본 권한은 PUBLIC EXECUTE 다.** 즉 ACL 이 비어 있는 것은
--    "아무도 못 쓴다"가 아니라 "누구나 쓴다"이며, 하드닝 전 이 저장소의 함수는
--    전부 그 상태다. `=X/postgres` 같은 PUBLIC 항목이 안 보인다고 안전하다고
--    결론내면 정확히 거꾸로 읽는 것이다.
--
-- 롤별로 직접 물어보는 것이 유일하게 믿을 수 있는 확인이다:
--
--   SELECT p.oid::regprocedure AS fn,
--          p.proconfig,
--          has_function_privilege('anon',          p.oid, 'EXECUTE') AS anon,
--          has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated,
--          has_function_privilege('service_role',  p.oid, 'EXECUTE') AS service_role
--   FROM   pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
--   WHERE  n.nspname = 'public' AND p.prosecdef
--   ORDER  BY 1;
--
-- 적용 후 기대값:
--   save_site_template_with_lock   anon=f  authenticated=t  service_role=f
--   publish_site_content (029)     anon=f  authenticated=t  service_role=f
--   request_account_erasure        anon=f  authenticated=f  service_role=t
--   claim_cleanup_task             anon=f  authenticated=f  service_role=t
--   claim_asset_tombstones         anon=f  authenticated=f  service_role=t
--   sweep_orphaned_assets          anon=f  authenticated=f  service_role=t
--   tombstone_asset_before_delete  anon=f  authenticated=f  service_role=?  (트리거 전용)
--
-- 마지막 줄의 service_role 은 프로젝트의 default privileges 설정에 따라 t 일 수
-- 있다. 트리거로만 실행되는 함수이고 트리거 실행은 EXECUTE 권한과 무관하므로
-- 무해하다. 중요한 것은 anon / authenticated 가 f 인 것이다.
--
-- proconfig 에는 전부 {search_path=public,pg_temp} 가 들어 있어야 한다.
-- ============================================

BEGIN;

-- ============================================================
-- 1. save_site_template_with_lock — 호출자 검증을 함수 안으로
-- ============================================================
-- 021 대비 달라지는 점:
--   * SET search_path 고정
--   * auth.uid() 가 NULL 이면 거절 (서비스 롤로는 호출할 수 없다)
--   * 소유자가 아니면 'NOT_FOUND' — 존재 여부를 흘리지 않기 위해 미존재와 같은 값
--   * p_expected_updated_at DEFAULT 제거 + NULL 거절. 낙관적 동시성 우회를
--     허용하는 관리자 경로는 이 RPC 가 아니라 user_sites 직접 UPDATE 쪽이다
--     (AdminUpdateSiteUseCase → repository.update(id, dto, null)).
--   * 쓰이지 않던 v_old_json 제거
--
-- 반환값 계약이 'OK' | 'STALE_VERSION' 에서 'OK' | 'STALE_VERSION' | 'NOT_FOUND'
-- 로 넓어진다. 호출부(SupabaseUserSiteRepositoryImpl.updateContent)를 같은
-- 배포에 맞춰야 한다.
--
-- DEFAULT 를 떼는 것이라 CREATE OR REPLACE 가 아니라 DROP + CREATE 로 간다.
-- 같은 트랜잭션 안이므로 함수가 사라진 순간은 외부에서 관측되지 않는다.
DROP FUNCTION IF EXISTS public.save_site_template_with_lock(UUID, JSONB, JSONB, TIMESTAMPTZ);

CREATE FUNCTION public.save_site_template_with_lock(
  p_site_id              UUID,
  p_new_json             JSONB,
  p_new_usages           JSONB,           -- [{ "asset_id": "uuid", "slot_key": "string" }, ...]
  p_expected_updated_at  TIMESTAMPTZ      -- 필수. NULL 은 거절한다.
)
RETURNS TEXT  -- 'OK' | 'STALE_VERSION' | 'NOT_FOUND'
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller             UUID := auth.uid();
  v_owner_id           UUID;
  v_current_updated_at TIMESTAMPTZ;
BEGIN
  -- 서비스 롤/익명 호출 차단. 이 함수는 사용자 세션 전용이다.
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'save_site_template_with_lock requires an authenticated caller'
      USING ERRCODE = '42501';
  END IF;

  -- 버전 토큰 없는 저장은 다른 탭의 작업을 조용히 파괴한다 (ADR-0004).
  IF p_expected_updated_at IS NULL THEN
    RAISE EXCEPTION 'save_site_template_with_lock requires p_expected_updated_at'
      USING ERRCODE = '22004';
  END IF;

  -- Lock the row
  SELECT user_id, updated_at
  INTO   v_owner_id, v_current_updated_at
  FROM   public.user_sites
  WHERE  id = p_site_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN 'NOT_FOUND';
  END IF;

  -- 소유권 검사. 미존재와 같은 값을 돌려주어 site_id 열거를 막는다.
  IF v_owner_id IS DISTINCT FROM v_caller THEN
    RETURN 'NOT_FOUND';
  END IF;

  -- Optimistic concurrency check
  IF v_current_updated_at IS DISTINCT FROM p_expected_updated_at THEN
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

REVOKE ALL ON FUNCTION public.save_site_template_with_lock(UUID, JSONB, JSONB, TIMESTAMPTZ)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_site_template_with_lock(UUID, JSONB, JSONB, TIMESTAMPTZ)
  TO authenticated;

-- ============================================================
-- 2. 서비스 롤 전용 함수들 — 본문은 그대로, 권한만 잠근다
-- ============================================================
-- 아래 넷은 전부 createAdminClient()(서비스 롤)로만 호출된다:
--   request_account_erasure  ← deleteAccountAction
--   claim_cleanup_task       ← /api/cron/cleanup-assets
--   claim_asset_tombstones   ← /api/cron/cleanup-assets
--   sweep_orphaned_assets    ← /api/cron/cleanup-assets
-- 소유권 검사는 호출 전 애플리케이션 레이어(withUser / Bearer CRON_SECRET)에
-- 있고, 서비스 롤은 그 경로로만 도달한다. 따라서 함수 안에 auth.uid() 검사를
-- 넣는 대신(서비스 롤에서는 auth.uid() 가 NULL 이라 넣을 수도 없다) EXECUTE 를
-- service_role 로 좁히는 것이 올바른 방어다.

ALTER FUNCTION public.request_account_erasure(UUID)     SET search_path = public, pg_temp;
ALTER FUNCTION public.claim_cleanup_task()              SET search_path = public, pg_temp;
ALTER FUNCTION public.claim_asset_tombstones(INT)       SET search_path = public, pg_temp;
ALTER FUNCTION public.sweep_orphaned_assets()           SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.request_account_erasure(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_cleanup_task()          FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_asset_tombstones(INT)   FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sweep_orphaned_assets()       FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.request_account_erasure(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_cleanup_task()          TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_asset_tombstones(INT)   TO service_role;
GRANT EXECUTE ON FUNCTION public.sweep_orphaned_assets()       TO service_role;

-- ============================================================
-- 3. 트리거 전용 함수 — 직접 호출 경로를 닫는다
-- ============================================================
-- tombstone_asset_before_delete 는 assets 의 BEFORE DELETE 트리거로만 실행된다
-- (024). 트리거 실행은 EXECUTE 권한과 무관하므로 전부 회수해도 계정 삭제
-- 파이프라인은 그대로 동작한다.
ALTER FUNCTION public.tombstone_asset_before_delete() SET search_path = public, pg_temp;
REVOKE ALL ON FUNCTION public.tombstone_asset_before_delete() FROM PUBLIC, anon, authenticated;

COMMIT;
