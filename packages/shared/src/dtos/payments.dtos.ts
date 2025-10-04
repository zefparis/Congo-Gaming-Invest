import { z } from 'zod';
import { Currency } from '../index';

export const initPaymentDto = z.object({
  msisdn: z.string().min(9).max(15).regex(/^\+?[0-9]+$/),
  amount: z.number().positive(),
  currency: z.enum(['CDF', 'USD']) as z.ZodType<Currency>,
  reference: z.string().min(1),
  provider: z.enum(['vodacom', 'airtel', 'orange', 'africel']),
  meta: z.record(z.unknown()).optional(),
});

export const webhookDto = z.record(z.unknown());

export type InitPaymentDto = z.infer<typeof initPaymentDto>;
export type WebhookDto = z.infer<typeof webhookDto>;
