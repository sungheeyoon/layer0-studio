import path from 'path';
import { SupabaseClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/utils/supabase/server';

export const TEMPLATE_ASSETS_BUCKET = 'template_assets';

const MIME_BY_EXT: Record<string, string> = {
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.webp': 'image/webp',
  '.gif':  'image/gif',
};

export interface UploadTemplateAssetOptions {
  /** Override the storage bucket (defaults to `template_assets`). */
  bucket?: string;
  /** Pre-built Supabase client. When omitted, an admin client is created. */
  client?: SupabaseClient;
  /** Replace existing object at the same path (defaults to false). */
  upsert?: boolean;
  /** Override the inferred content type. */
  contentType?: string;
}

export interface UploadTemplateAssetResult {
  path: string;
  publicUrl: string;
}

/**
 * Upload a template-owned asset (e.g. an AI-generated or stock image) to the
 * `template_assets` bucket and return its public URL.
 *
 * Server-only: defaults to the service-role admin client. The bucket's RLS
 * rejects writes from any other role (see migration 014).
 */
export async function uploadTemplateAsset(
  buffer: Buffer | Uint8Array,
  templateKey: string,
  filename: string,
  options: UploadTemplateAssetOptions = {}
): Promise<UploadTemplateAssetResult> {
  if (!templateKey) throw new Error('uploadTemplateAsset: templateKey is required');
  if (!filename) throw new Error('uploadTemplateAsset: filename is required');

  const ext = path.extname(filename).toLowerCase();
  const contentType = options.contentType ?? MIME_BY_EXT[ext];
  if (!contentType) {
    throw new Error(`uploadTemplateAsset: unsupported file extension "${ext}" for ${filename}`);
  }

  const bucket = options.bucket ?? TEMPLATE_ASSETS_BUCKET;
  const client = options.client ?? (await createAdminClient());
  const storagePath = `${templateKey}/${filename}`;

  const { error } = await client.storage
    .from(bucket)
    .upload(storagePath, buffer, {
      contentType,
      upsert: options.upsert ?? false,
    });

  if (error) throw error;

  const { data } = client.storage.from(bucket).getPublicUrl(storagePath);
  return { path: storagePath, publicUrl: data.publicUrl };
}
