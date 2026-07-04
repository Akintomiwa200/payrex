import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsObject, IsNumber } from 'class-validator';
import { KYCDocumentType } from '../entities/kyc.entity';

export class SubmitKYCDto {
  @ApiProperty({ enum: KYCDocumentType, example: 'international_passport' })
  @IsEnum(KYCDocumentType)
  documentType: KYCDocumentType;

  @ApiPropertyOptional({ example: 'A12345678' })
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @ApiPropertyOptional({ example: 'https://storage.example.com/passport.jpg' })
  @IsOptional()
  @IsString()
  documentUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  extractedData?: Record<string, any>;
}

export class VerifyBVNDto {
  @ApiProperty({ example: '22222222222', description: '11-digit BVN' })
  @IsString()
  bvn: string;

  @ApiPropertyOptional({ example: '08031234567' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: '1990-01-15' })
  @IsOptional()
  @IsString()
  dateOfBirth?: string;
}

export class VerifyNINDto {
  @ApiProperty({ example: '12345678901', description: '11-digit NIN' })
  @IsString()
  nin: string;

  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;
}

export class KYCStatusResponseDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ example: 'KYC status retrieved' })
  message: string;

  data: {
    kycLevel: number;
    overallStatus: string;
    documents: Array<{
      type: string;
      status: string;
      verifiedAt: string | null;
    }>;
    bvnVerified: boolean;
    nextLevelRequired: string[];
  };
}
