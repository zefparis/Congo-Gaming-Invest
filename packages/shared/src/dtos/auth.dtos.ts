import { z } from 'zod';

export const requestOtpDto = z.object({
  msisdn: z.string().min(9).max(15).regex(/^\+?[0-9]+$/),
});

export const verifyOtpDto = z.object({
  msisdn: z.string().min(9).max(15).regex(/^\+?[0-9]+$/),
  code: z.string().length(6).regex(/^[0-9]+$/),
});

export const refreshTokenDto = z.object({
  refreshToken: z.string(),
});

export type RequestOtpDto = z.infer<typeof requestOtpDto>;
export type VerifyOtpDto = z.infer<typeof verifyOtpDto>;
export type RefreshTokenDto = z.infer<typeof refreshTokenDto>;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUserProfile {
  id: string;
  msisdn: string;
  created_at: string;
  updated_at: string;
}

export interface VerifyOtpResponse {
  user: AuthUserProfile;
  tokens: AuthTokens;
}

export interface RefreshTokenResponse {
  tokens: AuthTokens;
}

export interface LogoutResponse {
  success: boolean;
}

export interface RequestOtpResponse {
  success: boolean;
  expiresIn: number;
}

export const logoutDto = z.object({
  refreshToken: z.string().optional(),
});

export type LogoutDto = z.infer<typeof logoutDto>;
