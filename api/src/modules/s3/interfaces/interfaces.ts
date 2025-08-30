export interface ImageUploadResult {
  key: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  mimeType: string;
}

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  createThumbnail?: boolean;
  thumbnailSize?: number;
}
