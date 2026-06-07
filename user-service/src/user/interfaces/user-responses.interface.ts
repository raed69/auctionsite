/**
 * Shared response contracts for the user domain.
 *
 * These describe the exact JSON shapes the services already return — they add
 * compile-time safety without altering any runtime payload.
 */

/** Generic acknowledgement returned by mutating operations. */
export interface MessageResponse {
  message: string;
}

/** TND balance read. */
export interface TndBalance {
  balance: number;
}

/** On-chain SOL balance read for a connected Phantom wallet. */
export interface SolBalance {
  wallet: string;
  sol_balance: number;
}

/** Result of a TND balance mutation (deduct / refund). */
export interface BalanceMutationResult extends MessageResponse {
  balance: number;
}

/** Result of toggling a user's ban status. */
export interface BanToggleResult extends MessageResponse {
  is_banned: boolean;
}
