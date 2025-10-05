import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const incoming =
      (req.headers['x-correlation-id'] as string | undefined) ?? randomUUID();

    // typage étendu → voir step 3
    (req as Request & { id?: string }).id = incoming;
    res.setHeader('x-correlation-id', incoming);
    next();
  }
}
