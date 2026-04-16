-- ============================================================
-- Migration: Create template-thumbnails storage bucket
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Create public storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'template-thumbnails',
  'template-thumbnails',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'template-thumbnails');

-- 3. Allow public read access
CREATE POLICY "Public read access for thumbnails"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'template-thumbnails');

-- 4. Allow authenticated users to delete their own uploads
CREATE POLICY "Authenticated users can delete thumbnails"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'template-thumbnails');
