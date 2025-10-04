import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt, StrategyOptionsWithRequest } from 'passport-jwt';
import type { Request } from 'express';
import { ConfigService } from '../../config/config.service';

export interface JwtPayload {
  sub: string; // userId
  msisdn: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly cfg: ConfigService) {
    const opts: StrategyOptionsWithRequest = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: cfg.jwtSecret, // string garanti
      passReqToCallback: true,
      ignoreExpiration: false,
    };
    super(opts);
  }

  async validate(req: Request, payload: JwtPayload) {
    return { userId: payload.sub, msisdn: payload.msisdn };
  }
}
