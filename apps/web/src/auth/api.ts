import type {
  RequestOtpDto,
  RequestOtpResponse,
  VerifyOtpDto,
  VerifyOtpResponse,
  RefreshTokenDto,
  RefreshTokenResponse,
  LogoutDto,
  LogoutResponse,
} from '@cg/shared';
import { apiRequest } from '@/api/client';

export function requestOtp(payload: RequestOtpDto) {
  return apiRequest<RequestOtpResponse>('/auth/request-otp', {
    method: 'POST',
    body: payload,
    skipAuth: true,
  });
}

export function verifyOtp(payload: VerifyOtpDto) {
  return apiRequest<VerifyOtpResponse>('/auth/verify-otp', {
    method: 'POST',
    body: payload,
    skipAuth: true,
  });
}

export function refreshTokens(payload: RefreshTokenDto) {
  return apiRequest<RefreshTokenResponse>('/auth/refresh', {
    method: 'POST',
    body: payload,
    skipAuth: true,
  });
}

export function logoutApi(payload: LogoutDto, authToken: string) {
  return apiRequest<LogoutResponse>('/auth/logout', {
    method: 'POST',
    body: payload,
    authToken,
  });
}
