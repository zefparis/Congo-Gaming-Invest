import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { AuthController } from './auth.controller';
import { OtpService } from './otp.service';
import { RefreshTokenService } from './refresh-token.service';
import { DbModule } from '../db/db.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    DbModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.jwtSecret,
        signOptions: {
          expiresIn: config.jwtAccessExpiresIn,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, OtpService, RefreshTokenService],
  exports: [AuthService],
})
export class AuthModule {}
