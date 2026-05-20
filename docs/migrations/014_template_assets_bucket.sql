-- ============================================================
-- Migration 014: template_assets storage bucket + RLS
-- Date: 2026-05-20
--
-- AI generation 파이프라인이 Unsplash/Pexels 등에서 가져온 이미지를
-- 자체 호스팅하기 위한 신규 public 버킷.
--
-- user_assets와의 차이:
--   - 소유자: admin (canPublishTemplates) — 사용자별 격리 없음.
--   - 라이프사이클: 템플릿 자산은 cleanup_queue 흐름과 무관.
--   - 접근: 모두 public read (외부 사이트가 fetch).
--
-- Apply manually via Supabase dashboard SQL editor or `supabase db push`.
-- ============================================================

-- 1) Public bucket + bucket-level MIME/size guardrails
--    (Storage API call이 RLS 우회를 시도해도 bucket 제약은 항상 적용된다.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'template_assets',
  'template_assets',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
  SET public             = EXCLUDED.public,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2) RLS policies on storage.objects scoped to bucket_id = 'template_assets'.
--    service_role bypasses RLS by default — 정책은 authenticated/anon 요청만 게이트한다.
--    canPublishTemplates는 admin/templates 페이지에서 이미 사용 중인 권한 플래그.

DROP POLICY IF EXISTS "Public read access for template_assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload template_assets"        ON storage.objects;
DROP POLICY IF EXISTS "Admin can update template_assets"        ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete template_assets"        ON storage.objects;

-- 2a) anon + authenticated: read만 허용
CREATE POLICY "Public read access for template_assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'template_assets');

-- 2b) canPublishTemplates 권한자: insert
CREATE POLICY "Admin can upload template_assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'template_assets'
  AND (auth.jwt() -> 'app_metadata' ->> 'canPublishTemplates') = 'true'
);

-- 2c) canPublishTemplates 권한자: update (overwrite/replace 시나리오)
CREATE POLICY "Admin can update template_assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'template_assets'
  AND (auth.jwt() -> 'app_metadata' ->> 'canPublishTemplates') = 'true'
)
WITH CHECK (
  bucket_id = 'template_assets'
  AND (auth.jwt() -> 'app_metadata' ->> 'canPublishTemplates') = 'true'
);

-- 2d) canPublishTemplates 권한자: delete
CREATE POLICY "Admin can delete template_assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'template_assets'
  AND (auth.jwt() -> 'app_metadata' ->> 'canPublishTemplates') = 'true'
);

-- ------------------------------------------------------------
-- 적용 후 검증 (수동 SQL — 또는 `pnpm tsx scripts/verify-template-assets-bucket.ts`):
--   SELECT id, public, file_size_limit, allowed_mime_types
--     FROM storage.buckets WHERE id = 'template_assets';
--   SELECT policyname, cmd, roles
--     FROM pg_policies
--     WHERE schemaname = 'storage' AND tablename = 'objects'
--       AND policyname LIKE '%template_assets%'
--     ORDER BY policyname;
-- ------------------------------------------------------------
