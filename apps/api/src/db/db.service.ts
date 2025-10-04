import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import {
  Pool,
  type PoolClient,
  type QueryResult,
  type QueryConfig,
  type QueryResultRow,
} from 'pg';
import { ConfigService } from '../config/config.service';

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;

  constructor(private readonly cfg: ConfigService) {
    this.pool = new Pool({ connectionString: this.cfg.databaseUrl });
  }

  async onModuleInit() {
    await this.pool.query('SELECT 1');
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: any[],
  ): Promise<QueryResult<T>>;
  async query<T extends QueryResultRow = QueryResultRow>(
    config: QueryConfig<any[]>,
  ): Promise<QueryResult<T>>;
  async query<T extends QueryResultRow = QueryResultRow>(
    textOrConfig: string | QueryConfig<any[]> ,
    params?: any[],
  ): Promise<QueryResult<T>> {
    if (typeof textOrConfig === 'string') {
      return this.pool.query<T>(textOrConfig, params);
    }
    return this.pool.query<T>(textOrConfig);
  }

  async tx<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      try {
        await client.query('ROLLBACK');
      } catch {}
      throw error;
    } finally {
      client.release();
    }
  }
}
