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
var WithdrawService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_client_1 = require("../supabase/supabase.client");
let WithdrawService = WithdrawService_1 = class WithdrawService {
    configService;
    logger = new common_1.Logger(WithdrawService_1.name);
    constructor(configService) {
        this.configService = configService;
    }
    generateRef() {
        return `WD-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
    async initiateWithdraw(dto, sellerId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const userServiceUrl = this.configService.get('USER_SERVICE_URL');
        const secret = this.configService.get('INTERNAL_SECRET');
        const res = await fetch(`${userServiceUrl}/user/internal/${sellerId}`, {
            headers: { 'x-service-secret': secret ?? '' },
        });
        const user = await res.json();
        console.log('User balance response:', user);
        if (!user || user.balance < dto.amount) {
            throw new common_1.BadRequestException(`Insufficient balance. Current: ${user.balance} TND, Requested: ${dto.amount} TND`);
        }
        const ref = this.generateRef();
        await fetch(`${userServiceUrl}/user/internal/balance/deduct/${sellerId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-service-secret': secret ?? '',
            },
            body: JSON.stringify({ amount: dto.amount }),
        });
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
        if (error)
            throw new Error('Failed to save withdrawal record');
        this.logger.log(`Withdrawal initiated for seller ${sellerId}: ${ref}`);
        return {
            message: 'Withdrawal initiated',
            ref,
            amount: dto.amount,
            status: 'pending',
            withdrawal: data,
        };
    }
    async getWithdrawStatus(ref) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data, error } = await supabase
            .from('withdrawals')
            .select('*')
            .eq('ref', ref)
            .single();
        if (error || !data)
            throw new Error('Withdrawal not found');
        return data;
    }
    async completeWithdraw(ref) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data: withdrawal, error } = await supabase
            .from('withdrawals')
            .select('*')
            .eq('ref', ref)
            .single();
        if (error || !withdrawal)
            throw new common_1.BadRequestException('Withdrawal not found');
        if (withdrawal.status === 'completed')
            throw new common_1.BadRequestException('Withdrawal already completed');
        const { data, error: updateError } = await supabase
            .from('withdrawals')
            .update({ status: 'completed', completed_at: new Date().toISOString() })
            .eq('ref', ref)
            .select()
            .single();
        if (updateError)
            throw new Error('Failed to complete withdrawal');
        this.logger.log(`Withdrawal completed by admin: ${ref}`);
        return {
            message: 'Withdrawal marked as completed',
            withdrawal: data,
        };
    }
    async getAllWithdrawals() {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data, error } = await supabase
            .from('withdrawals')
            .select('*')
            .order('created_at', { ascending: false });
        if (error)
            throw new Error('Failed to fetch withdrawals');
        return data;
    }
};
exports.WithdrawService = WithdrawService;
exports.WithdrawService = WithdrawService = WithdrawService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WithdrawService);
//# sourceMappingURL=withdraw.service.js.map