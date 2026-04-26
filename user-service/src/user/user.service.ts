import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
<<<<<<< HEAD
import { ConfigService } from '@nestjs/config';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { supabase } from '../supabase/supabase.client';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ConnectWalletDto } from './dto/connect-wallet.dto';

@Injectable()
export class UserService {
  private solanaConnection: Connection;

  constructor(private readonly configService: ConfigService) {
    this.solanaConnection = new Connection(
      this.configService.get<string>('SOLANA_RPC_URL') ||
        'https://api.devnet.solana.com',
    );
  }

  // ──────────────────── REGISTER ────────────────────
  async register(dto: RegisterDto) {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', dto.email)
      .single();

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const password_hash = await bcrypt.hash(dto.password, 10);
    const email_verification_token = randomBytes(32).toString('hex');
    const email_verification_expiry = new Date(Date.now() + 3600 * 1000);
=======
import { supabase }          from '../supabase/supabase.client';
import { UpdateProfileDto }  from './dto/update-profile.dto';
import { PublicUser }        from './user.schema';
import { Role }              from '../common/enums/role.enum';
import { AuthenticatedUser } from '../common/types/jwt.types';

@Injectable()
export class UserService {

  // ─── GET PROFILE ─────────────────────────────────────────────────────────────
>>>>>>> origin/feature/user-service-amina

  async getProfile(userId: string): Promise<PublicUser> {
    const { data, error } = await supabase
      .from('users')
<<<<<<< HEAD
      .insert([
        {
          first_name: dto.first_name,
          last_name: dto.last_name,
          email: dto.email,
          password_hash,
          email_verified: false,
          email_verification_token,
          email_verification_expiry,
          role: 'buyer',
          signup_date: new Date(),
        },
      ])
      .select()
=======
      .select('id, first_name, last_name, email, email_verified, role, balance, shipping_address, profile_picture_url, last_login, signup_date')
      .eq('id', userId)
>>>>>>> origin/feature/user-service-amina
      .single();

    if (error || !data) throw new NotFoundException('User not found');
    return data as PublicUser;
  }

<<<<<<< HEAD
  // ──────────────────── LOGIN ────────────────────
  async login(dto: LoginDto) {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', dto.email)
      .single();
=======
  // ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
>>>>>>> origin/feature/user-service-amina

  async updateProfile(
    targetId:  string,
    dto:       UpdateProfileDto,
    requester: AuthenticatedUser,
  ): Promise<{ message: string }> {
    // Users can only update their own profile (admins can update anyone's)
    if (requester.userId !== targetId && requester.role !== Role.ADMIN) {
      throw new ForbiddenException('You can only update your own profile');
    }

<<<<<<< HEAD
    return {
      message: 'Login successful',
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    };
  }

  // ──────────────────── VERIFY EMAIL ────────────────────
  async verifyEmail(token: string) {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email_verification_token', token)
      .single();

    if (!user) throw new BadRequestException('Invalid verification token');

    if (new Date() > new Date(user.email_verification_expiry)) {
      throw new BadRequestException('Verification token expired');
    }

    const { error } = await supabase
      .from('users')
      .update({
        email_verified: true,
        email_verification_token: null,
        email_verification_expiry: null,
      })
      .eq('id', user.id);

    if (error) throw new BadRequestException(error.message);

    return { message: 'Email verified successfully' };
  }

  // ──────────────────── UPDATE PROFILE ────────────────────
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const { error } = await supabase
      .from('users')
      .update({
        first_name: dto.first_name,
        last_name: dto.last_name,
      })
      .eq('id', userId);
=======
    const updates: Partial<UpdateProfileDto> = {};
    if (dto.first_name)       updates.first_name       = dto.first_name;
    if (dto.last_name)        updates.last_name        = dto.last_name;
    if (dto.shipping_address) updates.shipping_address = dto.shipping_address;

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', targetId);
>>>>>>> origin/feature/user-service-amina

    if (error) throw new BadRequestException(error.message);

    return { message: 'Profile updated successfully' };
  }

<<<<<<< HEAD
  // ──────────────────── REQUEST SELLER UPGRADE ────────────────────
  async requestSellerUpgrade(userId: string) {
    const { data: existingRequest } = await supabase
      .from('seller_requests')
      .select('*')
      .eq('request_owner', userId)
      .eq('status', 'pending')
=======
  // ─── REQUEST SELLER UPGRADE ──────────────────────────────────────────────────

  async requestSellerUpgrade(userId: string): Promise<{ message: string }> {
    // Check current role
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
>>>>>>> origin/feature/user-service-amina
      .single();

    if (!user) throw new NotFoundException('User not found');
    if (user.role === Role.SELLER) throw new BadRequestException('You are already a seller');
    if (user.role === Role.ADMIN)  throw new ForbiddenException('Admins cannot request seller upgrade');

<<<<<<< HEAD
    const { error } = await supabase.from('seller_requests').insert([
      {
=======
    // Check for existing pending request
    const { data: existing } = await supabase
      .from('seller_requests')
      .select('id')
      .eq('request_owner', userId)
      .eq('status', 'pending')
      .maybeSingle();

    if (existing) throw new BadRequestException('You already have a pending seller request');

    const { error } = await supabase
      .from('seller_requests')
      .insert({
>>>>>>> origin/feature/user-service-amina
        request_owner: userId,
        status:        'pending',
        requested_at:  new Date().toISOString(),
      });

    if (error) throw new BadRequestException(error.message);

    return { message: 'Seller request submitted. Waiting for admin approval.' };
  }

<<<<<<< HEAD
  // ──────────────────── GET USER BY ID ────────────────────
  async getUserById(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id,first_name,last_name,email,phantom_wallet_address,role')
      .eq('id', userId)
      .single();

    if (error || !data) throw new BadRequestException('User not found');

    return data;
  }

  // ──────────────────── CONNECT PHANTOM WALLET ────────────────────
  async connectWallet(userId: string, dto: ConnectWalletDto) {
    // Validate it's a real Solana public key format
    try {
      new PublicKey(dto.phantom_wallet_address);
    } catch {
      throw new BadRequestException('Invalid Solana wallet address');
    }

    // Ensure wallet isn't already linked to another account
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

  // ──────────────────── GET SOL BALANCE (on-chain) ────────────────────
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

      return {
        wallet: user.phantom_wallet_address,
        sol_balance,
      };
    } catch {
      throw new BadRequestException(
        'Failed to fetch SOL balance from blockchain',
      );
    }
  }

  // ──────────── GET ALL USERS (admin) ────────────
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

  // ──────────── DELETE USER (admin) ────────────
  async deleteUser(userId: string) {
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', userId)
      .single();

    if (findError || !user) throw new BadRequestException('User not found');

    if (user.role === 'admin') {
      throw new BadRequestException('Cannot delete another admin');
    }

    // ── Delete all related records in correct order ──

    // 1. Delete bids made by this user
    await supabase.from('bids').delete().eq('bidder_id', userId);

    // 2. Delete bids on auctions owned by this seller
    const { data: userAuctions } = await supabase
      .from('auctions')
      .select('id')
      .eq('seller_id', userId);

    if (userAuctions && userAuctions.length > 0) {
      const auctionIds = userAuctions.map((a) => a.id);
      await supabase.from('bids').delete().in('auction_id', auctionIds);
    }

    // 3. Delete auctions owned by this seller
    await supabase.from('auctions').delete().eq('seller_id', userId);

    // 4. Delete seller requests
    await supabase.from('seller_requests').delete().eq('request_owner', userId);

    // 5. Finally delete the user
    const { error } = await supabase.from('users').delete().eq('id', userId);

    if (error) throw new BadRequestException(error.message);

    return { message: 'User deleted successfully' };
  }

  // ──────────── BAN / UNBAN USER (admin) ────────────
  async toggleBanUser(userId: string) {
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, role, is_banned')
      .eq('id', userId)
      .single();

    if (findError || !user) throw new BadRequestException('User not found');

    if (user.role === 'admin') {
      throw new BadRequestException('Cannot ban another admin');
    }

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

  // ──────────── APPROVE SELLER REQUEST (admin) ────────────
  async approveSellerRequest(requestId: string) {
    const { data: request, error: findError } = await supabase
      .from('seller_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (findError || !request)
      throw new BadRequestException('Request not found');

    if (request.status !== 'pending') {
      throw new BadRequestException('Request is already processed');
    }

    // Update user role to seller
    const { error: userError } = await supabase
      .from('users')
      .update({ role: 'seller' })
=======
  // ─── ADMIN: APPROVE SELLER ───────────────────────────────────────────────────

  async approveSeller(requestId: string): Promise<{ message: string }> {
    const { data: request, error: fetchError } = await supabase
      .from('seller_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) throw new NotFoundException('Seller request not found');
    if (request.status !== 'pending') throw new BadRequestException('Request already processed');

    // Promote user to seller
    const { error: userError } = await supabase
      .from('users')
      .update({ role: Role.SELLER })
>>>>>>> origin/feature/user-service-amina
      .eq('id', request.request_owner);

    if (userError) throw new BadRequestException(userError.message);

    // Mark request as approved
<<<<<<< HEAD
    const { error: requestError } = await supabase
      .from('seller_requests')
      .update({ status: 'approved', resolved_at: new Date().toISOString() })
      .eq('id', requestId);

    if (requestError) throw new BadRequestException(requestError.message);

    return { message: 'Seller request approved. User is now a seller.' };
  }

  // ──────────── REJECT SELLER REQUEST (admin) ────────────
  async rejectSellerRequest(requestId: string) {
    const { data: request, error: findError } = await supabase
      .from('seller_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (findError || !request)
      throw new BadRequestException('Request not found');

    if (request.status !== 'pending') {
      throw new BadRequestException('Request is already processed');
    }

    const { error } = await supabase
      .from('seller_requests')
      .update({ status: 'rejected', resolved_at: new Date().toISOString() })
      .eq('id', requestId);

    if (error) throw new BadRequestException(error.message);

    return { message: 'Seller request rejected.' };
  }

  // ──────────── GET ALL SELLER REQUESTS (admin) ────────────
  async getAllSellerRequests() {
    const { data, error } = await supabase
      .from('seller_requests')
      .select('*')
      .order('requested_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return data;
=======
    await supabase
      .from('seller_requests')
      .update({ status: 'approved', processed_at: new Date().toISOString() })
      .eq('id', requestId);

    return { message: 'Seller request approved. User is now a seller.' };
>>>>>>> origin/feature/user-service-amina
  }

  // ─── ADMIN: REJECT SELLER ────────────────────────────────────────────────────

  async rejectSeller(requestId: string): Promise<{ message: string }> {
    const { data: request, error: fetchError } = await supabase
      .from('seller_requests')
      .select('id, status')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) throw new NotFoundException('Seller request not found');
    if (request.status !== 'pending') throw new BadRequestException('Request already processed');

    await supabase
      .from('seller_requests')
      .update({ status: 'rejected', processed_at: new Date().toISOString() })
      .eq('id', requestId);

    return { message: 'Seller request rejected.' };
  }
}