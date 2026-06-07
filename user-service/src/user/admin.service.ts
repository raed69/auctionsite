import { Injectable, BadRequestException } from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';
import {
  BanToggleResult,
  MessageResponse,
} from './interfaces/user-responses.interface';

/** Summary row returned by the admin user listing. */
export interface AdminUserSummary {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  email_verified: boolean;
  signup_date: string;
  phantom_wallet_address: string | null;
  is_banned: boolean;
}

/**
 * Admin-only user management: listing users, banning/unbanning accounts and
 * cascading account deletion.
 */
@Injectable()
export class AdminService {
  /**
   * Lists all users, newest signups first.
   *
   * @throws BadRequestException if the query fails
   */
  async getAllUsers(): Promise<AdminUserSummary[]> {
    const { data, error } = await supabase
      .from('users')
      .select(
        'id, first_name, last_name, email, role, email_verified, signup_date, phantom_wallet_address, is_banned',
      )
      .order('signup_date', { ascending: false });
    if (error) throw new BadRequestException(error.message);
    return (data ?? []) as AdminUserSummary[];
  }

  /**
   * Permanently deletes a user along with their bids, auctions (and those
   * auctions' bids) and seller requests.
   *
   * @param userId - id of the user to delete
   * @throws BadRequestException if the user is missing, is an admin, or deletion fails
   */
  async deleteUser(userId: string): Promise<MessageResponse> {
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', userId)
      .single();
    if (findError || !user) throw new BadRequestException('User not found');
    if (user.role === 'admin')
      throw new BadRequestException('Cannot delete another admin');
    await supabase.from('bids').delete().eq('bidder_id', userId);
    const { data: userAuctions } = await supabase
      .from('auctions')
      .select('id')
      .eq('seller_id', userId);
    if (userAuctions && userAuctions.length > 0) {
      const auctionIds = userAuctions.map((a) => a.id);
      await supabase.from('bids').delete().in('auction_id', auctionIds);
    }
    await supabase.from('auctions').delete().eq('seller_id', userId);
    await supabase.from('seller_requests').delete().eq('request_owner', userId);
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw new BadRequestException(error.message);
    return { message: 'User deleted successfully' };
  }

  /**
   * Toggles a user's ban status (bans if active, unbans if banned).
   *
   * @param userId - id of the user to ban/unban
   * @throws BadRequestException if the user is missing, is an admin, or the update fails
   */
  async toggleBanUser(userId: string): Promise<BanToggleResult> {
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, role, is_banned')
      .eq('id', userId)
      .single();
    if (findError || !user) throw new BadRequestException('User not found');
    if (user.role === 'admin')
      throw new BadRequestException('Cannot ban another admin');
    const newBanStatus = !user.is_banned;
    const { error } = await supabase
      .from('users')
      .update({ is_banned: newBanStatus })
      .eq('id', userId);
    if (error) throw new BadRequestException(error.message);
    return {
      message: newBanStatus
        ? 'User banned successfully'
        : 'User unbanned successfully',
      is_banned: newBanStatus,
    };
  }
}
