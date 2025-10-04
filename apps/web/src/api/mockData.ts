import type { Game, WalletBalance } from '@cg/shared';

export const mockGames: Game[] = [
  {
    slug: 'aviator',
    title: 'Aviator',
    rtp: 97,
    volatility: 'HIGH',
    description: 'Pilotez votre mise et retirez avant le crash pour multiplier vos gains.',
  },
  {
    slug: 'bingo',
    title: 'Bingo',
    rtp: 95,
    volatility: 'MEDIUM',
    description: 'Tirez vos numéros chanceux dans ce bingo rapide et fun.',
  },
  {
    slug: 'loto',
    title: 'Loto',
    rtp: 90,
    volatility: 'LOW',
    description: 'Composez votre combinaison gagnante dans ce loto classique.',
  },
];

export const mockWallet: WalletBalance = {
  balance_cdf: 125000,
  balance_usd: 42,
};

export const mockProfile = {
  id: 'demo-user-123',
  msisdn: '+243900000000',
  created_at: new Date('2024-01-01T12:00:00Z').toISOString(),
};
