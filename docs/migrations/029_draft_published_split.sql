-- ============================================
-- Layer0 Studio: 작업본(draft) / 공개본(published) 분리
--
-- 문제: 지금까지 "게시"는 user_sites.status 를 'active' 로 뒤집는 일이었고,
-- 공개 렌더러는 그 행의 content 를 그대로 읽었다. 즉 한 번 게시된 사이트는
-- 이후 모든 저장이 곧바로 공개 사이트에 반영된다. 편집 중인 반쯤 지운 문구가
-- 방문자에게 보인다는 뜻이고, "변경 사항 게시" 버튼은 첫 게시 이후 아무
-- 의미가 없었다.
--
-- 해결: 같은 행에 두 벌을 둔다.
--   content            = 작업본. 저장 버튼으로만 바뀐다.
--   published_content  = 공개본. 게시 버튼으로만 바뀐다. NULL = 미게시.
--
-- 파생되는 두 가지가 이 마이그레이션의 나머지 절반이다.
--
--  (1) 에셋 수명. save RPC 는 사이트의 asset_usages 를 통째로 지우고 다시
--      넣으면서, 사라진 에셋을 cleanup_queue 로 보낸다. 작업본에서 이미지를
--      지웠다는 이유로 큐에 넣으면 그 이미지를 아직 쓰고 있는 공개 사이트가
--      깨진다. 그래서 asset_usages 에 scope 를 둔다 — 작업본 참조와 공개본
--      참조를 따로 세고, 둘 다에서 사라졌을 때만 회수 대상이다.
--
--  (2) 익명 읽기 경계. RLS 는 행 단위라 "공개 사이트의 행은 읽되 작업본
--      컬럼은 못 읽게"를 정책으로 표현할 수 없다. 기존 정책
--      "read active published sites" 는 active 사이트의 행 **전체**를 누구에게나
--      내준다. 분리를 해놓고 이 정책을 두면 PostgREST 로 content 를 직접
--      긁어 미게시 편집을 읽을 수 있다 — 고치려던 문제가 그대로 남는다.
--      그래서 정책을 걷어내고, 공개 컬럼만 담은 뷰(published_sites)로
--      익명 읽기 경로를 좁힌다.
--
-- ⚠️ 코드와 함께 배포해야 한다(coordinated deploy). 상세 절차와 롤백은
--    029_draft_published_split.md 참조.
-- ============================================

BEGIN;

-- ============================================================
-- 1. 공개본 컬럼
-- ============================================================
ALTER TABLE public.user_sites
  ADD COLUMN IF NOT EXISTS published_content JSONB;

-- 백필 기준은 status 가 아니라 **게시된 적이 있는가** 다.
--
-- status='active' 만 보면 세 종류가 빠진다:
--   * unpublish 로 내린 사이트 — status='draft' 인데 published_at 은 남아 있다
--     (`SiteWriteUseCase.unpublish` 는 status 만 바꾼다). 도달 가능한 경로다.
--   * 관리자가 정지시킨 사이트 — 'suspended' 는 "게시된 것을 일시 정지"다.
--   * 위 둘이 다시 active 로 돌아가는 경우.
-- 이들을 NULL 로 두면 폐기 기준이 마지막 공개본이 아니라 최초 템플릿 snapshot 이
-- 되고, 재활성화해도 published_sites 뷰에서 빠져 404 가 된다.
--
-- ⚠️ 데이터 정책: 029 이전 스키마에는 "마지막 공개본"이라는 값이 **존재하지
--    않는다**. 게시는 status 플래그였고 공개 렌더러가 현재 content 를 읽었으므로,
--    한 번이라도 게시된 사이트에 대해 현재 content 는 마지막으로 공개된 상태
--    그 자체이거나(active) 마지막 공개 이후 편집이 섞인 값이다(unpublish 후 편집).
--    후자를 분리해낼 방법이 없으므로 **현재 content 를 가장 가까운 근사값으로
--    채택한다.** 즉 내렸다가 편집한 사이트는 그 편집분이 공개본 기준선에
--    포함된다. 대안은 그 사이트들의 기준선을 템플릿 원본으로 되돌리는 것인데,
--    그쪽이 명백히 더 나쁘다.
UPDATE public.user_sites
SET    published_content = content
WHERE  (status = 'active' OR published_at IS NOT NULL)
  AND  published_content IS NULL;

COMMENT ON COLUMN public.user_sites.content IS
  '작업본. 사용자의 명시적 저장으로만 바뀐다. 공개 렌더러는 이 값을 읽지 않는다.';
COMMENT ON COLUMN public.user_sites.published_content IS
  '공개본. publish_site_content 로만 바뀐다. NULL 이면 한 번도 게시되지 않은 사이트.';

-- ============================================================
-- 2. asset_usages scope
-- ============================================================
ALTER TABLE public.asset_usages
  ADD COLUMN IF NOT EXISTS scope TEXT NOT NULL DEFAULT 'draft';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'asset_usages_scope_check'
  ) THEN
    ALTER TABLE public.asset_usages
      ADD CONSTRAINT asset_usages_scope_check CHECK (scope IN ('draft', 'published'));
  END IF;
END $$;

-- 유니크 키에 scope 를 넣는다. 같은 에셋이 같은 슬롯에서 작업본과 공개본
-- 양쪽에 잡히는 것이 정상 상태이기 때문이다.
ALTER TABLE public.asset_usages
  DROP CONSTRAINT IF EXISTS asset_usages_asset_id_site_id_slot_key_key;
ALTER TABLE public.asset_usages
  DROP CONSTRAINT IF EXISTS asset_usages_scope_slot_key;
ALTER TABLE public.asset_usages
  ADD CONSTRAINT asset_usages_scope_slot_key UNIQUE (asset_id, site_id, scope, slot_key);

CREATE INDEX IF NOT EXISTS idx_asset_usages_site_scope
  ON public.asset_usages(site_id, scope);

-- 백필: 공개본을 갖게 된 사이트의 현재 참조는 공개본의 참조이기도 하다. 이 행이
-- 없으면 배포 직후 첫 저장에서 공개 사이트가 쓰는 이미지가 회수 큐로 간다.
--
-- 조건은 위 1번과 같은 집합이어야 하므로 status 가 아니라 published_content 의
-- 존재로 판정한다 — 1번이 방금 채웠으니 두 백필이 어긋날 수 없다.
INSERT INTO public.asset_usages (asset_id, site_id, slot_key, scope)
SELECT u.asset_id, u.site_id, u.slot_key, 'published'
FROM   public.asset_usages u
JOIN   public.user_sites s ON s.id = u.site_id
WHERE  u.scope = 'draft'
  AND  s.published_content IS NOT NULL
ON CONFLICT (asset_id, site_id, scope, slot_key) DO NOTHING;

-- ============================================================
-- 3. 익명 읽기 경계 — 정책 대신 뷰
-- ============================================================
-- 004 의 정책은 active 사이트의 행 전체(= content 포함)를 열어준다. 컬럼 단위
-- 권한으로 막으려 해도 소유자(authenticated)는 자기 사이트의 content 를 읽어야
-- 하므로 롤 단위로는 분리되지 않는다. 뷰가 유일하게 맞는 도구다.
DROP POLICY IF EXISTS "read active published sites" ON public.user_sites;

-- security_invoker = false: 호출자가 아니라 뷰 소유자(postgres) 권한으로
-- 기반 테이블을 읽는다 = user_sites 의 RLS 를 우회한다. 여기서는 그것이
-- 의도다. 접근 통제가 RLS 정책이 아니라 아래 WHERE 절과 SELECT 목록으로
-- 옮겨왔고, 그 둘이 "공개된 사이트의 공개 컬럼만"을 강제한다.
CREATE OR REPLACE VIEW public.published_sites
WITH (security_invoker = false) AS
SELECT
  s.id,
  s.site_name,
  s.domain,
  s.published_content,
  s.published_at,
  s.updated_at
FROM public.user_sites s
WHERE s.status = 'active'
  AND s.domain IS NOT NULL
  AND s.published_content IS NOT NULL;

REVOKE ALL ON public.published_sites FROM PUBLIC;
GRANT SELECT ON public.published_sites TO anon, authenticated;

COMMENT ON VIEW public.published_sites IS
  '공개 사이트 렌더링 전용 읽기 경로. 작업본(content)과 snapshot 은 의도적으로 빠져 있다.';

-- ============================================================
-- 4. save_site_template_with_lock — 작업본 스코프로 한정
-- ============================================================
-- 028 의 하드닝(호출자 검증 / 토큰 필수 / search_path) 위에 scope 만 얹는다.
-- 시그니처·반환 계약은 그대로다.
CREATE OR REPLACE FUNCTION public.save_site_template_with_lock(
  p_site_id              UUID,
  p_new_json             JSONB,
  p_new_usages           JSONB,
  p_expected_updated_at  TIMESTAMPTZ
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
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'save_site_template_with_lock requires an authenticated caller'
      USING ERRCODE = '42501';
  END IF;

  IF p_expected_updated_at IS NULL THEN
    RAISE EXCEPTION 'save_site_template_with_lock requires p_expected_updated_at'
      USING ERRCODE = '22004';
  END IF;

  SELECT user_id, updated_at
  INTO   v_owner_id, v_current_updated_at
  FROM   public.user_sites
  WHERE  id = p_site_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN 'NOT_FOUND';
  END IF;

  IF v_owner_id IS DISTINCT FROM v_caller THEN
    RETURN 'NOT_FOUND';
  END IF;

  IF v_current_updated_at IS DISTINCT FROM p_expected_updated_at THEN
    RETURN 'STALE_VERSION';
  END IF;

  -- 회수 후보: 작업본이 더는 참조하지 않고, **공개본도** 참조하지 않는 에셋.
  -- 두 번째 조건이 이 마이그레이션의 핵심이다. 이게 없으면 작업본에서 이미지를
  -- 지우는 순간 공개 사이트의 이미지가 회수 큐로 들어간다.
  --
  -- `value->>'asset_id' IS NOT NULL` 을 하위 질의에도 건다. NOT IN 은 목록에
  -- NULL 이 하나라도 있으면 전체가 NULL 이 되어 조용히 아무것도 회수하지 않는다.
  INSERT INTO public.cleanup_queue (asset_id)
  SELECT old_u.asset_id
  FROM   public.asset_usages old_u
  WHERE  old_u.site_id = p_site_id
    AND  old_u.scope = 'draft'
    AND  old_u.asset_id NOT IN (
           SELECT (value->>'asset_id')::UUID
           FROM   jsonb_array_elements(p_new_usages)
           WHERE  (value->>'asset_id') IS NOT NULL
         )
    AND  NOT EXISTS (
           SELECT 1
           FROM   public.asset_usages pub
           WHERE  pub.site_id = p_site_id
             AND  pub.scope = 'published'
             AND  pub.asset_id = old_u.asset_id
         )
  ON CONFLICT (asset_id) DO NOTHING;

  -- 작업본 참조만 교체한다. 공개본 참조는 건드리지 않는다.
  DELETE FROM public.asset_usages
  WHERE site_id = p_site_id AND scope = 'draft';

  INSERT INTO public.asset_usages (asset_id, site_id, slot_key, scope)
  SELECT
    (value->>'asset_id')::UUID,
    p_site_id,
    (value->>'slot_key'),
    'draft'
  FROM jsonb_array_elements(p_new_usages)
  WHERE (value->>'asset_id') IS NOT NULL
  ON CONFLICT (asset_id, site_id, scope, slot_key) DO NOTHING;

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
-- 5. publish_site_content — 작업본을 공개본으로 승격
-- ============================================================
-- 게시는 이제 상태 플래그가 아니라 복사다. 콘텐츠 복사와 공개본 참조 교체가
-- 한 트랜잭션에서 일어나야, 공개 사이트가 "새 JSON + 옛 참조" 같은 중간 상태를
-- 보지 않는다.
CREATE OR REPLACE FUNCTION public.publish_site_content(
  p_site_id              UUID,
  p_expected_updated_at  TIMESTAMPTZ
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
  v_draft              JSONB;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'publish_site_content requires an authenticated caller'
      USING ERRCODE = '42501';
  END IF;

  IF p_expected_updated_at IS NULL THEN
    RAISE EXCEPTION 'publish_site_content requires p_expected_updated_at'
      USING ERRCODE = '22004';
  END IF;

  SELECT user_id, updated_at, content
  INTO   v_owner_id, v_current_updated_at, v_draft
  FROM   public.user_sites
  WHERE  id = p_site_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN 'NOT_FOUND';
  END IF;

  IF v_owner_id IS DISTINCT FROM v_caller THEN
    RETURN 'NOT_FOUND';
  END IF;

  IF v_current_updated_at IS DISTINCT FROM p_expected_updated_at THEN
    RETURN 'STALE_VERSION';
  END IF;

  -- 직전 공개본만 쓰던 에셋은 이 승격으로 마지막 참조를 잃는다. 새 공개본은
  -- 곧 작업본의 복사본이므로, "작업본 참조에 없는 옛 공개본 참조"가 회수 후보다.
  INSERT INTO public.cleanup_queue (asset_id)
  SELECT old_pub.asset_id
  FROM   public.asset_usages old_pub
  WHERE  old_pub.site_id = p_site_id
    AND  old_pub.scope = 'published'
    AND  NOT EXISTS (
           SELECT 1
           FROM   public.asset_usages draft_u
           WHERE  draft_u.site_id = p_site_id
             AND  draft_u.scope = 'draft'
             AND  draft_u.asset_id = old_pub.asset_id
         )
  ON CONFLICT (asset_id) DO NOTHING;

  DELETE FROM public.asset_usages
  WHERE site_id = p_site_id AND scope = 'published';

  INSERT INTO public.asset_usages (asset_id, site_id, slot_key, scope)
  SELECT draft_u.asset_id, draft_u.site_id, draft_u.slot_key, 'published'
  FROM   public.asset_usages draft_u
  WHERE  draft_u.site_id = p_site_id
    AND  draft_u.scope = 'draft'
  ON CONFLICT (asset_id, site_id, scope, slot_key) DO NOTHING;

  UPDATE public.user_sites
  SET    published_content = v_draft,
         status            = 'active',
         published_at      = now(),
         updated_at        = now()
  WHERE  id = p_site_id;

  RETURN 'OK';
END;
$$;

REVOKE ALL ON FUNCTION public.publish_site_content(UUID, TIMESTAMPTZ) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.publish_site_content(UUID, TIMESTAMPTZ) TO authenticated;

COMMIT;
