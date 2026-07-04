import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private dataSource: DataSource) {}

  getDataSource(): DataSource {
    return this.dataSource;
  }

  async runMigrations(): Promise<void> {
    await this.dataSource.runMigrations();
  }

  async healthCheck(): Promise<{ status: boolean; metrics: Record<string, any> }> {
    try {
      const start = Date.now();
      await this.dataSource.query('SELECT 1');
      const latency = Date.now() - start;

      const poolSize = (this.dataSource.driver as any).pool?.size || 0;
      const totalConnections = (this.dataSource.driver as any).pool?.totalCount || 0;
      const activeConnections = (this.dataSource.driver as any).pool?.activeCount || 0;
      const idleConnections = (this.dataSource.driver as any).pool?.idleCount || 0;
      const waitingClients = (this.dataSource.driver as any).pool?.waitingCount || 0;

      return {
        status: true,
        metrics: {
          latencyMs: latency,
          isConnected: this.dataSource.isInitialized,
          pool: {
            size: poolSize,
            total: totalConnections,
            active: activeConnections,
            idle: idleConnections,
            waiting: waitingClients,
          },
        },
      };
    } catch (error: any) {
      this.logger.error(`Database health check failed: ${error.message}`);
      return {
        status: false,
        metrics: {
          isConnected: false,
          error: error.message,
        },
      };
    }
  }

  async getTableStats(): Promise<Record<string, number>> {
    const result = await this.dataSource.query(`
      SELECT relname AS table_name, n_live_tup AS row_count
      FROM pg_stat_user_tables
      ORDER BY relname
    `);
    const stats: Record<string, number> = {};
    for (const row of result) {
      stats[row.table_name] = parseInt(row.row_count, 10) || 0;
    }
    return stats;
  }
}
