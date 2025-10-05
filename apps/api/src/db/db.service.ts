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
    try {
      // Parse and log database URL (masking the password for security)
      const dbUrl = new URL(this.cfg.databaseUrl);
      const safeDbUrl = `${dbUrl.protocol}//${dbUrl.username}:*****@${dbUrl.hostname}${dbUrl.pathname}`;
      
      // Log connection details
      logger.log('=== Database Connection Details ===');
      logger.log(`- Host: ${dbUrl.hostname}`);
      logger.log(`- Port: ${dbUrl.port || '5432'}`);
      logger.log(`- Database: ${dbUrl.pathname.replace(/^\//, '')}`);
      logger.log(`- User: ${dbUrl.username}`);
      logger.log(`- SSL Mode: ${this.cfg.databaseSslMode}`);
      logger.log('==================================');

      // Configure SSL based on environment
      const sslConfig = this.cfg.databaseSslMode === 'require' ? {
        rejectUnauthorized: false,
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      } : false;

      // Create connection pool with enhanced settings
      this.pool = new Pool({
        connectionString: this.cfg.databaseUrl,
        ssl: sslConfig,
        connectionTimeoutMillis: 10000,     // 10 seconds
        idleTimeoutMillis: 30000,           // 30 seconds
        max: 20,                           // Maximum number of clients in the pool
        allowExitOnIdle: false,            // Don't allow the pool to close connections when idle
      });

      // Add event listeners with detailed logging
      this.pool.on('connect', (client) => {
        logger.log('New database client connected');
      });

      this.pool.on('error', (err) => {
        logger.error('Unexpected error on idle client', {
          message: err.message,
          code: (err as any).code,
          stack: err.stack
        });
      });

      this.pool.on('acquire', (client) => {
        logger.debug('Client checked out from pool');
      });

      this.pool.on('remove', (client) => {
        logger.log('Client removed from pool');
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error initializing database';
      logger.error('Failed to initialize database connection', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }

    // Add event listeners for the pool
    this.pool.on('connect', () => {
      logger.log('Database client connected');
    });

    this.pool.on('error', (err) => {
      logger.error('Unexpected error on idle client', err);
    });
  }

  async onModuleInit() {
    logger.log('=== Testing Database Connection ===');
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        const start = Date.now();
        logger.log(`Connection attempt ${retryCount + 1} of ${maxRetries}...`);
        
        // Test connection with a simple query
        const result = await this.pool.query('SELECT $1::text as message', ['Database connection test']);
        
        const duration = Date.now() - start;
        logger.log(`✅ Database connection successful (${duration}ms)`);
        logger.debug('Connection test result:', result.rows[0]);
        return; // Success - exit the function
        
      } catch (error: unknown) {
        retryCount++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorCode = (error as any).code || 'UNKNOWN_ERROR';
        
        logger.error(`❌ Connection attempt ${retryCount} failed:`, {
          error: errorMessage,
          code: errorCode,
          stack: error instanceof Error ? error.stack : undefined
        });

        if (retryCount >= maxRetries) {
          logger.error('Maximum connection retries reached. Application will exit.');
          throw error; // Final retry failed, re-throw to prevent app from starting
        }

        // Exponential backoff: wait longer between retries
        const delayMs = Math.min(1000 * Math.pow(2, retryCount), 10000);
        logger.log(`Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
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
