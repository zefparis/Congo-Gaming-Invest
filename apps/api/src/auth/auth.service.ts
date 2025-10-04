import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { compare, hash } from 'bcrypt';
import {
  AuthTokens,
  RequestOtpDto,
  RequestOtpResponse,
  VerifyOtpDto,
  VerifyOtpResponse,
  RefreshTokenDto,
  RefreshTokenResponse,
  LogoutDto,
  LogoutResponse,
  AuthUserProfile,
} from '@cg/shared';
import { UsersService, User } from '../users/users.service';
import { OtpService } from './otp.service';
import { ConfigService } from '../config/config.service';
import { RefreshTokenService } from './refresh-token.service';

const OTP_HASH_ROUNDS = 10;

interface RequestMetadata {
  userAgent?: string | null;
  ipAddress?: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly config: ConfigService,
  ) {}

  async requestOtp({ msisdn }: RequestOtpDto): Promise<RequestOtpResponse> {
    const existing = await this.otpService.findByMsisdn(msisdn);
    const now = new Date();
    const resendIntervalMs = this.config.otpResendIntervalSeconds * 1000;

    if (existing) {
      const nextAllowed = existing.lastSentAt.getTime() + resendIntervalMs;
      if (nextAllowed > now.getTime()) {
        const remaining = Math.ceil((nextAllowed - now.getTime()) / 1000);
        throw new BadRequestException(`OTP déjà envoyé. Réessayez dans ${remaining}s.`);
      }
    }

    const code = this.generateOtp();
    const codeHash = await hash(code, OTP_HASH_ROUNDS);
    const expiresAt = new Date(now.getTime() + this.config.otpExpirySeconds * 1000);

    await this.otpService.saveCode(msisdn, codeHash, expiresAt, now);

    // TODO: brancher fournisseur SMS
    console.log(`[OTP] ${msisdn} -> ${code}`);

    return { success: true, expiresIn: this.config.otpExpirySeconds };
  }

  async verifyOtp(
    { msisdn, code }: VerifyOtpDto,
    metadata: RequestMetadata = {},
  ): Promise<VerifyOtpResponse> {
    const entry = await this.otpService.findByMsisdn(msisdn);
    if (!entry) {
      throw new UnauthorizedException('OTP invalide ou expiré');
    }

    if (entry.expiresAt.getTime() < Date.now()) {
      await this.otpService.delete(msisdn);
      throw new UnauthorizedException('OTP expiré');
    }

    if (entry.attemptCount >= this.config.otpMaxAttempts) {
      await this.otpService.delete(msisdn);
      throw new UnauthorizedException('Nombre de tentatives dépassé');
    }

    const isValid = await compare(code, entry.codeHash);
    if (!isValid) {
      const attempts = (await this.otpService.incrementAttempt(msisdn)) ?? entry.attemptCount + 1;
      if (attempts >= this.config.otpMaxAttempts) {
        await this.otpService.delete(msisdn);
      }
      throw new UnauthorizedException('OTP invalide');
    }

    await this.otpService.delete(msisdn);

    let user = await this.usersService.findByMsisdn(msisdn);
    if (!user) {
      user = await this.usersService.create({ msisdn });
    }

    const tokens = await this.issueTokens(user, metadata);
    return {
      user: this.toAuthUser(user),
      tokens,
    };
  }

  async refreshTokens(
    { refreshToken }: RefreshTokenDto,
    metadata: RequestMetadata = {},
  ): Promise<RefreshTokenResponse> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token requis');
    }

    let payload: { sub: string; msisdn: string; jti: string };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.config.jwtRefreshSecret,
      });
    } catch (error) {
      throw new UnauthorizedException('Refresh token invalide');
    }

    const record = await this.refreshTokenService.findByJti(payload.jti);
    if (!record || record.revokedAt || record.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token expiré ou révoqué');
    }

    const match = await this.refreshTokenService.compareToken(refreshToken, record.tokenHash);
    if (!match) {
      await this.refreshTokenService.revokeByJti(record.jti);
      throw new UnauthorizedException('Refresh token compromis');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      await this.refreshTokenService.revokeByJti(record.jti);
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    await this.refreshTokenService.revokeByJti(record.jti);

    const tokens = await this.issueTokens(user, metadata);
    return { tokens };
  }

  async logout(currentUser: { userId: string }, dto: LogoutDto): Promise<LogoutResponse> {
    if (dto.refreshToken) {
      try {
        const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
          secret: this.config.jwtRefreshSecret,
        });
        if (payload.sub === currentUser.userId && payload.jti) {
          await this.refreshTokenService.revokeByJti(payload.jti);
        }
      } catch (error) {
        // token invalide -> on continue sans erreur pour éviter leak
      }
    }

    await this.refreshTokenService.revokeAllForUser(currentUser.userId);
    return { success: true };
  }

  private async issueTokens(user: User, metadata: RequestMetadata): Promise<AuthTokens> {
    const jti = randomUUID();

    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, msisdn: user.msisdn },
      { expiresIn: this.config.jwtAccessExpiresIn },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, msisdn: user.msisdn, jti },
      {
        secret: this.config.jwtRefreshSecret,
        expiresIn: this.config.jwtRefreshExpiresIn,
      },
    );

    const expiresAt = new Date(Date.now() + this.config.refreshTokenTtlDays * 24 * 60 * 60 * 1000);
    await this.refreshTokenService.store({
      userId: user.id,
      token: refreshToken,
      jti,
      expiresAt,
      userAgent: metadata.userAgent ?? null,
      ipAddress: metadata.ipAddress ?? null,
    });

    return { accessToken, refreshToken };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private toAuthUser(user: User): AuthUserProfile {
    return {
      id: user.id,
      msisdn: user.msisdn,
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString(),
    };
  }
}
