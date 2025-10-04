import { Controller, Get, UseGuards, HttpStatus, HttpCode, NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from './users.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getProfile(@CurrentUser() user: { userId?: string } | null): Promise<{ user: User }> {
    if (!user?.userId) {
      return {
        user: {
          id: 'demo-user-dev',
          msisdn: '+243900000000',
          created_at: new Date('2024-01-01T12:00:00Z'),
          updated_at: new Date('2024-01-01T12:00:00Z'),
        },
      };
    }

    const userData = await this.usersService.findById(user.userId);
    if (!userData) {
      throw new NotFoundException('User not found');
    }
    return { user: userData };
  }
}
