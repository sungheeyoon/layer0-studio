import { AssetRepository } from '../repositories/asset.repository';
import { validateAssetInfo } from '../entities/asset.entity';
import { TemplateError } from '../errors/template.error';

export interface InitUploadInput {
  userId: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface ConfirmUploadInput {
  userId: string;
  assetId: string;
  uploadPath: string;
}

export class AssetUploadUseCase {
  constructor(private assetRepo: AssetRepository) {}

  async executeInit({ userId, filename, mimeType, size }: InitUploadInput) {
    validateAssetInfo(size, mimeType);
    return this.assetRepo.createPendingAsset({ userId, filename, mimeType, size });
  }

  async executeConfirm({ userId, assetId, uploadPath }: ConfirmUploadInput) {
    const asset = await this.assetRepo.findById(assetId);
    if (!asset) throw new TemplateError('SITE_NOT_FOUND');
    if (asset.userId !== userId) throw new TemplateError('SITE_ACCESS_DENIED');
    return this.assetRepo.confirmAssetUpload(assetId, uploadPath);
  }
}
