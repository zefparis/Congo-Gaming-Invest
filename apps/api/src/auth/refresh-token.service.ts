import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { DbService } from '../db/db.service';

export interface RefreshTokenRecord {
  id: string;
  userId: string;
  jti: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  userAgent: string | null;
  ipAddress: string | null;
}

@Injectable()
export class RefreshTokenService {
  private static readonly HASH_ROUNDS = 10;

  constructor(private readonly db: DbService) {}

  private mapRow(row: any): RefreshTokenRecord {
    return {
      id: row.id,
      userId: row.user_id,
      jti: row.jti,
      tokenHash: row.token_hash,
      expiresAt: row.expires_at,
      revokedAt: row.revoked_at,
      userAgent: row.user_agent ?? null,
      ipAddress: row.ip_address ?? null,
    };
  }

  async store(params: {
    userId: string;
    token: string;
    jti: string;
    expiresAt: Date;
    userAgent?: string | null;
    ipAddress?: string | null;
  }): Promise<void> {
    const tokenHash = await hash(params.token, RefreshTokenService.HASH_ROUNDS);
    await this.db.query(
      `INSERT INTO refresh_tokens (user_id, jti, token_hash, expires_at, user_agent, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (jti) DO UPDATE
         SET token_hash = EXCLUDED.token_hash,
             expires_at = EXCLUDED.expires_at,
             revoked_at = NULL,
             user_agent = EXCLUDED.user_agent,
             ip_address = EXCLUDED.ip_address,
             created_at = NOW()`
      , [
        params.userId,
        params.jti,
        tokenHash,
        params.expiresAt,
        params.userAgent ?? null,
        params.ipAddress ?? null,
      ],
    );
  }

  async findByJti(jti: string): Promise<RefreshTokenRecord | null> {
    const result = await this.db.query(
      `SELECT id, user_id, jti, token_hash, expires_at, revoked_at, user_agent, ip_address
       FROM refresh_tokens
       WHERE jti = $1
       LIMIT 1`,
      [jti],
    );
    const row = result.rows[0];
    return row ? this.mapRow(row) : null;
  }

  async compareToken(rawToken: string, tokenHash: string): Promise<boolean> {
    return compare(rawToken, tokenHash);
  }

  async revokeByJti(jti: string): Promise<void> {
    await this.db.query(`UPDATE refresh_tokens SET revoked_at = NOW() WHERE jti = $1`, [jti]);
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.db.query(`UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1`, [userId]);
  }

  async deleteExpired(now: Date): Promise<number> {
    const result = await this.db.query<{ count: string }>(
      `WITH deleted AS (
         DELETE FROM refresh_tokens WHERE expires_at < $1 RETURNING 1
       )
       SELECT COUNT(*)::text as count FROM deleted`,
      [now],
    );
    return Number(result.rows[0]?.count ?? 0);
  }
}
