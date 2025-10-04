import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(rawReq: Request, res: Response, next: NextFunction) {
    const req = rawReq as Request & { id?: string };
    const headerValue = rawReq.header('x-correlation-id')?.trim();
    const correlationId = headerValue && headerValue.length > 0 ? headerValue : randomUUID();

    req.id = correlationId;
    res.setHeader('x-correlation-id', correlationId);

    next();
  }
}
