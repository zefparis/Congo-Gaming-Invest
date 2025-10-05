import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import {
  Pool,
  type PoolClient,
  type QueryResult,
  type QueryConfig,
  type QueryResultRow,
  type PoolConfig,
} from 'pg';
import { ConfigService } from '../config/config.service';
import { EventEmitter } from 'events';

const logger = new Logger('DbService');

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private pool!: Pool; // Using definite assignment assertion
  private readonly connectionEmitter = new EventEmitter();
  private isShuttingDown = false;
  private connectionAttempts = 0;
  private readonly MAX_CONNECTION_ATTEMPTS = 5;
  private readonly RECONNECT_DELAY_MS = 5000;

  constructor(private readonly cfg: ConfigService) {
    this.initializePool();
    this.setupProcessHandlers();
  }

  private validateDatabaseUrl(url: string): URL {
    if (!url) {
      throw new Error('Database URL is not defined. Please check your configuration.');
    }
    
    try {
      return new URL(url);
    } catch (error) {
      throw new Error(`Invalid database URL: ${url}. Please ensure it follows the format: postgresql://user:password@host:port/database`);
    }
  }

  private initializePool() {
    try {
      const dbUrl = this.validateDatabaseUrl(this.cfg.databaseUrl);
      const safeDbUrl = `${dbUrl.protocol}//${dbUrl.username ? dbUrl.username + ':*****@' : ''}${dbUrl.hostname}${dbUrl.pathname}`;

      logger.log(`Connecting to DB: ${safeDbUrl}`);

      const sslEnabled = this.cfg.databaseSslMode === 'require';
      const poolConfig: PoolConfig = {
        connectionString: this.cfg.databaseUrl,
        ssl: sslEnabled ? { rejectUnauthorized: false } : false,
      };

      this.pool = new Pool(poolConfig);

      this.setupPoolEventHandlers();
      this.testConnection().then(() => {
        logger.log('✅ Database connection test successful');
        this.connectionEmitter.emit('connected');
      }).catch((error) => {
        logger.error('❌ Initial database connection test failed', error);
        this.connectionEmitter.emit('connectionFailed', error);
        this.handleConnectionError(error);
      });

    } catch (error) {
      logger.error('❌ Failed to initialize database pool', error);
      this.connectionEmitter.emit('error', error);
      throw error;
    }
  }

  private handleConnectionError(error: Error): void {
    this.connectionAttempts++;
    
    if (this.connectionAttempts >= this.MAX_CONNECTION_ATTEMPTS) {
      logger.error(`❌ Max connection attempts (${this.MAX_CONNECTION_ATTEMPTS}) reached. Giving up.`);
      this.connectionEmitter.emit('maxRetriesExceeded', error);
      return;
    }

    const delay = Math.min(
      this.RECONNECT_DELAY_MS * Math.pow(2, this.connectionAttempts - 1),
      30000 // Max 30 seconds
    );

    logger.warn(`⚠️  Connection attempt ${this.connectionAttempts}/${this.MAX_CONNECTION_ATTEMPTS} failed. Retrying in ${delay}ms...`);
    
    setTimeout(() => {
      if (!this.isShuttingDown) {
        this.testConnection()
          .then(() => {
            logger.log('✅ Reconnected to database successfully');
            this.connectionAttempts = 0;
            this.connectionEmitter.emit('reconnected');
          })
          .catch((retryError) => {
            logger.error('Retry connection failed:', retryError);
            this.handleConnectionError(retryError);
          });
      }
    }, delay);
  }

  private setupPoolEventHandlers() {
    this.pool?.on('error', (err) => {
      logger.error('Pool error', err);
      this.handleConnectionError(err);
    });
  }

  async onModuleInit() {
    await this.testConnection();
  }

  private setupProcessHandlers() {
    // Handle graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;
      
      logger.log(`\n🚦 Received ${signal}. Shutting down gracefully...`);
      
      try {
        await this.onModuleDestroy();
        logger.log('✅ Graceful shutdown complete');
        process.exit(0);
      } catch (error) {
        logger.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    // Handle different shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('💥 Uncaught exception:', error);
      gracefulShutdown('uncaughtException');
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('🚨 Unhandled rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });
  }

  async onModuleDestroy() {
    if (!this.pool) return;
    
    logger.log('\n🚦 Closing database pool...');
    try {
      await this.pool.end();
      logger.log('✅ Database pool closed');
    } catch (error) {
      logger.error('❌ Error closing database pool:', error);
      throw error;
    }
  }

  async testConnection(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('SELECT 1');
    } finally {
      client.release();
    }
  }

  async query<T extends QueryResultRow = any>(
    textOrConfig: string | QueryConfig,
    params?: any[]
  ): Promise<QueryResult<T>> {
    return typeof textOrConfig === 'string'
      ? this.pool.query<T>(textOrConfig, params)
      : this.pool.query<T>(textOrConfig);
  }
}
