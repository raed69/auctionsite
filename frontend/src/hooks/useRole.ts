import { useAuth } from '../context/Authcontext';
import type { Role } from '../types/role';

/**
 * Provides boolean helpers for role-based rendering decisions.
 *
 * Example:
 *   const { isSeller, hasRole } = useRole();
 *   {isSeller && <CreateAuctionButton />}
 *   {hasRole(Role.SELLER, Role.ADMIN) && <ManageAuctionsLink />}
 */
export function useRole() {
  const { user } = useAuth();
  const role = user?.role ?? null;

  return {
    role,
    isBuyer:         role === 'buyer',
    isSeller:        role === 'seller',
    isAdmin:         role === 'admin',
    isAuthenticated: !!user,

    /** True if the logged-in user has at least one of the given roles */
    hasRole: (...roles: Role[]): boolean =>
      !!role && roles.includes(role),
  };
}