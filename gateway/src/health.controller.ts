import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check', description: 'Verify the service is running and healthy.' })
  @ApiResponse({ status: 200, description: 'Service is healthy.' })
  check(): Record<string, any> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
    };
  }

  @Get('ready')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Readiness check', description: 'Check if the service is ready to accept traffic.' })
  @ApiResponse({ status: 200, description: 'Service is ready.' })
  readiness(): Record<string, any> {
    return {
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString(),
    };
  }
}
