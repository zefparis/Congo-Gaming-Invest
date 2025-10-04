import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

export interface OtpEntry {
  msisdn: string;
  codeHash: string;
  expiresAt: Date;
  attemptCount: number;
  lastSentAt: Date;
}

@Injectable()
export class OtpService {
  constructor(private readonly db: DbService) {}

  async findByMsisdn(msisdn: string): Promise<OtpEntry | null> {
    const result = await this.db.query<{
      msisdn: string;
      code_hash: string;
      expires_at: Date;
      attempt_count: number;
      last_sent_at: Date;
    }>('SELECT msisdn, code_hash, expires_at, attempt_count, last_sent_at FROM otp_codes WHERE msisdn = $1', [msisdn]);

    const row = result.rows[0];
    if (!row) {
      return null;
    }
    return {
      msisdn: row.msisdn,
      codeHash: row.code_hash,
      expiresAt: row.expires_at,
      attemptCount: row.attempt_count,
      lastSentAt: row.last_sent_at,
    };
  }

  async saveCode(msisdn: string, codeHash: string, expiresAt: Date, sentAt: Date): Promise<void> {
    await this.db.query(
      `INSERT INTO otp_codes (msisdn, code_hash, expires_at, attempt_count, last_sent_at)
       VALUES ($1, $2, $3, 0, $4)
       ON CONFLICT (msisdn)
       DO UPDATE SET
         code_hash = EXCLUDED.code_hash,
         expires_at = EXCLUDED.expires_at,
         attempt_count = 0,
         last_sent_at = EXCLUDED.last_sent_at`,
      [msisdn, codeHash, expiresAt, sentAt],
    );
  }

  async incrementAttempt(msisdn: string): Promise<number | null> {
    const result = await this.db.query<{ attempt_count: number }>(
      `UPDATE otp_codes SET attempt_count = attempt_count + 1 WHERE msisdn = $1 RETURNING attempt_count`,
      [msisdn],
    );
    return result.rows[0]?.attempt_count ?? null;
  }

  async delete(msisdn: string): Promise<void> {
    await this.db.query('DELETE FROM otp_codes WHERE msisdn = $1', [msisdn]);
  }
}
