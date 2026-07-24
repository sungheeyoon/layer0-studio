import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseAssetRepositoryImpl } from '@/data/repositories/supabase-asset.repository.impl';
import { AssetUploadUseCase } from '@/domain/usecases/asset-upload.usecase';

export const createAssetUploadUseCase = (supabase: SupabaseClient) => {
  const repository = new SupabaseAssetRepositoryImpl(supabase);
  return new AssetUploadUseCase(repository);
};
