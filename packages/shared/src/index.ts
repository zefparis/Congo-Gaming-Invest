export type Currency = 'CDF' | 'USD';

export interface PaymentInit {
  msisdn: string;
  amount: number;
  currency: Currency;
  reference: string;
  provider: 'vodacom' | 'airtel' | 'orange' | 'africel';
  meta?: Record<string, unknown>;
}

export interface PaymentResult {
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  providerTxnId?: string;
  reason?: string;
}

export interface LedgerEntry {
  id: string;
  userId: string;
  amount: number;
  currency: Currency;
  type: 'DEPOSIT' | 'WITHDRAW' | 'BET' | 'WIN' | 'ADJUSTMENT';
  txnRef: string;
  createdAt: string;
}

export interface WalletBalance {
  balance_cdf: number;
  balance_usd: number;
}

export interface Game {
  slug: string;
  title: string;
  rtp: number;
  volatility: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
}

export type KycStatus = 'none' | 'pending' | 'verified';

export * from './errors';
export * from './dtos/index';
