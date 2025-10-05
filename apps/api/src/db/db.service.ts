import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import {
  Pool,
  type PoolClient,
  type QueryResult,
  type QueryConfig,
  type QueryResultRow,
} from 'pg';
import { ConfigService } from '../config/config.service';

// Create a logger instance
const logger = new Logger('DbService');

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;

  constructor(private readonly cfg: ConfigService) {
    // Log the database URL (masking the password for security)
    const dbUrl = new URL(this.cfg.databaseUrl);
    const safeDbUrl = `${dbUrl.protocol}//${dbUrl.username}:*****@${dbUrl.hostname}${dbUrl.pathname}`;
    logger.log(`Initializing database connection to: ${safeDbUrl}`);
    logger.log(`SSL Mode: ${this.cfg.databaseSslMode}`);

    const sslConfig = this.cfg.databaseSslMode === 'require' ? {
      rejectUnauthorized: false
    } : false;  // Explicitly set to false when not using SSL

    this.pool = new Pool({
      connectionString: this.cfg.databaseUrl,
      ssl: sslConfig,
      connectionTimeoutMillis: 10000, // 10 seconds
      idleTimeoutMillis: 30000, // 30 seconds
    });

    // Add event listeners for the pool
    this.pool.on('connect', () => {
      logger.log('Database client connected');
    });

    this.pool.on('error', (err) => {
      logger.error('Unexpected error on idle client', err);
    });
  }

  async onModuleInit() {
    logger.log('Testing database connection...');
    try {
      const start = Date.now();
      const result = await this.pool.query('SELECT 1');
      const duration = Date.now() - start;
      logger.log(`Database connection test successful (${duration}ms)`, result.rows[0]);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during connection test';
      const errorStack = error instanceof Error ? error.stack : undefined;
      logger.error('Database connection test failed', { error: errorMessage, stack: errorStack });
      throw error; // Re-throw to prevent app from starting
    }
  }

  async onModuleDestroy() {
    logger.log('Closing database pool...');
    try {
      await this.pool.end();
      logger.log('Database pool closed');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error while closing pool';
      logger.error('Error closing database pool', { error: errorMessage });
    }
  }

  async query<T extends QueryResultRow = any>(
    textOrConfig: string | QueryConfig,
    params?: any[]
  ): Promise<QueryResult<T>> {
    const start = Date.now();
    const queryText = typeof textOrConfig === 'string' ? textOrConfig : textOrConfig.text;
    
    try {
      logger.debug(`Executing query: ${queryText.substring(0, 100)}${queryText.length > 100 ? '...' : ''}`);
      const result = typeof textOrConfig === 'string'
        ? await this.pool.query<T>(textOrConfig, params)
        : await this.pool.query<T>(textOrConfig);
      
      const duration = Date.now() - start;
      logger.debug(`Query executed in ${duration}ms`);
      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      logger.error('Database query error', {
        query: queryText,
        error: errorMessage,
        stack: errorStack,
      });
      throw error;
    }
  }
}
