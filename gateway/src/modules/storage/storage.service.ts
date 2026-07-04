import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  originalFilename: string;
  etag: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private cloudinary: any = null;
  private initialized = false;

  constructor(private configService: ConfigService) {
    this.init();
  }

  private init(): void {
    try {
      const cloudinary = require('cloudinary').v2;
      const cloudName = this.configService.get<string>('storage.cloudinary.cloudName');
      const apiKey = this.configService.get<string>('storage.cloudinary.apiKey');
      const apiSecret = this.configService.get<string>('storage.cloudinary.apiSecret');

      if (cloudName && apiKey && apiSecret) {
        cloudinary.config({
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
          secure: true,
        });
        this.cloudinary = cloudinary;
        this.initialized = true;
        this.logger.log('Cloudinary initialized');
      } else {
        this.logger.warn('Cloudinary not configured — using local fallback storage');
      }
    } catch {
      this.logger.warn('Cloudinary package not installed — using local fallback storage');
    }
  }

  async uploadFile(
    buffer: Buffer,
    filename: string,
    options?: {
      folder?: string;
      resourceType?: 'image' | 'raw' | 'video' | 'auto';
      transformation?: any;
      tags?: string[];
      publicId?: string;
    },
  ): Promise<CloudinaryUploadResult> {
    if (this.initialized && this.cloudinary) {
      return this.uploadToCloudinary(buffer, filename, options);
    }
    return this.uploadLocal(buffer, filename);
  }

  private uploadToCloudinary(
    buffer: Buffer,
    filename: string,
    options?: any,
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder: options?.folder || 'finance-gateway',
          resource_type: options?.resourceType || 'auto',
          public_id: options?.publicId,
          tags: options?.tags,
          transformation: options?.transformation,
          use_filename: true,
          unique_filename: true,
        },
        (error: any, result: any) => {
          if (error) {
            this.logger.error(`Cloudinary upload failed: ${error.message}`);
            reject(error);
          } else {
            resolve({
              publicId: result.public_id,
              url: result.url,
              secureUrl: result.secure_url,
              format: result.format,
              width: result.width || 0,
              height: result.height || 0,
              bytes: result.bytes,
              originalFilename: result.original_filename,
              etag: result.etag,
            });
          }
        },
      );
      uploadStream.end(buffer);
    });
  }

  private async uploadLocal(
    buffer: Buffer,
    filename: string,
  ): Promise<CloudinaryUploadResult> {
    const fs = await Promise.resolve().then(() => require('fs'));
    const path = await Promise.resolve().then(() => require('path'));
    const crypto = await Promise.resolve().then(() => require('crypto'));

    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const hash = crypto.createHash('md5').update(buffer).digest('hex');
    const ext = path.extname(filename) || '.bin';
    const localFilename = `${hash}${ext}`;
    const localPath = path.join(uploadDir, localFilename);

    fs.writeFileSync(localPath, buffer);

    return {
      publicId: localFilename,
      url: `/uploads/${localFilename}`,
      secureUrl: `/uploads/${localFilename}`,
      format: ext.replace('.', ''),
      width: 0,
      height: 0,
      bytes: buffer.length,
      originalFilename: filename,
      etag: hash,
    };
  }

  async deleteFile(publicId: string): Promise<boolean> {
    if (this.initialized && this.cloudinary) {
      try {
        await this.cloudinary.uploader.destroy(publicId);
        return true;
      } catch (error: any) {
        this.logger.error(`Cloudinary delete failed: ${error.message}`);
        return false;
      }
    }
    const fs = await Promise.resolve().then(() => require('fs'));
    const path = await Promise.resolve().then(() => require('path'));
    const localPath = path.join(process.cwd(), 'uploads', publicId);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
      return true;
    }
    return false;
  }

  async getSignedUrl(publicId: string, expiresInSeconds = 3600): Promise<string | null> {
    if (this.initialized && this.cloudinary) {
      return this.cloudinary.utils.private_download_url(publicId, 'auto', {
        sign_url: true,
        expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
      });
    }
    return `/uploads/${publicId}`;
  }

  isReady(): boolean {
    return this.initialized;
  }
}
