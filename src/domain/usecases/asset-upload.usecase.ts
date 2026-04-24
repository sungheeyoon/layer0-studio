import { AssetRepository } from '../repositories/asset.repository';
import { CreateAssetDto } from '../entities/asset.entity';

export class AssetUploadUseCase {
  constructor(private assetRepo: AssetRepository) {}

  async initUpload(data: CreateAssetDto) {
    return this.assetRepo.createPendingAsset(data);
  }

  async confirmUpload(assetId: string, uploadPath: string) {
    return this.assetRepo.confirmAssetUpload(assetId, uploadPath);
  }
}
