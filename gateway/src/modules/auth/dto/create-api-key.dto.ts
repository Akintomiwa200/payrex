import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';

export class CreateApiKeyDto {
  @ApiProperty({ example: 'Production Key' })
  @IsString()
  label: string;

  @ApiPropertyOptional({ enum: ['test', 'live'], example: 'test' })
  @IsOptional()
  @IsEnum(['test', 'live'])
  keyType?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ApiKeyResponseDto {
  @ApiProperty({ example: 'sk_live_abc123...' })
  key: string;

  @ApiProperty({ example: 'test' })
  keyType: string;

  @ApiProperty({ example: 'Production Key' })
  label: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;
}
