import type { AuthTokens, AuthUserProfile } from '@cg/shared';

const STORAGE_KEY = 'cg-auth-state';

type StoredAuthState = {
  tokens: AuthTokens;
  user: AuthUserProfile;
};

export function loadAuthState(): StoredAuthState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuthState;
  } catch (error) {
    console.warn('Failed to parse auth state from storage', error);
    return null;
  }
}

export function saveAuthState(state: StoredAuthState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearAuthState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
