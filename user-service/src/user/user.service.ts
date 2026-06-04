import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { supabase } from '../supabase/supabase.client';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ConnectWalletDto } from './dto/connect-wallet.dto';
import { PublicUser } from './user.schema';
import { Role } from '../common/enums/role.enum';
import { AuthenticatedUser } from '../common/types/jwt.types';

@Injectable()
export class UserService {
  private solanaConnection: Connection;

  constructor(private readonly configService: ConfigService) {
    this.solanaConnection = new Connection(
      this.configService.get<string>('SOLANA_RPC_URL') ||
        'https://api.devnet.solana.com',
    );
  }

  async getProfile(userId: string): Promise<PublicUser> {
    const { data, error } = await supabase
      .from('users')
      .select(
        'id, first_name, last_name, email, email_verified, role, balance,phantom_wallet_address, shipping_address, profile_picture_url, last_login, signup_date',
      )
      .eq('id', userId)
      .single();
    if (error || !data) throw new NotFoundException('User not found');
    return data as PublicUser;
  }

  async updateProfile(
    targetId: string,
    dto: UpdateProfileDto,
    requester: AuthenticatedUser,
  ): Promise<{ message: string }> {
    if (requester.userId !== targetId && requester.role !== Role.ADMIN) {
      throw new ForbiddenException('You can only update your own profile');
    }
    const updates: Partial<UpdateProfileDto> = {};
    if (dto.first_name) updates.first_name = dto.first_name;
    if (dto.last_name) updates.last_name = dto.last_name;
    if (dto.shipping_address) updates.shipping_address = dto.shipping_address;
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', targetId);
    if (error) throw new BadRequestException(error.message);
    return { message: 'Profile updated successfully' };
  }

  async requestSellerUpgrade(userId: string): Promise<{ message: string }> {
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
    if (!user) throw new NotFoundException('User not found');
    if (user.role === Role.SELLER)
      throw new BadRequestException('You are already a seller');
    if (user.role === Role.ADMIN)
      throw new ForbiddenException('Admins cannot request seller upgrade');
    const { data: existing } = await supabase
      .from('seller_requests')
      .select('id')
      .eq('request_owner', userId)
      .eq('status', 'pending')
      .maybeSingle();
    if (existing)
      throw new BadRequestException(
        'You already have a pending seller request',
      );
    const { error } = await supabase.from('seller_requests').insert({
      request_owner: userId,
      status: 'pending',
      requested_at: new Date().toISOString(),
    });
    if (error) throw new BadRequestException(error.message);
    return { message: 'Seller request submitted. Waiting for admin approval.' };
  }

  async getUserById(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, phantom_wallet_address, role')
      .eq('id', userId)
      .single();
    if (error || !data) throw new BadRequestException('User not found');
    return data;
  }

  async connectWallet(userId: string, dto: ConnectWalletDto) {
    try {
      new PublicKey(dto.phantom_wallet_address);
    } catch {
      throw new BadRequestException('Invalid Solana wallet address');
    }
    const { data: existingWallet } = await supabase
      .from('users')
      .select('id')
      .eq('phantom_wallet_address', dto.phantom_wallet_address)
      .single();
    if (existingWallet && existingWallet.id !== userId) {
      throw new BadRequestException(
        'Wallet already connected to another account',
      );
    }
    const { error } = await supabase
      .from('users')
      .update({ phantom_wallet_address: dto.phantom_wallet_address })
      .eq('id', userId);
    if (error) throw new BadRequestException(error.message);
    return { message: 'Phantom wallet connected successfully' };
  }

  async getSolBalance(
    userId: string,
  ): Promise<{ wallet: string; sol_balance: number }> {
    const { data: user, error } = await supabase
      .from('users')
      .select('phantom_wallet_address')
      .eq('id', userId)
      .single();
    if (error || !user) throw new BadRequestException('User not found');
    if (!user.phantom_wallet_address) {
      throw new BadRequestException(
        'No Phantom wallet connected. Please connect your wallet first.',
      );
    }
    try {
      const pubKey = new PublicKey(user.phantom_wallet_address);
      const lamports = await this.solanaConnection.getBalance(pubKey);
      const sol_balance = lamports / LAMPORTS_PER_SOL;
      return { wallet: user.phantom_wallet_address, sol_balance };
    } catch {
      throw new BadRequestException(
        'Failed to fetch SOL balance from blockchain',
      );
    }
  }

  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select(
        'id, first_name, last_name, email, role, email_verified, signup_date, phantom_wallet_address, is_banned',
      )
      .order('signup_date', { ascending: false });
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async deleteUser(userId: string) {
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

  async toggleBanUser(userId: string) {
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

  async approveSellerRequest(requestId: string) {
    const { data: request, error: findError } = await supabase
      .from('seller_requests')
      .select('*')
      .eq('id', requestId)
      .single();
    if (findError || !request)
      throw new NotFoundException('Seller request not found');
    if (request.status !== 'pending')
      throw new BadRequestException('Request already processed');
    const { error: userError } = await supabase
      .from('users')
      .update({ role: Role.SELLER })
      .eq('id', request.request_owner);
    if (userError) throw new BadRequestException(userError.message);
    await supabase
      .from('seller_requests')
      .update({ status: 'approved', resolved_at: new Date().toISOString() })
      .eq('id', requestId);
    return { message: 'Seller request approved. User is now a seller.' };
  }

  async approveSeller(requestId: string): Promise<{ message: string }> {
    return this.approveSellerRequest(requestId);
  }

  async rejectSellerRequest(requestId: string) {
    const { data: request, error: findError } = await supabase
      .from('seller_requests')
      .select('id, status')
      .eq('id', requestId)
      .single();
    if (findError || !request)
      throw new NotFoundException('Seller request not found');
    if (request.status !== 'pending')
      throw new BadRequestException('Request already processed');
    await supabase
      .from('seller_requests')
      .update({ status: 'rejected', resolved_at: new Date().toISOString() })
      .eq('id', requestId);
    return { message: 'Seller request rejected.' };
  }

  async rejectSeller(requestId: string): Promise<{ message: string }> {
    return this.rejectSellerRequest(requestId);
  }

  async getAllSellerRequests() {
    const { data, error } = await supabase
      .from('seller_requests')
      .select('*')
      .order('requested_at', { ascending: false });
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ─── Get TND balance ──────────────────────────────────────────
  async getTndBalance(userId: string): Promise<{ balance: number }> {
    const { data, error } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single();

    if (error || !data) throw new NotFoundException('User not found');
    return { balance: Number(data.balance ?? 0) };
  }

  // ─── Deduct balance (when bid is placed) ─────────────────────
  async deductBalance(
    userId: string,
    amount: number,
  ): Promise<{ message: string; balance: number }> {
    console.log('Deduct request — userId:', userId, 'amount:', amount);

    const { data: user, error } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single();

    console.log('User found:', user, 'error:', error);
    console.log('Current balance:', user?.balance, 'needed:', amount);

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

  // ─── Refund balance (when outbid) ────────────────────────────
  async refundBalance(
    userId: string,
    amount: number,
  ): Promise<{ message: string; balance: number }> {
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

  async creditBalance(userId: string, amount: number): Promise<void> {
    const { error } = await supabase.rpc('increment_balance', {
      user_id: Number(userId),
      amount: amount,
    });

    if (error)
      throw new BadRequestException(
        'Failed to credit balance: ' + error.message,
      );
  }
}
