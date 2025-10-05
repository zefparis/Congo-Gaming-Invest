import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { z } from 'zod';
import { ConfigService } from './config.service';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DATABASE_SSL_MODE: z.enum(['disable', 'require']).optional(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 chars'),
  JWT_REFRESH_SECRET: z.string().min(32).optional(),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(7),
  OTP_EXPIRY_SECONDS: z.coerce.number().default(300),
  OTP_RESEND_INTERVAL_SECONDS: z.coerce.number().default(60),
  OTP_MAX_ATTEMPTS: z.coerce.number().default(5),
  CORS_ALLOWED_ORIGINS: z.string().optional(),
  LOG_LEVEL: z.string().optional(),
  THROTTLE_TTL: z.coerce.number().optional(),
  THROTTLE_LIMIT: z.coerce.number().optional(),
  API_PREFIX: z.string().optional(),
});

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['apps/api/.env', '.env'],
      validate: (raw: Record<string, unknown>) => {
        const parsed = EnvSchema.safeParse(raw);
        if (!parsed.success) {
          const flat = parsed.error.flatten();
          const msg = [
            'Invalid environment variables:',
            ...Object.entries(flat.fieldErrors).map(([k, v]) => `- ${k}: ${v?.join(', ')}`),
            ...(flat.formErrors?.length ? ['- _form: ' + flat.formErrors.join(', ')] : []),
          ].join('\n');
          throw new Error(msg);
        }
        return parsed.data;
      },
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService, NestConfigModule],
})
export class ConfigModule {}
