import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware.js';
import { setupSwagger } from './common/config/swagger.config.js';
import { ConfigService as NestConfig } from '@nestjs/config'; // OK pour bootstrap

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('v1');

  // Middleware
  app.use(CorrelationIdMiddleware);

  // ❌ plus de ValidationPipe global (on reste Zod @UsePipes par route)
  // app.useGlobalPipes(new ValidationPipe({...}));

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS (filtre valeurs vides)
  const nestCfg = app.get(NestConfig);
  const corsCsv = nestCfg.get<string>('CORS_ORIGIN', '') ?? '';
  const origins = corsCsv.split(',').map(s => s.trim()).filter(Boolean);
  app.enableCors({
    origin: origins.length ? origins : true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Swagger
  setupSwagger(app);

  const port = nestCfg.get<number>('PORT', 4000);
  await app.listen(port);
  console.log(`API up: http://localhost:${port}`);
  console.log(`Swagger: http://localhost:${port}/docs`);
}

bootstrap().catch((err) => {
  console.error('Failed to start the application', err);
  process.exit(1);
});
