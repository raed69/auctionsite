import { useCallback } from 'react';
import { useAuth }     from '../context/Authcontext';

/**
 * Returns a fetch() wrapper that automatically attaches
 * the Authorization: Bearer <token> header.
 * Also logs you out automatically on 401 responses.
 *
 * Example:
 *   const authFetch = useAuthFetch();
 *   const res = await authFetch('/user/me');
 *   const data = await res.json();
 */
export function useAuthFetch() {
  const { accessToken, logout } = useAuth();

  const API = import.meta.env.VITE_USER_SERVICE_URL ?? 'http://localhost:3001';

  const authFetch = useCallback(
    async (path: string, init: RequestInit = {}): Promise<Response> => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      };

      const res = await fetch(`${API}${path}`, { ...init, headers });

      if (res.status === 401) logout();

      return res;
    },
    [accessToken, logout, API],
  );

  return authFetch;
}