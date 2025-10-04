import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type {
  AuthUserProfile,
  AuthTokens,
  RequestOtpDto,
  RequestOtpResponse,
  VerifyOtpDto,
  VerifyOtpResponse,
} from '@cg/shared';
import {
  requestOtp as requestOtpApi,
  verifyOtp as verifyOtpApi,
  logoutApi,
  refreshTokens as refreshTokensApi,
} from './api';
import { clearAuthState, loadAuthState, saveAuthState } from './tokenStorage';

interface AuthState {
  user: AuthUserProfile;
  tokens: AuthTokens;
}

interface AuthContextValue {
  user: AuthUserProfile | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  requestOtp: (payload: RequestOtpDto) => Promise<RequestOtpResponse>;
  verifyOtp: (payload: VerifyOtpDto) => Promise<VerifyOtpResponse>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<AuthTokens>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState | null>(() => loadAuthState());

  useEffect(() => {
    if (state) {
      saveAuthState(state);
    }
  }, [state]);

  const requestOtp = useCallback(async (payload: RequestOtpDto) => {
    return requestOtpApi(payload);
  }, []);

  const verifyOtp = useCallback(async (payload: VerifyOtpDto) => {
    const response = await verifyOtpApi(payload);
    const nextState: AuthState = {
      user: response.user,
      tokens: response.tokens,
    };
    setState(nextState);
    saveAuthState(nextState);
    return response;
  }, []);

  const refreshSession = useCallback(async () => {
    if (!state?.tokens.refreshToken) {
      throw new Error('Pas de refresh token');
    }
    const response = await refreshTokensApi({ refreshToken: state.tokens.refreshToken });
    const nextState: AuthState = {
      user: state.user,
      tokens: response.tokens,
    };
    setState(nextState);
    saveAuthState(nextState);
    return response.tokens;
  }, [state]);

  const logout = useCallback(async () => {
    const current = state;
    if (current) {
      try {
        await logoutApi({ refreshToken: current.tokens.refreshToken }, current.tokens.accessToken);
      } catch (error) {
        console.warn('Logout API failed, clearing local state anyway', error);
      }
    }
    clearAuthState();
    setState(null);
  }, [state]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state?.user ?? null,
      tokens: state?.tokens ?? null,
      isAuthenticated: Boolean(state),
      requestOtp,
      verifyOtp,
      logout,
      refreshSession,
    }),
    [logout, refreshSession, requestOtp, state, verifyOtp],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
