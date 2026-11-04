'use client';

import { tokenStorage } from '@/lib/auth/tokenStorage';
import { setUnauthorizedHandler } from '@/lib/http/client';
import { ApiError, isAbortError } from '@/lib/http/errors';
import { authService } from '@/services/auth.service';
import type { AuthUser, ChangePasswordInput, LoginInput } from '@/types/auth';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  // The server and the first client render must match, so we always start as "loading"
  // and only read the stored token inside an effect
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [sessionExpired, setSessionExpired] = useState(false);

  // The server rejected our token (expired, user disabled, password changed...)
  const handleUnauthorized = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    setStatus('unauthenticated');
    setSessionExpired(true);
  }, []);

  // Registered first, so it exists before the "who am I" request below can fail
  useEffect(() => {
    setUnauthorizedHandler(handleUnauthorized);
    return () => setUnauthorizedHandler(null);
  }, [handleUnauthorized]);

  // On page load: if a token is stored, ask the server who it belongs to
  useEffect(() => {
    if (!tokenStorage.get()) {
      setStatus('unauthenticated');
      return;
    }

    const controller = new AbortController();

    authService
      .me(controller.signal)
      .then((me) => {
        setUser(me);
        setStatus('authenticated');
      })
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        // A 401 was already handled by the unauthorized handler
        if (error instanceof ApiError && error.status === 401) return;
        // Server down or network problem: keep the token so a later reload can recover
        setStatus('unauthenticated');
      });

    return () => controller.abort();
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const { token, user: loggedInUser } = await authService.login(input);

    tokenStorage.set(token);
    setUser(loggedInUser);
    setSessionExpired(false);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(() => {
    // Tokens are stateless, so there is nothing to call on the server
    tokenStorage.clear();
    setUser(null);
    setSessionExpired(false);
    setStatus('unauthenticated');
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await authService.me();
    setUser(me);
  }, []);

  const changePassword = useCallback(async (input: ChangePasswordInput) => {
    const { token, user: updatedUser } = await authService.changePassword(input);

    // The old token is already invalid on the server, so store the fresh one before anything else runs.
    // The 401 check in the HTTP client ignores responses that were sent with the old token
    tokenStorage.set(token);
    setUser(updatedUser);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAdmin: user?.role === 'admin',
      sessionExpired,
      login,
      logout,
      refreshUser,
      changePassword,
    }),
    [user, status, sessionExpired, login, logout, refreshUser, changePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
