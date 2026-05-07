import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react';
import type { AuthState, AuthUser, LoginPayload, RegisterPayload } from '../types/auth';

// ─── Config ──────────────────────────────────────────────────────────────────

const API        = import.meta.env.VITE_USER_SERVICE_URL ?? 'http://localhost:3001';
const TOKEN_KEY  = 'curator_token';
const USER_KEY   = 'curator_user';

// ─── Reducer ─────────────────────────────────────────────────────────────────

type Action =
  | { type: 'LOADING' }
  | { type: 'LOGIN_SUCCESS'; user: AuthUser; accessToken: string }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  user:        null,
  accessToken: null,
  isLoading:   true,   // starts true so we can rehydrate before rendering routes
};

function authReducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'LOADING':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
      return { user: action.user, accessToken: action.accessToken, isLoading: false };
    case 'LOGOUT':
      return { user: null, accessToken: null, isLoading: false };
    default:
      return state;
  }
}

// ─── Context shape ───────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  login:    (payload: LoginPayload)    => Promise<void>;
  register: (payload: RegisterPayload) => Promise<{ message: string }>;
  logout:   () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // On mount: rehydrate from localStorage (so page refresh doesn't log you out)
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw   = localStorage.getItem(USER_KEY);

    if (token && raw) {
      try {
        const user = JSON.parse(raw) as AuthUser;
        dispatch({ type: 'LOGIN_SUCCESS', user, accessToken: token });
      } catch {
        // Corrupted storage — treat as logged out
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        dispatch({ type: 'LOGOUT' });
      }
    } else {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  // ── login ─────────────────────────────────────────────────────────────────

  const login = useCallback(async (payload: LoginPayload) => {
    dispatch({ type: 'LOADING' });

    const res = await fetch(`${API}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      dispatch({ type: 'LOGOUT' });
      throw new Error(err.message ?? 'Login failed');
    }

    const { user, accessToken } = await res.json();

    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    dispatch({ type: 'LOGIN_SUCCESS', user, accessToken });
  }, []);

  // ── register ──────────────────────────────────────────────────────────────

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await fetch(`${API}/auth/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? 'Registration failed');
    }

    return res.json() as Promise<{ message: string }>;
  }, []);

  // ── logout ────────────────────────────────────────────────────────────────

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    dispatch({ type: 'LOGOUT' });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}