// apps/api/src/main.ts
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import type { NestExpressApplication } from '@nestjs/platform-express';

/**
 * Parse CSV "a,b,c" -> ["a","b","c"]
 */
function parseCsv(val?: string) {
  return (val ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * Origin matcher: supporte exact match + wildcard *.vercel.app
 */
function makeCorsOrigin(allow: string[]) {
  if (allow.length === 0) return false; // bloque tout par défaut
  return (origin: string | undefined, cb: (err: Error | null, ok?: boolean) => void) => {
    if (!origin) return cb(null, true); // curl / SSR
    const ok =
      allow.includes(origin) ||
      (origin.endsWith('.vercel.app') && allow.some(a => a === 'https://*.vercel.app'));
    cb(null, ok);
  };
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  // Prefix API optionnel (évite le double /v1 si tes controllers ont déjà /v1/...)
  const apiPrefix = process.env.API_PREFIX?.trim();
  if (apiPrefix) app.setGlobalPrefix(apiPrefix);

  // ❌ NE PAS utiliser une classe middleware ici:
  // app.use(CorrelationIdMiddleware); // <-- on l'applique via consumer dans AppModule

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS
  const origins = parseCsv(process.env.CORS_ALLOWED_ORIGINS);
  app.enableCors({
    origin: makeCorsOrigin(origins),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Swagger (active en non-prod si tu as setupSwagger)
  try {
    if (process.env.NODE_ENV !== 'production') {
      const { setupSwagger } = await import('./common/config/swagger.config');
      setupSwagger(app);
    }
  } catch {
    // no-op si pas de swagger
  }

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port, '0.0.0.0');
  // petit log runtime utile en container
  // eslint-disable-next-line no-console
  console.log(`API up on :${port}`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start the application', err);
  process.exit(1);
});
