import { Controller, Get, UseGuards, HttpCode } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GamesService } from './games.service';
import { Game } from '@cg/shared';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('games')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Public()
  @UseGuards(JwtAuthGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all available games' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the list of available games',
    type: Array<Game>,
  })
  async findAll(): Promise<{ games: Game[] }> {
    const games = await this.gamesService.findAll();
    return { games };
  }
}
