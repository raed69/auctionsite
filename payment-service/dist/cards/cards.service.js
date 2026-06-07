"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CardsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../supabase/supabase.client");
const card_crypto_util_1 = require("./card-crypto.util");
let CardsService = CardsService_1 = class CardsService {
    logger = new common_1.Logger(CardsService_1.name);
    publicColumns = 'id, user_id, brand, last4, exp_month, exp_year, label, created_at';
    async saveCard(userId, dto) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const row = {
            user_id: userId,
            brand: dto.brand ?? 'other',
            last4: dto.last4,
            exp_month: dto.expMonth,
            exp_year: dto.expYear,
            label: dto.label ?? null,
        };
        if (dto.token) {
            const enc = (0, card_crypto_util_1.encrypt)(dto.token);
            row.token_ciphertext = enc.ciphertext;
            row.token_iv = enc.iv;
            row.token_tag = enc.tag;
        }
        const { data, error } = await supabase
            .from('saved_cards')
            .insert(row)
            .select(this.publicColumns)
            .single();
        if (error) {
            throw new common_1.BadRequestException('Failed to save card');
        }
        this.logger.log(`Saved ${dto.brand ?? 'card'} ending ${dto.last4} for user ${userId}`);
        return this.present(data);
    }
    async hasCards(userId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { count, error } = await supabase
            .from('saved_cards')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId);
        if (error)
            throw new common_1.BadRequestException('Failed to check saved cards');
        return (count ?? 0) > 0;
    }
    async listCards(userId) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data, error } = await supabase
            .from('saved_cards')
            .select(this.publicColumns)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error)
            throw new common_1.BadRequestException('Failed to fetch cards');
        return (data ?? []).map((row) => this.present(row));
    }
    async deleteCard(userId, id) {
        const supabase = (0, supabase_client_1.getSupabaseClient)();
        const { data: card } = await supabase
            .from('saved_cards')
            .select('id, user_id')
            .eq('id', id)
            .maybeSingle();
        if (!card)
            throw new common_1.NotFoundException('Card not found');
        if (card.user_id !== userId) {
            throw new common_1.ForbiddenException('You can only remove your own cards');
        }
        const { error } = await supabase.from('saved_cards').delete().eq('id', id);
        if (error)
            throw new common_1.BadRequestException('Failed to remove card');
        return { message: 'Card removed' };
    }
    present(row) {
        return {
            id: row.id,
            brand: row.brand,
            last4: row.last4,
            masked: `•••• •••• •••• ${row.last4}`,
            exp_month: row.exp_month,
            exp_year: row.exp_year,
            label: row.label,
            created_at: row.created_at,
        };
    }
};
exports.CardsService = CardsService;
exports.CardsService = CardsService = CardsService_1 = __decorate([
    (0, common_1.Injectable)()
], CardsService);
//# sourceMappingURL=cards.service.js.map