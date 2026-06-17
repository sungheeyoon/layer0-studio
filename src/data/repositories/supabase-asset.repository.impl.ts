import { SupabaseClient } from '@supabase/supabase-js';
import { AssetRepository } from '@/domain/repositories/asset.repository';
import { Asset, CreateAssetDto } from '@/domain/entities/asset.entity';
import { isNotFoundError } from '@/data/errors/supabase-error.adapter';
import { AssetRow } from '@/types/database';

export class SupabaseAssetRepositoryImpl implements AssetRepository {
  constructor(private supabase: SupabaseClient) {}

  private mapRow(row: AssetRow): Asset {
    return {
      id: row.id,
      userId: row.user_id,
      filename: row.filename,
      mimeType: row.mime_type,
      size: Number(row.size),
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async createPendingAsset(data: CreateAssetDto): Promise<Asset> {
    const { data: row, error } = await this.supabase
      .from('assets')
      .insert({
        user_id: data.userId,
        filename: data.filename,
        mime_type: data.mimeType,
        size: data.size,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('[SupabaseAssetRepo::createPendingAsset]', error.message);
      throw new Error('Failed to create pending asset');
    }

    return this.mapRow(row);
  }


  async confirmAssetUpload(assetId: string, path?: string): Promise<Asset> {
    // 1. Get current asset to check status
    const { data: asset, error: fetchError } = await this.supabase
      .from('assets')
      .select('*')
      .eq('id', assetId)
      .single();

    if (fetchError || !asset) {
      throw new Error('Asset not found');
    }

    // 1. If already active, Return (Idempotent)
    if (asset.status === 'active') {
      return this.mapRow(asset);
    }

    // 2. Storage check
    const checkPath = path || `${asset.user_id}/${asset.id}/${asset.filename}`;
    const { error: storageError } = await this.supabase
      .storage
      .from('user_assets')
      .createSignedUrl(checkPath, 60);

    if (storageError) {
      console.error('[SupabaseAssetRepo::confirmAssetUpload] Storage check failed:', storageError.message);
      throw new Error('File not found in storage. Has it been uploaded successfully?');
    }

    // 3. Update status to 'active' after confirmation
    const { data: updated, error: updateError } = await this.supabase
      .from('assets')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', assetId)
      .select()
      .single();

    if (updateError) {
      console.error('[SupabaseAssetRepo::confirmAssetUpload] Update error:', updateError.message);
      throw new Error('Failed to update asset status');
    }

    return this.mapRow(updated);
  }

  async findById(assetId: string): Promise<Asset | null> {
    const { data, error } = await this.supabase
      .from('assets')
      .select('*')
      .eq('id', assetId)
      .single();

    if (error) {
      if (isNotFoundError(error)) return null;
      console.error('[SupabaseAssetRepo::findById]', error.message);
      throw new Error('Database error');
    }

    return this.mapRow(data);
  }
}
