import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface Props { children: ReactNode }

// ─── Set to false to enforce auth wall once Supabase is wired ────────────────
const DEV_BYPASS = true;
// ─────────────────────────────────────────────────────────────────────────────

export default function ProtectedRoute({ children }: Props) {
  // TODO: const { user } = useAuth();
  const isAuthenticated = DEV_BYPASS;

  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}