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
    const maxRetries = 5; // Increased from 3 to 5
    let retryCount = 0;
    
    // Helper function to get detailed error info
    const getErrorDetails = (error: unknown) => {
      if (error instanceof Error) {
        const pgError = error as any;
        return {
          name: error.name,
          message: error.message,
          code: pgError.code || 'NO_CODE',
          detail: pgError.detail || 'No details',
          hint: pgError.hint || 'No hint',
          stack: error.stack,
          // Add any other PostgreSQL specific error properties
          ...(pgError.severity && { severity: pgError.severity }),
          ...(pgError.position && { position: pgError.position }),
          ...(pgError.internalPosition && { internalPosition: pgError.internalPosition }),
          ...(pgError.internalQuery && { internalQuery: pgError.internalQuery }),
          ...(pgError.where && { where: pgError.where }),
          ...(pgError.schema && { schema: pgError.schema }),
          ...(pgError.table && { table: pgError.table }),
          ...(pgError.column && { column: pgError.column }),
          ...(pgError.dataType && { dataType: pgError.dataType }),
          ...(pgError.constraint && { constraint: pgError.constraint }),
        };
      }
      return { message: String(error) };
    };

    while (retryCount < maxRetries) {
      const attempt = retryCount + 1;
      const start = Date.now();
      
      try {
        logger.log(`\n🔹 Connection attempt ${attempt} of ${maxRetries}...`);
        
        // Test with a simple query that includes connection info
        const result = await this.pool.query(`
          SELECT 
            current_database() as database,
            current_user as user,
            inet_client_addr() as client_address,
            inet_server_addr() as server_address,
            version() as version,
            now() as server_time,
            $1::text as message
        `, ['Database connection test']);
        
        const duration = Date.now() - start;
        logger.log(`\n✅ Database connection successful (${duration}ms)`);
        logger.log('Connection details:', {
          database: result.rows[0].database,
          user: result.rows[0].user,
          clientAddress: result.rows[0].client_address,
          serverAddress: result.rows[0].server_address,
          version: result.rows[0].version,
          serverTime: result.rows[0].server_time,
        });
        
        return; // Success - exit the function
        
      } catch (error: unknown) {
        retryCount++;
        const errorDetails = getErrorDetails(error);
        const delayMs = Math.min(1000 * Math.pow(2, retryCount), 10000);
        
        logger.error(`\n❌ Connection attempt ${attempt} failed:`, {
          attempt,
          maxRetries,
          error: errorDetails,
          nextRetryIn: `${delayMs}ms`,
          timestamp: new Date().toISOString()
        });

        if (retryCount >= maxRetries) {
          logger.error('\n❌ Maximum connection retries reached. Application will exit.');
          // Log the full error object for debugging
          console.error('\n💥 FATAL DATABASE CONNECTION ERROR:', error);
          throw error; // Final retry failed, re-throw to prevent app from starting
        }

        // Log a countdown for the retry
        logger.log(`⏳ Retrying in ${delayMs/1000} seconds... (${maxRetries - retryCount} attempts remaining)\n`);
        
        // Add a small delay before retry
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
