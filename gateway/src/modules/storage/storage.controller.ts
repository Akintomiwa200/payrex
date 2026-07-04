import {
  Controller, Post, Get, Delete, Param, UseInterceptors,
  UploadedFile, HttpCode, HttpStatus, Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiConsumes } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { CurrentMerchant } from '../../common/decorators/current-merchant.decorator';

@ApiTags('Storage')
@ApiSecurity('ApiKey')
@Controller({ path: 'storage', version: '1' })
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload file to Cloudinary', description: 'Upload any file type. For KYC documents, use the KYC endpoint instead.' })
  @ApiResponse({ status: 201, description: 'File uploaded' })
  async uploadFile(
    @UploadedFile() file: any,
    @CurrentMerchant('id') merchantId: string,
  ) {
    if (!file) {
      return { status: false, message: 'No file provided', data: null };
    }
    const result = await this.storageService.uploadFile(file.buffer, file.originalname, {
      folder: `merchants/${merchantId}`,
      tags: [`merchant:${merchantId}`],
    });
    return { status: true, message: 'File uploaded', data: result };
  }

  @Post('upload/kyc')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('document', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload KYC document', description: 'Upload a KYC document image (passport, ID, utility bill, etc.)' })
  @ApiResponse({ status: 201, description: 'Document uploaded' })
  async uploadKYCDocument(
    @UploadedFile() file: any,
    @CurrentMerchant('id') merchantId: string,
  ) {
    if (!file) {
      return { status: false, message: 'No document provided', data: null };
    }
    const result = await this.storageService.uploadFile(file.buffer, file.originalname, {
      folder: `kyc/${merchantId}`,
      resourceType: 'image',
      transformation: { quality: 'auto:best', fetch_format: 'auto' },
      tags: ['kyc', `merchant:${merchantId}`],
    });
    return { status: true, message: 'Document uploaded', data: { url: result.secureUrl, publicId: result.publicId } };
  }

  @Get('url/:publicId')
  @ApiOperation({ summary: 'Get signed URL for private file' })
  @ApiResponse({ status: 200, description: 'Signed URL generated' })
  async getSignedUrl(@Param('publicId') publicId: string) {
    const url = await this.storageService.getSignedUrl(publicId);
    if (!url) {
      return { status: false, message: 'File not found', data: null };
    }
    return { status: true, message: 'Signed URL generated', data: { url } };
  }

  @Delete(':publicId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete file from storage' })
  @ApiResponse({ status: 200, description: 'File deleted' })
  async deleteFile(@Param('publicId') publicId: string) {
    const deleted = await this.storageService.deleteFile(publicId);
    return { status: deleted, message: deleted ? 'File deleted' : 'File not found', data: null };
  }
}
