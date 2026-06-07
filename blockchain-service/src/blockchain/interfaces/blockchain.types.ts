/** A built, base64-serialised transaction plus the escrow PDA it targets. */
export interface BuiltTransaction {
  transaction: string;
  escrowAddress: string;
}

/** Result of relaying a wallet-signed transaction on-chain. */
export interface RelayResult {
  success: boolean;
  txId: string;
}

/** Result of the backend cranking an escrow release (close_auction). */
export interface ReleaseResult {
  success: boolean;
  txSignature: string;
}

/** Decoded on-chain auction account state. */
export interface AuctionState {
  seller: string;
  minBid: number;
  highestBid: number;
  highestBidder: string;
  endTime: number;
  isClosed: boolean;
}
