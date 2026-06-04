import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getSupabaseClient } from '../supabase/supabase.client';
import { InitiateDepositDto } from '../payment/dto/initiate-deposit.dto';

@Injectable()
export class DepositService {
  private readonly logger = new Logger(DepositService.name);

  constructor(private configService: ConfigService) {}

  private generateRef(): string {
    return `DEP-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  // ─── 1. Initiate deposit ─────────────────────────────────────────────
  async initiateDeposit(dto: InitiateDepositDto) {
    const isMock = this.configService.get('KONNECT_MOCK') === 'true';
    const supabase = getSupabaseClient();

    let paymentRef: string;
    let payUrl: string;

    if (isMock) {
      paymentRef = this.generateRef();
      payUrl = `http://localhost:${this.configService.get('PORT') ?? 3006}/payments/deposit/mock-pay/${paymentRef}`;
      this.logger.log(`[MOCK] Deposit initiated: ${paymentRef}`);
    } else {
      const amountInMillimes = Math.round(dto.amount * 1000);

      const response = await fetch(
        `${this.configService.get('KONNECT_API_URL')}/payments/init-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.configService.get('KONNECT_API_KEY')!,
          },
          body: JSON.stringify({
            receiverWalletId: this.configService.get('KONNECT_WALLET_ID'),
            token: 'TND',
            amount: amountInMillimes,
            type: 'immediate',
            description: `Balance deposit`,
            acceptedPaymentMethods: ['wallet', 'bank_card', 'e-DINAR'],
            lifespan: 30,
            checkoutForm: true,
            webhook: `${this.configService.get('WEBHOOK_URL')}/deposit`,
            successUrl: this.configService.get('FRONTEND_SUCCESS_URL'),
            failUrl: this.configService.get('FRONTEND_FAIL_URL'),
            orderId: `deposit-${dto.buyerId}-${Date.now()}`,
          }),
        },
      );

      const konnectData = await response.json();

      if (!konnectData.paymentRef) {
        this.logger.error('Konnect deposit initiation failed', konnectData);
        throw new Error('Failed to initiate deposit');
      }

      paymentRef = konnectData.paymentRef;
      payUrl = konnectData.payUrl;
    }

    // ─── Save deposit record ──────────────────────────────────────────
    const { data, error } = await supabase
      .from('deposits')
      .insert({
        buyer_id: dto.buyerId,
        amount: dto.amount,
        status: 'pending',
        konnect_payment_ref: paymentRef,
        konnect_payment_url: payUrl,
      })
      .select()
      .single();

    if (error) throw new Error('Failed to save deposit record');

    return { paymentUrl: payUrl, paymentRef, deposit: data };
  }

  // ─── 2. Handle webhook ───────────────────────────────────────────────
  async handleDepositWebhook(body: any) {
    const { payment_ref, payment_status } = body;
    const supabase = getSupabaseClient();

    const { data: deposit, error } = await supabase
      .from('deposits')
      .select('*')
      .eq('konnect_payment_ref', payment_ref)
      .single();

    if (error || !deposit) {
      this.logger.warn(`Deposit webhook: not found for ref ${payment_ref}`);
      return { received: true };
    }

    if (payment_status === 'completed') {
      await supabase
        .from('deposits')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('konnect_payment_ref', payment_ref);

      await this.creditBuyer(deposit.buyer_id, deposit.amount);
      this.logger.log(
        `Deposit completed for buyer ${deposit.buyer_id}: +${deposit.amount} TND`,
      );
    } else if (['failed', 'expired'].includes(payment_status)) {
      await supabase
        .from('deposits')
        .update({ status: payment_status })
        .eq('konnect_payment_ref', payment_ref);
    }

    return { received: true };
  }

  // ─── 3. Mock pay ─────────────────────────────────────────────────────
  async mockPay(paymentRef: string) {
    this.logger.log(`[MOCK] Simulating deposit for ref: ${paymentRef}`);
    return this.handleDepositWebhook({
      payment_ref: paymentRef,
      payment_status: 'completed',
    });
  }

  // ─── 4. Check status ─────────────────────────────────────────────────
  async getDepositStatus(paymentRef: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('deposits')
      .select('*')
      .eq('konnect_payment_ref', paymentRef)
      .single();

    if (error || !data) throw new Error('Deposit not found');
    return data;
  }

  // ─── Private: credit buyer balance ───────────────────────────────────
  private async creditBuyer(buyerId: string, amount: number) {
    const userServiceUrl = this.configService.get('USER_SERVICE_URL');
    const secret = this.configService.get('INTERNAL_SECRET');
    try {
      await fetch(`${userServiceUrl}/user/internal/balance/credit/${buyerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-service-secret': secret ?? '',
        },
        body: JSON.stringify({ amount }),
      });
    } catch (err) {
      this.logger.error(`Failed to credit buyer ${buyerId}:`, err.message);
    }
  }
}
