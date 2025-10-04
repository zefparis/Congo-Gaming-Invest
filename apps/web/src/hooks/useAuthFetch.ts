import { useCallback } from 'react';
import { apiRequest, ApiRequestOptions, ApiError } from '@/api/client';
import { useAuth } from '@/auth/AuthContext';

export function useAuthFetch() {
  const { tokens, refreshSession, logout } = useAuth();

  return useCallback(
    async function fetchWithAuth<TResponse>(
      path: string,
      options: Omit<ApiRequestOptions, 'authToken' | 'skipAuth'> = {},
    ): Promise<TResponse> {
      if (!tokens) {
        throw new ApiError(401, 'Non authentifié');
      }

      try {
        return await apiRequest<TResponse>(path, {
          ...options,
          authToken: tokens.accessToken,
        });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401 && tokens.refreshToken) {
          try {
            const newTokens = await refreshSession();
            return await apiRequest<TResponse>(path, {
              ...options,
              authToken: newTokens.accessToken,
            });
          } catch (refreshError) {
            try {
              await logout();
            } catch (logoutError) {
              console.warn('Logout failed after refresh error', logoutError);
            }
            if (refreshError instanceof ApiError) {
              throw refreshError;
            }
            throw error;
          }
        }
        throw error;
      }
    },
    [logout, refreshSession, tokens],
  );
}
