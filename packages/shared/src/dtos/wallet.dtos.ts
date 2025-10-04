import { z } from 'zod';
import { Currency } from '../index';

export const walletWithdrawDto = z.object({
  amount: z.number().positive(),
  currency: z.enum(['CDF', 'USD']) as z.ZodType<Currency>,
  reference: z.string().min(1),
  provider: z.enum(['vodacom', 'airtel', 'orange', 'africel']),
  msisdn: z.string().min(9).max(15).regex(/^\+?[0-9]+$/),
});

export const walletHistoryDto = z.object({
  limit: z.number().int().positive().default(10).optional(),
  offset: z.number().int().nonnegative().default(0).optional(),
  currency: z.enum(['CDF', 'USD']).optional(),
  type: z.enum(['DEPOSIT', 'WITHDRAW', 'BET', 'WIN', 'ADJUSTMENT']).optional(),
});

export type WalletWithdrawDto = z.infer<typeof walletWithdrawDto>;
export type WalletHistoryDto = z.infer<typeof walletHistoryDto>;
