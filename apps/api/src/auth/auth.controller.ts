import { Controller, Post, Body, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import {
  RequestOtpDto,
  VerifyOtpDto,
  RefreshTokenDto,
  LogoutDto,
  RequestOtpResponse,
  VerifyOtpResponse,
  RefreshTokenResponse,
  LogoutResponse,
} from '@cg/shared';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('request-otp')
  @HttpCode(HttpStatus.OK)
  async requestOtp(@Body() requestOtpDto: RequestOtpDto): Promise<RequestOtpResponse> {
    return this.authService.requestOtp(requestOtpDto);
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
    @Req() req: Request,
  ): Promise<VerifyOtpResponse> {
    return this.authService.verifyOtp(verifyOtpDto, this.extractMetadata(req));
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() refreshDto: RefreshTokenDto,
    @Req() req: Request,
  ): Promise<RefreshTokenResponse> {
    return this.authService.refreshTokens(refreshDto, this.extractMetadata(req));
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: { userId: string },
    @Body() body: LogoutDto,
    @Req() req: Request,
  ): Promise<LogoutResponse> {
    return this.authService.logout(user, body);
  }

  private extractMetadata(req: Request) {
    return {
      userAgent: req.headers['user-agent'] ?? null,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip,
    };
  }
}
