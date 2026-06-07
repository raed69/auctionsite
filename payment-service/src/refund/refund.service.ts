import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { getSupabaseClient } from '../supabase/supabase.client';
import { UserBalanceClient } from '../common/user-balance.client';
import { CreateRefundDto } from './dto/create-refund.dto';

/**
 * TND refunds — primarily for refunding the previous highest bidder when they
 * are outbid. Refunds are tracked (`pending`/`confirmed`/`failed`), credited
 * atomically via user-service, and idempotent on a caller-supplied key.
 *
 * Expected table (run once in Supabase):
 * ```sql
 * create table if not exists refunds (
 *   id              uuid primary key default gen_random_uuid(),
 *   user_id         text not null,
 *   amount          numeric not null,
 *   auction_id      text,
 *   reason          text,
 *   status          text not null default 'pending',
 *   idempotency_key text unique,
 *   created_at      timestamptz not null default now(),
 *   completed_at    timestamptz
 * );
 * ```
 */
@Injectable()
export class RefundService {
  private readonly logger = new Logger(RefundService.name);

  constructor(private readonly userBalance: UserBalanceClient) {}

  /**
   * Records and processes a refund, crediting the user's TND balance.
   *
   * Idempotent when `idempotencyKey` is supplied: a confirmed refund for the
   * same key is returned as-is without crediting again. The balance is only
   * credited after the refund row is claimed (`-> confirmed`), so a crash can
   * never over-credit (at worst it under-credits, which is retried).
   */
  async createRefund(dto: CreateRefundDto) {
    const supabase = getSupabaseClient();
    const refund = await this.findOrCreate(dto);

    // Already settled → idempotent no-op.
    if (refund.status === 'confirmed') {
      return refund;
    }

    // Claim the row (pending/failed → confirmed) before crediting. Row-level
    // locking serialises concurrent callers, so only one claim wins.
    const { data: claimed } = await supabase
      .from('refunds')
      .update({ status: 'confirmed', completed_at: new Date().toISOString() })
      .eq('id', refund.id)
      .neq('status', 'confirmed')
      .select()
      .maybeSingle();

    if (!claimed) {
      // A concurrent request already confirmed it.
      return this.getRefund(refund.id);
    }

    try {
      await this.userBalance.credit(claimed.user_id, Number(claimed.amount));
      this.logger.log(
        `Refunded ${claimed.amount} TND to user ${claimed.user_id} (refund ${claimed.id})`,
      );
    } catch (err) {
      await supabase
        .from('refunds')
        .update({ status: 'failed', completed_at: null })
        .eq('id', claimed.id);
      this.logger.error(
        `Refund ${claimed.id} failed to credit user ${claimed.user_id}: ${(err as Error).message}`,
      );
      throw err;
    }

    return claimed;
  }

  /**
   * Returns a refund record by id.
   *
   * @throws NotFoundException if the refund does not exist
   */
  async getRefund(id: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('refunds')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) throw new NotFoundException('Refund not found');
    return data;
  }

  /** Returns the existing refund for the idempotency key, or inserts a new one. */
  private async findOrCreate(dto: CreateRefundDto) {
    const supabase = getSupabaseClient();

    if (dto.idempotencyKey) {
      const { data: existing } = await supabase
        .from('refunds')
        .select('*')
        .eq('idempotency_key', dto.idempotencyKey)
        .maybeSingle();
      if (existing) return existing;
    }

    const { data, error } = await supabase
      .from('refunds')
      .insert({
        user_id: dto.userId,
        amount: dto.amount,
        auction_id: dto.auctionId ?? null,
        reason: dto.reason ?? 'outbid',
        status: 'pending',
        idempotency_key: dto.idempotencyKey ?? null,
      })
      .select()
      .single();

    if (error) {
      // Likely a unique-violation race on idempotency_key — return the winner.
      if (dto.idempotencyKey) {
        const { data: existing } = await supabase
          .from('refunds')
          .select('*')
          .eq('idempotency_key', dto.idempotencyKey)
          .maybeSingle();
        if (existing) return existing;
      }
      throw new BadRequestException(`Failed to record refund: ${error.message}`);
    }

    return data;
  }
}
