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
var DepositService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepositService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_client_1 = require("../supabase/supabase.client");
let DepositService = DepositService_1 = class DepositService {
    configService;
    logger = new common_1.Logger(DepositService_1.name);
    constructor(configService) {
        this.configService = configService;
    }
    generateRef() {
        return `DEP-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
    async initiateDeposit(dto) {
        const isMock = this.configService.get('KONNECT_MOCK') === 'true';
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        let paymentRef;
        let payUrl;
        if (isMock) {
            paymentRef = this.generateRef();
            payUrl = `http://localhost:${this.configService.get('PORT') ?? 3006}/payments/deposit/mock-pay/${paymentRef}`;
            this.logger.log(`[MOCK] Deposit initiated: ${paymentRef}`);
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
                    description: `Balance deposit`,
                    acceptedPaymentMethods: ['wallet', 'bank_card', 'e-DINAR'],
                    lifespan: 30,
                    checkoutForm: true,
                    webhook: `${this.configService.get('WEBHOOK_URL')}/deposit`,
                    successUrl: this.configService.get('FRONTEND_SUCCESS_URL'),
                    failUrl: this.configService.get('FRONTEND_FAIL_URL'),
                    orderId: `deposit-${dto.buyerId}-${Date.now()}`,
                }),
            });
            const konnectData = await response.json();
            if (!konnectData.paymentRef) {
                this.logger.error('Konnect deposit initiation failed', konnectData);
                throw new Error('Failed to initiate deposit');
            }
            paymentRef = konnectData.paymentRef;
            payUrl = konnectData.payUrl;
        }
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
        if (error)
            throw new Error('Failed to save deposit record');
        return { paymentUrl: payUrl, paymentRef, deposit: data };
    }
    async handleDepositWebhook(body) {
        const { payment_ref, payment_status } = body;
        const supabase = (0, supabase_client_1.getSupabaseClient)();
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
            this.logger.log(`Deposit completed for buyer ${deposit.buyer_id}: +${deposit.amount} TND`);
        }
        else if (['failed', 'expired'].includes(payment_status)) {
            await supabase
                .from('deposits')
                .update({ status: payment_status })
                .eq('konnect_payment_ref', payment_ref);
        }
        return { received: true };
    }
    async mockPay(paymentRef) {
        this.logger.log(`[MOCK] Simulating deposit for ref: ${paymentRef}`);
        return this.handleDepositWebhook({
            payment_ref: paymentRef,
            payment_status: 'completed',
        });
    }
    async getDepositStatus(paymentRef) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data, error } = await supabase
            .from('deposits')
            .select('*')
            .eq('konnect_payment_ref', paymentRef)
            .single();
        if (error || !data)
            throw new Error('Deposit not found');
        return data;
    }
    async creditBuyer(buyerId, amount) {
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
        }
        catch (err) {
            this.logger.error(`Failed to credit buyer ${buyerId}:`, err.message);
        }
    }
};
exports.DepositService = DepositService;
exports.DepositService = DepositService = DepositService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DepositService);
//# sourceMappingURL=deposit.service.js.map