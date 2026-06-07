import { Injectable, Logger } from '@nestjs/common';
import { getSupabaseClient } from './supabase.client';

/** On-chain action being recorded, for the audit trail. */
export type TransactionType =
  | 'create_auction'
  | 'place_bid'
  | 'close_auction'
  | 'relay';

/** A single transaction-log entry. */
export interface TransactionLogEntry {
  txSignature: string;
  type: TransactionType;
  auctionId?: string | null;
  wallet?: string | null;
  amountSol?: number | null;
  status?: 'confirmed' | 'failed';
}

/**
 * Persists on-chain transaction signatures to Supabase for auditability.
 *
 * Writes are best-effort: a missing table or absent Supabase configuration is
 * logged but never breaks the on-chain flow that produced the signature.
 *
 * Expected table (run once in Supabase):
 * ```sql
 * create table if not exists blockchain_transactions (
 *   id           uuid primary key default gen_random_uuid(),
 *   tx_signature text not null,
 *   tx_type      text not null,
 *   auction_id   text,
 *   wallet       text,
 *   amount_sol   numeric,
 *   status       text not null default 'confirmed',
 *   created_at   timestamptz not null default now()
 * );
 * ```
 */
@Injectable()
export class TransactionLogService {
  private readonly logger = new Logger(TransactionLogService.name);

  /**
   * Records a transaction signature. Never throws.
   *
   * @param entry - the transaction details to persist
   */
  async record(entry: TransactionLogEntry): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      this.logger.debug(
        `Supabase not configured — skipping audit log for ${entry.txSignature}`,
      );
      return;
    }

    try {
      const { error } = await supabase.from('blockchain_transactions').insert({
        tx_signature: entry.txSignature,
        tx_type: entry.type,
        auction_id: entry.auctionId ?? null,
        wallet: entry.wallet ?? null,
        amount_sol: entry.amountSol ?? null,
        status: entry.status ?? 'confirmed',
      });
      if (error) {
        this.logger.warn(
          `Failed to persist tx ${entry.txSignature}: ${error.message}`,
        );
      }
    } catch (err) {
      this.logger.warn(
        `Failed to persist tx ${entry.txSignature}: ${(err as Error).message}`,
      );
    }
  }
}
