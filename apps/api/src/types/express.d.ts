import 'express';

declare global {
  namespace Express {
    interface Request {
      /** Correlation ID injecté par le middleware */
      id?: string;
    }
  }
}

export {};
