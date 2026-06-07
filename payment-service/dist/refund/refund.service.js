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
var RefundService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../supabase/supabase.client");
const user_balance_client_1 = require("../common/user-balance.client");
let RefundService = RefundService_1 = class RefundService {
    userBalance;
    logger = new common_1.Logger(RefundService_1.name);
    constructor(userBalance) {
        this.userBalance = userBalance;
    }
    async createRefund(dto) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const refund = await this.findOrCreate(dto);
        if (refund.status === 'confirmed') {
            return refund;
        }
        const { data: claimed } = await supabase
            .from('refunds')
            .update({ status: 'confirmed', completed_at: new Date().toISOString() })
            .eq('id', refund.id)
            .neq('status', 'confirmed')
            .select()
            .maybeSingle();
        if (!claimed) {
            return this.getRefund(refund.id);
        }
        try {
            await this.userBalance.credit(claimed.user_id, Number(claimed.amount));
            this.logger.log(`Refunded ${claimed.amount} TND to user ${claimed.user_id} (refund ${claimed.id})`);
        }
        catch (err) {
            await supabase
                .from('refunds')
                .update({ status: 'failed', completed_at: null })
                .eq('id', claimed.id);
            this.logger.error(`Refund ${claimed.id} failed to credit user ${claimed.user_id}: ${err.message}`);
            throw err;
        }
        return claimed;
    }
    async getRefund(id) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data, error } = await supabase
            .from('refunds')
            .select('*')
            .eq('id', id)
            .single();
        if (error || !data)
            throw new common_1.NotFoundException('Refund not found');
        return data;
    }
    async findOrCreate(dto) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        if (dto.idempotencyKey) {
            const { data: existing } = await supabase
                .from('refunds')
                .select('*')
                .eq('idempotency_key', dto.idempotencyKey)
                .maybeSingle();
            if (existing)
                return existing;
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
            if (dto.idempotencyKey) {
                const { data: existing } = await supabase
                    .from('refunds')
                    .select('*')
                    .eq('idempotency_key', dto.idempotencyKey)
                    .maybeSingle();
                if (existing)
                    return existing;
            }
            throw new common_1.BadRequestException(`Failed to record refund: ${error.message}`);
        }
        return data;
    }
};
exports.RefundService = RefundService;
exports.RefundService = RefundService = RefundService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_balance_client_1.UserBalanceClient])
], RefundService);
//# sourceMappingURL=refund.service.js.map