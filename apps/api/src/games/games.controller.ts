import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { GamesService } from './games.service';
import { Game } from '@cg/shared';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('games')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all available games' })
  @ApiResponse({
    status: 200,
    description: 'Returns the list of available games',
    schema: {
      type: 'object',
      properties: {
        games: {
          type: 'array',
          items: { $ref: '#/components/schemas/Game' },
        },
      },
    },
  })
  async findAll(): Promise<{ games: Game[] }> {
    const games = await this.gamesService.findAll();
    return { games };
  }
}
