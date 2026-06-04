"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PaymentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_client_1 = require("../supabase/supabase.client");
let PaymentService = PaymentService_1 = class PaymentService {
    configService;
    logger = new common_1.Logger(PaymentService_1.name);
    constructor(configService) {
        this.configService = configService;
    }
    generateRef() {
        return `MOCK-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
    async initiatePayment(dto) {
        const isMock = this.configService.get('KONNECT_MOCK') === 'true';
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        let paymentRef;
        let payUrl;
        if (isMock) {
            paymentRef = this.generateRef();
            payUrl = `http://localhost:${this.configService.get('PORT') ?? 3006}/payments/mock-pay/${paymentRef}`;
            this.logger.log(`[MOCK] Payment initiated: ${paymentRef}`);
        }
        else {
            const amountInMillimes = Math.round(dto.amount * 1000);
            const response = await fetch(`${this.configService.get('KONNECT_API_URL')}/payments/init-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.configService.get('KONNECT_API_KEY'),
                },
                body: JSON.stringify({
                    receiverWalletId: this.configService.get('KONNECT_WALLET_ID'),
                    token: 'TND',
                    amount: amountInMillimes,
                    type: 'immediate',
                    description: `Winner payment for: ${dto.auctionTitle}`,
                    acceptedPaymentMethods: ['wallet', 'bank_card', 'e-DINAR'],
                    lifespan: 30,
                    checkoutForm: true,
                    webhook: this.configService.get('WEBHOOK_URL'),
                    successUrl: this.configService.get('FRONTEND_SUCCESS_URL'),
                    failUrl: this.configService.get('FRONTEND_FAIL_URL'),
                    orderId: dto.auctionId,
                }),
            });
            const konnectData = await response.json();
            if (!konnectData.paymentRef) {
                this.logger.error('Konnect initiation failed', konnectData);
                throw new Error('Failed to initiate Konnect payment');
            }
            paymentRef = konnectData.paymentRef;
            payUrl = konnectData.payUrl;
        }
        const { data, error } = await supabase
            .from('payments')
            .insert({
            auction_id: dto.auctionId,
            winner_id: dto.winnerId,
            seller_id: dto.sellerId,
            amount: dto.amount,
            status: 'pending',
            konnect_payment_ref: paymentRef,
            konnect_payment_url: payUrl,
        })
            .select()
            .single();
        if (error)
            throw new Error('Failed to save payment record');
        return { paymentUrl: payUrl, paymentRef, payment: data };
    }
    async handleWebhook(body) {
        const { payment_ref, payment_status } = body;
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data: payment, error } = await supabase
            .from('payments')
            .select('*')
            .eq('konnect_payment_ref', payment_ref)
            .single();
        if (error || !payment) {
            this.logger.warn(`Webhook: payment not found for ref ${payment_ref}`);
            return { received: true };
        }
        if (payment_status === 'completed') {
            await supabase
                .from('payments')
                .update({ status: 'paid', paid_at: new Date().toISOString() })
                .eq('konnect_payment_ref', payment_ref);
            await this.creditSeller(payment.seller_id, payment.amount);
            await this.notifySeller(payment);
        }
        else if (['failed', 'expired'].includes(payment_status)) {
            await supabase
                .from('payments')
                .update({ status: payment_status })
                .eq('konnect_payment_ref', payment_ref);
        }
        return { received: true };
    }
    async mockPay(paymentRef) {
        this.logger.log(`[MOCK] Simulating payment for ref: ${paymentRef}`);
        return this.handleWebhook({
            payment_ref: paymentRef,
            payment_status: 'completed',
        });
    }
    async getPaymentStatus(paymentRef) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('konnect_payment_ref', paymentRef)
            .single();
        if (error || !data)
            throw new Error('Payment not found');
        return data;
    }
    async creditSeller(sellerId, amount) {
        const userServiceUrl = this.configService.get('USER_SERVICE_URL');
        const secret = this.configService.get('INTERNAL_SECRET');
        try {
            await fetch(`${userServiceUrl}/user/internal/balance/credit/${sellerId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-service-secret': secret ?? '',
                },
                body: JSON.stringify({ amount }),
            });
        }
        catch (err) {
            this.logger.error(`Failed to credit seller ${sellerId}:`, err.message);
        }
    }
    async notifySeller(payment) {
        const notifUrl = this.configService.get('NOTIFICATION_SERVICE_URL');
        try {
            await fetch(`${notifUrl}/notifications/payment-received`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sellerId: payment.seller_id,
                    winnerId: payment.winner_id,
                    auctionId: payment.auction_id,
                    amount: payment.amount,
                }),
            });
        }
        catch (err) {
            this.logger.error('Failed to notify seller:', err.message);
        }
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = PaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map