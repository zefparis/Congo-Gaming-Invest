import type { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';

export function CorrelationIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const incoming = (req.headers['x-correlation-id'] as string) || crypto.randomUUID();
  req.headers['x-correlation-id'] = incoming;
  req.id = incoming;
  res.setHeader('x-correlation-id', incoming);
  next();
}
