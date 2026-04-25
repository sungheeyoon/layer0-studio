-- ============================================================
-- Migration 009: Storage bucket hardening
-- ============================================================

-- 1. user_assets: enforce size + MIME at the bucket level
--    (the application validates in validateAssetInfo, but bucket-level
--    constraints block direct Storage API calls that bypass that layer)
UPDATE storage.buckets
SET
  file_size_limit  = 5242880,  -- 5 MB, matches ASSET_VALIDATION_RULES.MAX_SIZE_BYTES
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
WHERE id = 'user_assets';

-- 2. template-thumbnails: restrict upload/delete to admin-only
--    Previously "all authenticated users" could write to this bucket.

DROP POLICY IF EXISTS "Authenticated users can upload thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete thumbnails"  ON storage.objects;

CREATE POLICY "Admin users can upload thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'template-thumbnails'
  AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "Admin users can delete thumbnails"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'template-thumbnails'
  AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
