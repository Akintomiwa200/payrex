import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class InitiateThreeDSDto {
  @ApiProperty({ example: 'REF-001' })
  @IsString()
  reference: string;

  @ApiProperty({ example: '4084084084084081' })
  @IsString()
  cardNumber: string;

  @ApiProperty({ example: '12' })
  @IsString()
  expMonth: string;

  @ApiProperty({ example: '25' })
  @IsString()
  expYear: string;

  @ApiProperty({ example: 'https://myapp.com/3ds/callback' })
  @IsString()
  callbackUrl: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class ThreeDSCallbackDto {
  @ApiProperty({ example: '3ds-abc123...' })
  @IsString()
  threeDSServerTransId: string;

  @ApiProperty({ example: 'eJyrVgqJLE...' })
  @IsString()
  cres: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  additionalData?: Record<string, any>;
}

export class ThreeDSInitiateResponseDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ example: '3DS authentication initiated' })
  message: string;

  data: {
    threeDSServerTransId: string;
    version: string;
    acsUrl?: string;
    creq?: string;
    authenticationData?: Record<string, any>;
  };
}

export class ThreeDSAuthenticationResponseDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ example: '3DS authentication successful' })
  message: string;

  data: {
    threeDSServerTransId: string;
    status: string;
    eci?: string;
    cavv?: string;
    xid?: string;
    authenticationValue?: string;
    authenticatedAt?: Date;
  };
}
