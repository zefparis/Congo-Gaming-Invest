import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';

@Controller()
export class HealthController {
  @Get('health')
  @Public()
  health() {
    return { ok: true, uptime: process.uptime(), ts: new Date().toISOString() };
  }

  // miroir pour clients qui tapent /v1/*
  @Get('v1/health')
  @Public()
  healthV1() { return this.health(); }
}
