import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfig } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private readonly config: NestConfig) {}

  get port(): number {
    return Number(this.config.get('PORT') ?? 4000);
  }

  get databaseUrl(): string {
    const v = this.config.get<string>('DATABASE_URL');
    if (!v) throw new Error('DATABASE_URL is required');
    return v;
  }

  get databaseSslMode(): 'disable' | 'require' {
    const mode = this.config.get<'disable' | 'require'>('DATABASE_SSL_MODE');
    return mode ?? 'disable';
  }

  get jwtSecret(): string {
    const v = this.config.get<string>('JWT_SECRET');
    if (!v) throw new Error('JWT_SECRET is required');
    return v;
  }

  get jwtRefreshSecret(): string {
    const fallback = this.jwtSecret;
    return this.config.get<string>('JWT_REFRESH_SECRET') ?? fallback;
  }

  get jwtAccessExpiresIn(): string {
    return this.config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m');
  }

  get jwtRefreshExpiresIn(): string {
    return this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
  }

  get refreshTokenTtlDays(): number {
    return Number(this.config.get<number>('REFRESH_TOKEN_TTL_DAYS', 7));
  }

  get otpExpirySeconds(): number {
    return Number(this.config.get<number>('OTP_EXPIRY_SECONDS', 300));
  }

  get otpResendIntervalSeconds(): number {
    return Number(this.config.get<number>('OTP_RESEND_INTERVAL_SECONDS', 60));
  }

  get otpMaxAttempts(): number {
    return Number(this.config.get<number>('OTP_MAX_ATTEMPTS', 5));
  }

  get corsOrigins(): string[] {
    const raw = this.config.get<string>('CORS_ALLOWED_ORIGINS') ?? '';
    return raw.split(',').map(s => s.trim()).filter(Boolean);
  }

  // Throttling (utilisé dans AppModule)
  get throttleTtl(): number {
    // défaut: 60s; si valeur <1000 on considère que c'est en secondes → converti en ms
    const raw = Number(this.config.get('THROTTLE_TTL') ?? 60000);
    return raw < 1000 ? raw * 1000 : raw;
  }

  get throttleLimit(): number {
    return Number(this.config.get('THROTTLE_LIMIT') ?? 30);
  }

  get apiPrefix(): string {
    return this.config.get<string>('API_PREFIX') ?? 'v1';
  }
}
