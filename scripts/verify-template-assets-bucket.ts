/**
 * Verify migration 014 (template_assets bucket + RLS) against the live Supabase
 * project pointed to by .env.local.
 *
 *   pnpm tsx scripts/verify-template-assets-bucket.ts
 *
 * Checks:
 *   1. Bucket exists, is public, has size/MIME guardrails.
 *   2. Admin (service role) can upload + read.
 *   3. Anonymous (anon key, no JWT) is rejected on upload.
 *   4. Anonymous can read the uploaded object.
 *   5. Admin can delete the test object (cleanup).
 *
 * The script is read-mostly: it writes one disposable PNG under
 * `_verify/` and deletes it before exiting.
 */

import { createClient } from '@supabase/supabase-js';

const BUCKET = 'template_assets';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_ROLE_KEY) {
  console.error(
    '❌ Missing env. Need NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.'
  );
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const anon = createClient(SUPABASE_URL, ANON_KEY);

// 1×1 transparent PNG
const PNG_1x1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgAAIAAAUAAeImBZsAAAAASUVORK5CYII=',
  'base64'
);

const testPath = `_verify/probe-${Date.now()}.png`;

let failed = 0;
function check(label: string, ok: boolean, detail?: unknown) {
  if (ok) {
    console.log(`✅ ${label}`);
  } else {
    failed++;
    console.error(`❌ ${label}`);
    if (detail !== undefined) console.error('   ', detail);
  }
}

async function run() {
  console.log(`🔍 Verifying bucket "${BUCKET}" on ${SUPABASE_URL}\n`);

  // 1. Bucket config
  const { data: bucket, error: bucketErr } = await admin.storage.getBucket(BUCKET);
  check('bucket exists', !bucketErr && !!bucket, bucketErr);
  if (bucket) {
    check('bucket is public', bucket.public === true);
    check('file_size_limit = 5 MiB', bucket.file_size_limit === 5242880, bucket.file_size_limit);
    const mimes = bucket.allowed_mime_types ?? [];
    const expected = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    check(
      'allowed_mime_types matches',
      expected.every(m => mimes.includes(m)),
      mimes
    );
  }

  // 2. Admin upload
  const adminUpload = await admin.storage
    .from(BUCKET)
    .upload(testPath, PNG_1x1, { contentType: 'image/png', upsert: true });
  check('admin (service role) can upload', !adminUpload.error, adminUpload.error);

  // 3. Anon upload — must be rejected
  const anonUpload = await anon.storage
    .from(BUCKET)
    .upload(`_verify/anon-${Date.now()}.png`, PNG_1x1, { contentType: 'image/png' });
  check(
    'anon upload is REJECTED',
    !!anonUpload.error,
    anonUpload.error ? `(got error: ${anonUpload.error.message})` : 'upload unexpectedly succeeded'
  );

  // 4. Anon read — must succeed
  const { data: publicUrl } = anon.storage.from(BUCKET).getPublicUrl(testPath);
  let readOk = false;
  let readStatus: number | string = 'n/a';
  try {
    const res = await fetch(publicUrl.publicUrl);
    readStatus = res.status;
    readOk = res.ok;
  } catch (e) {
    readStatus = (e as Error).message;
  }
  check(`anon can read public URL (HTTP ${readStatus})`, readOk, publicUrl.publicUrl);

  // 5. Cleanup
  const { error: rmErr } = await admin.storage.from(BUCKET).remove([testPath]);
  check('admin can delete (cleanup)', !rmErr, rmErr);

  console.log('');
  if (failed > 0) {
    console.error(`💥 ${failed} check(s) failed.`);
    process.exit(1);
  }
  console.log('🎉 All checks passed.');
}

run().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
