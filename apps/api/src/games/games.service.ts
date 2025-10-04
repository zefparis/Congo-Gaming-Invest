import { Injectable } from '@nestjs/common';
import { Game } from '@cg/shared';

@Injectable()
export class GamesService {
  private readonly games: Game[] = [
    {
      slug: 'aviator',
      title: 'Aviator',
      rtp: 97,
      volatility: 'HIGH',
      description: 'Jeu de hasard avec multiplicateur croissant',
    },
    {
      slug: 'bingo',
      title: 'Bingo',
      rtp: 95,
      volatility: 'MEDIUM',
      description: 'Jeu de bingo classique avec cartes Ã  gratter',
    },
    {
      slug: 'loto',
      title: 'Loto',
      rtp: 90,
      volatility: 'LOW',
      description: 'Tentez votre chance avec le Loto',
    },
  ];

  async findAll(): Promise<Game[]> {
    return this.games;
  }

  async findOne(slug: string): Promise<Game | undefined> {
    return this.games.find(game => game.slug === slug);
  }
}
