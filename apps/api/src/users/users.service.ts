import { Injectable, ConflictException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import type { WalletBalance } from '@cg/shared';

export interface User {
  id: string;
  msisdn: string;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class UsersService {
  constructor(private readonly dbService: DbService) {}

  async create({ msisdn }: { msisdn: string }): Promise<User> {
    try {
      const result = await this.dbService.query<User>(
        `INSERT INTO users (msisdn) 
         VALUES ($1) 
         ON CONFLICT (msisdn) DO UPDATE SET updated_at = NOW()
         RETURNING *`,
        [msisdn],
      );
      
      // CrÃ©er un portefeuille pour le nouvel utilisateur
      await this.createWallet(result.rows[0].id);
      
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('User with this MSISDN already exists');
      }
      throw error;
    }
  }

  async findByMsisdn(msisdn: string): Promise<User | null> {
    const result = await this.dbService.query<User>(
      'SELECT * FROM users WHERE msisdn = $1 LIMIT 1',
      [msisdn],
    );
    return result.rows[0] || null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.dbService.query<User>(
      'SELECT * FROM users WHERE id = $1 LIMIT 1',
      [id],
    );
    return result.rows[0] || null;
  }

  async findWalletByUserId(userId: string): Promise<WalletBalance | null> {
    const result = await this.dbService.query<{
      balance_cdf: string;
      balance_usd: string;
    }>(
      'SELECT balance_cdf, balance_usd FROM wallets WHERE user_id = $1 LIMIT 1',
      [userId],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    const balanceCdf = Number(row.balance_cdf ?? 0);
    const balanceUsd = Number(row.balance_usd ?? 0);

    return {
      balance_cdf: Number.isNaN(balanceCdf) ? 0 : balanceCdf,
      balance_usd: Number.isNaN(balanceUsd) ? 0 : balanceUsd,
    };
  }

  private async createWallet(userId: string): Promise<void> {
    await this.dbService.query(
      'INSERT INTO wallets (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING',
      [userId],
    );
  }
}
