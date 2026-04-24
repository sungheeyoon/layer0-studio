import { Asset, CreateAssetDto } from '../entities/asset.entity';

export interface AssetRepository {
  /**
   * Create an initial pending asset record in the database and returns it.
   */
  createPendingAsset(data: CreateAssetDto): Promise<Asset>;

  /**
   * Idempotent check: verify that the physical file exists in storage,
   * then set status to 'active'. If already active, return immediately.
   */
  confirmAssetUpload(assetId: string, path?: string): Promise<Asset>;

  /**
   * Get an asset by ID
   */
  findById(assetId: string): Promise<Asset | null>;
}
