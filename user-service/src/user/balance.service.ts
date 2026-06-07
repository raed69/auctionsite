import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';
import { callRpc } from '../supabase/supabase-rpc.util';
import {
  BalanceMutationResult,
  TndBalance,
} from './interfaces/user-responses.interface';

/**
 * TND balance management: read, debit (deduct), refund and credit.
 *
 * Credits go through an atomic Supabase RPC (`increment_balance`) to stay
 * race-condition-safe under concurrent writes.
 */
@Injectable()
export class BalanceService {
  /**
   * Returns the current TND balance for a user.
   *
   * @param userId - id of the user
   * @throws NotFoundException if the user does not exist
   */
  async getTndBalance(userId: string): Promise<TndBalance> {
    const { data, error } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single();

    if (error || !data) throw new NotFoundException('User not found');
    return { balance: Number(data.balance ?? 0) };
  }

  /**
   * Deducts an amount from a user's balance (e.g. when a TND bid is placed).
   *
   * @param userId - id of the user being debited
   * @param amount - amount to deduct
   * @throws NotFoundException if the user does not exist
   * @throws BadRequestException if the balance is insufficient or the update fails
   */
  async deductBalance(
    userId: string,
    amount: number,
  ): Promise<BalanceMutationResult> {
    const { data: user, error } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single();

    if (error || !user) throw new NotFoundException('User not found');

    const currentBalance = Number(user.balance ?? 0);
    if (currentBalance < amount) {
      throw new BadRequestException(
        `Insufficient balance. You have ${currentBalance} TND, need ${amount} TND. Please deposit first.`,
      );
    }

    const newBalance = currentBalance - amount;
    const { error: updateError } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('id', userId);

    if (updateError) throw new BadRequestException(updateError.message);
    return { message: 'Balance deducted successfully', balance: newBalance };
  }

  /**
   * Refunds an amount back to a user's balance (e.g. when they are outbid).
   *
   * @param userId - id of the user being refunded
   * @param amount - amount to add back
   * @throws NotFoundException if the user does not exist
   * @throws BadRequestException if the update fails
   */
  async refundBalance(
    userId: string,
    amount: number,
  ): Promise<BalanceMutationResult> {
    const { data: user, error } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single();

    if (error || !user) throw new NotFoundException('User not found');

    const newBalance = Number(user.balance ?? 0) + amount;
    const { error: updateError } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('id', userId);

    if (updateError) throw new BadRequestException(updateError.message);
    return { message: 'Balance refunded successfully', balance: newBalance };
  }

  /**
   * Credits a user's balance atomically via the `increment_balance` RPC.
   *
   * Preferred for service-to-service credits (deposits, auction payouts) where
   * concurrent writes could otherwise race a read-modify-write update.
   *
   * @param userId - id of the user being credited
   * @param amount - amount to add
   * @throws BadRequestException if the RPC call fails
   */
  async creditBalance(userId: string, amount: number): Promise<void> {
    await callRpc(
      'increment_balance',
      { user_id: Number(userId), amount },
      'Failed to credit balance',
    );
  }
}
