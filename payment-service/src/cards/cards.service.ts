import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { getSupabaseClient } from '../supabase/supabase.client';
import { encrypt } from './card-crypto.util';
import { SaveCardDto } from './dto/save-card.dto';

/**
 * Securely stores a buyer's payment-method references.
 *
 * SECURITY: this service never stores or accepts a full PAN or CVV (PCI-DSS
 * forbids storing CVV, and Konnect's hosted checkout means the card never
 * reaches us). It stores only display metadata (brand, last4, expiry) plus an
 * optional opaque gateway token, which is encrypted at rest (AES-256-GCM) and
 * never returned in responses or written to logs.
 *
 * Expected table (run once in Supabase):
 * ```sql
 * create table if not exists saved_cards (
 *   id               uuid primary key default gen_random_uuid(),
 *   user_id          text not null,
 *   brand            text,
 *   last4            text not null,
 *   exp_month        int  not null,
 *   exp_year         int  not null,
 *   label            text,
 *   token_ciphertext text,
 *   token_iv         text,
 *   token_tag        text,
 *   created_at       timestamptz not null default now()
 * );
 * ```
 */
@Injectable()
export class CardsService {
  private readonly logger = new Logger(CardsService.name);

  /** Columns safe to read back — never selects the encrypted token. */
  private readonly publicColumns =
    'id, user_id, brand, last4, exp_month, exp_year, label, created_at';

  /**
   * Saves a card reference for a user. Any gateway token is encrypted before
   * storage; the full card is never handled here.
   */
  async saveCard(userId: string, dto: SaveCardDto) {
    const supabase = getSupabaseClient();

    const row: Record<string, unknown> = {
      user_id: userId,
      brand: dto.brand ?? 'other',
      last4: dto.last4,
      exp_month: dto.expMonth,
      exp_year: dto.expYear,
      label: dto.label ?? null,
    };

    if (dto.token) {
      const enc = encrypt(dto.token);
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
      throw new BadRequestException('Failed to save card');
    }

    // last4 + brand are non-sensitive (PCI-DSS permits displaying them).
    this.logger.log(`Saved ${dto.brand ?? 'card'} ending ${dto.last4} for user ${userId}`);
    return this.present(data);
  }

  /** True if the user has at least one saved card. Used to gate deposits. */
  async hasCards(userId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { count, error } = await supabase
      .from('saved_cards')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw new BadRequestException('Failed to check saved cards');
    return (count ?? 0) > 0;
  }

  /** Lists a user's saved cards (masked; tokens never returned). */
  async listCards(userId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('saved_cards')
      .select(this.publicColumns)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestException('Failed to fetch cards');
    return (data ?? []).map((row) => this.present(row));
  }

  /**
   * Deletes a saved card the user owns.
   *
   * @throws NotFoundException if it does not exist
   * @throws ForbiddenException if it belongs to another user
   */
  async deleteCard(userId: string, id: string) {
    const supabase = getSupabaseClient();
    const { data: card } = await supabase
      .from('saved_cards')
      .select('id, user_id')
      .eq('id', id)
      .maybeSingle();

    if (!card) throw new NotFoundException('Card not found');
    if (card.user_id !== userId) {
      throw new ForbiddenException('You can only remove your own cards');
    }

    const { error } = await supabase.from('saved_cards').delete().eq('id', id);
    if (error) throw new BadRequestException('Failed to remove card');
    return { message: 'Card removed' };
  }

  /** Shapes a row into a masked, token-free response. */
  private present(row: any) {
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
}
