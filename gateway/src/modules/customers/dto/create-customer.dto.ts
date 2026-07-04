import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsObject } from 'class-validator';

export class CreateCustomerDto {
  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: '+2348123456789' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '123 Main St' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Lagos' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'NG' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: { source: 'web', tier: 'premium' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CustomerResponseDto {
  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ example: 'Customer created' })
  message: string;

  data: {
    id: string;
    customerCode: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    createdAt: Date;
  };
}

export class ListCustomersQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  page?: number;

  @ApiPropertyOptional({ example: 50, description: 'Items per page' })
  perPage?: number;

  @ApiPropertyOptional({ example: 'john@example.com' })
  email?: string;

  @ApiPropertyOptional({ example: '2024-01-01' })
  from?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  to?: string;
}
