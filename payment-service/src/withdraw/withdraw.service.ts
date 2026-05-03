import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getSupabaseClient } from '../supabase/supabase.client';
import { InitiateWithdrawDto } from './dto/initiate-withdraw.dto';

@Injectable()
export class WithdrawService {
  private readonly logger = new Logger(WithdrawService.name);

  constructor(private configService: ConfigService) {}

  private generateRef(): string {
    return `WD-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  // ─── 1. Initiate withdrawal ──────────────────────────────────────────
  async initiateWithdraw(dto: InitiateWithdrawDto, sellerId: string) {
    const supabase = getSupabaseClient();

    // Check seller balance
    const userServiceUrl = this.configService.get('USER_SERVICE_URL');
    const secret = this.configService.get('INTERNAL_SECRET');

    const res = await fetch(`${userServiceUrl}/user/internal/${sellerId}`, {
      headers: { 'x-service-secret': secret ?? '' },
    });

    const user = await res.json();
    console.log('User balance response:', user);
    if (!user || user.balance < dto.amount) {
        throw new BadRequestException(`Insufficient balance. Current: ${user.balance} TND, Requested: ${dto.amount} TND`);
    }

    const ref = this.generateRef();

    // Deduct balance
    await fetch(`${userServiceUrl}/user/internal/balance/deduct/${sellerId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-service-secret': secret ?? '',
      },
      body: JSON.stringify({ amount: dto.amount }),
    });

    // Save withdrawal record
    const { data, error } = await supabase
      .from('withdrawals')
      .insert({
        seller_id: sellerId,
        amount: dto.amount,
        status: 'pending',
        ref,
      })
      .select()
      .single();

    if (error) throw new Error('Failed to save withdrawal record');

    this.logger.log(`Withdrawal initiated for seller ${sellerId}: ${ref}`);

    return {
      message: 'Withdrawal initiated',
      ref,
      amount: dto.amount,
      status: 'pending',
      withdrawal: data,
    };
  }

  // ─── 2. Check status ─────────────────────────────────────────────────
  async getWithdrawStatus(ref: string) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('ref', ref)
      .single();

    if (error || !data) throw new Error('Withdrawal not found');
    return data;
  }

  // ─── 3. Admin — complete withdrawal ─────────────────────────────────
async completeWithdraw(ref: string) {
    const supabase = getSupabaseClient();
  
    const { data: withdrawal, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('ref', ref)
      .single();
  
    if (error || !withdrawal) throw new BadRequestException('Withdrawal not found');
    if (withdrawal.status === 'completed') throw new BadRequestException('Withdrawal already completed');
  
    const { data, error: updateError } = await supabase
      .from('withdrawals')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('ref', ref)
      .select()
      .single();
  
    if (updateError) throw new Error('Failed to complete withdrawal');
  
    this.logger.log(`Withdrawal completed by admin: ${ref}`);
  
    return {
      message: 'Withdrawal marked as completed',
      withdrawal: data,
    };
  }
  
  // ─── 4. Admin — get all withdrawals ─────────────────────────────────
  async getAllWithdrawals() {
    const supabase = getSupabaseClient();
  
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .order('created_at', { ascending: false });
  
    if (error) throw new Error('Failed to fetch withdrawals');
    return data;
  }
}
