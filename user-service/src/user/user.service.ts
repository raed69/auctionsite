import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { supabase }          from '../supabase/supabase.client';
import { UpdateProfileDto }  from './dto/update-profile.dto';
import { PublicUser }        from './user.schema';
import { Role }              from '../common/enums/role.enum';
import { AuthenticatedUser } from '../common/types/jwt.types';

@Injectable()
export class UserService {

  // ─── GET PROFILE ─────────────────────────────────────────────────────────────

  async getProfile(userId: string): Promise<PublicUser> {
    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, email_verified, role, balance, shipping_address, profile_picture_url, last_login, signup_date')
      .eq('id', userId)
      .single();

    if (error || !data) throw new NotFoundException('User not found');
    return data as PublicUser;
  }

  // ─── UPDATE PROFILE ───────────────────────────────────────────────────────────

  async updateProfile(
    targetId:  string,
    dto:       UpdateProfileDto,
    requester: AuthenticatedUser,
  ): Promise<{ message: string }> {
    // Users can only update their own profile (admins can update anyone's)
    if (requester.userId !== targetId && requester.role !== Role.ADMIN) {
      throw new ForbiddenException('You can only update your own profile');
    }

    const updates: Partial<UpdateProfileDto> = {};
    if (dto.first_name)       updates.first_name       = dto.first_name;
    if (dto.last_name)        updates.last_name        = dto.last_name;
    if (dto.shipping_address) updates.shipping_address = dto.shipping_address;

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', targetId);

    if (error) throw new BadRequestException(error.message);

    return { message: 'Profile updated successfully' };
  }

  // ─── REQUEST SELLER UPGRADE ──────────────────────────────────────────────────

  async requestSellerUpgrade(userId: string): Promise<{ message: string }> {
    // Check current role
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!user) throw new NotFoundException('User not found');
    if (user.role === Role.SELLER) throw new BadRequestException('You are already a seller');
    if (user.role === Role.ADMIN)  throw new ForbiddenException('Admins cannot request seller upgrade');

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
        request_owner: userId,
        status:        'pending',
        requested_at:  new Date().toISOString(),
      });

    if (error) throw new BadRequestException(error.message);

    return { message: 'Seller request submitted. Waiting for admin approval.' };
  }

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
      .eq('id', request.request_owner);

    if (userError) throw new BadRequestException(userError.message);

    // Mark request as approved
    await supabase
      .from('seller_requests')
      .update({ status: 'approved', processed_at: new Date().toISOString() })
      .eq('id', requestId);

    return { message: 'Seller request approved. User is now a seller.' };
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