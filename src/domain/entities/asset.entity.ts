export type AssetStatus = 'pending' | 'active';

export interface Asset {
  id: string;
  userId: string;
  filename: string;
  mimeType: string;
  size: number;
  status: AssetStatus;
  createdAt: string;
  updatedAt: string;
}

export type CreateAssetDto = Omit<Asset, 'id' | 'status' | 'createdAt' | 'updatedAt'>;

export const ASSET_VALIDATION_RULES = {
  MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5MB limit for typical usage
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ]
};

export class AssetValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AssetValidationError';
  }
}

export function validateAssetInfo(size: number, mimeType: string): void {
  if (size > ASSET_VALIDATION_RULES.MAX_SIZE_BYTES) {
    throw new AssetValidationError(`File size exceeds the maximum limit of ${ASSET_VALIDATION_RULES.MAX_SIZE_BYTES / (1024 * 1024)}MB.`);
  }
  
  if (!ASSET_VALIDATION_RULES.ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new AssetValidationError(`File type ${mimeType} is not supported. Allowed formats: ${ASSET_VALIDATION_RULES.ALLOWED_MIME_TYPES.join(', ')}.`);
  }
}
