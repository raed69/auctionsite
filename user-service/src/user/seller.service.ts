import axios from 'axios';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';
import { Role } from '../common/enums/role.enum';
import { MessageResponse } from './interfaces/user-responses.interface';

const notifyLogger = new Logger('SellerNotifications');

/**
 * Fire-and-forget notification trigger. Never throws — a notification failure
 * must not roll back an approval/rejection that already committed.
 */
async function notifyDecision(
  path: 'seller-approved' | 'seller-rejected',
  userId: string,
): Promise<void> {
  const base = process.env.NOTIFICATION_SERVICE_URL;

  if (!base || !userId) {
    notifyLogger.warn('Missing NOTIFICATION_SERVICE_URL or userId');
    return;
  }

  try {
    const res = await axios.post(
      `${base}/notifications/${path}`,
      { userId },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-service-secret': process.env.INTERNAL_SECRET ?? '',
        },
        timeout: 5000,
      },
    );

    notifyLogger.log(`Notification sent: ${res.status}`);
    console.log('🔥 notifyDecision CALLED');
    console.log('NOTIFICATION_SERVICE_URL =', process.env.NOTIFICATION_SERVICE_URL);
  } catch (err: any) {
    notifyLogger.error(
      `notify ${path} failed: ${err.message}`,
      err.stack,
    );
  }
}
/** A row from the `seller_requests` table. */
export interface SellerRequest {
  id: string;
  request_owner: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  resolved_at?: string | null;
}

/**
 * Seller-upgrade workflow: buyers apply to become sellers and admins
 * approve or reject those applications.
 */
@Injectable()
export class SellerService {
  /**
   * Submits a buyer's request to be upgraded to a seller.
   *
   * @param userId - id of the requesting buyer
   * @throws NotFoundException if the user does not exist
   * @throws BadRequestException if already a seller or a request is already pending
   * @throws ForbiddenException if an admin attempts to request an upgrade
   */
  async requestSellerUpgrade(userId: string): Promise<MessageResponse> {
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

  /**
   * Approves a pending seller request and flips the applicant's role to SELLER.
   *
   * @param requestId - id of the seller request
   * @throws NotFoundException if the request does not exist
   * @throws BadRequestException if the request was already processed or the update fails
   */
  async approveSellerRequest(requestId: string): Promise<MessageResponse> {
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
    void notifyDecision('seller-approved', request.request_owner);
    return { message: 'Seller request approved. User is now a seller.' };
  }

  /** Alias for {@link approveSellerRequest}. */
  async approveSeller(requestId: string): Promise<MessageResponse> {
    return this.approveSellerRequest(requestId);
  }

  /**
   * Rejects a pending seller request, closing the application.
   *
   * @param requestId - id of the seller request
   * @throws NotFoundException if the request does not exist
   * @throws BadRequestException if the request was already processed
   */
  async rejectSellerRequest(requestId: string): Promise<MessageResponse> {
    const { data: request, error: findError } = await supabase
      .from('seller_requests')
      .select('id, status, request_owner')
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
    void notifyDecision('seller-rejected', request.request_owner);
    return { message: 'Seller request rejected.' };
  }

  /** Alias for {@link rejectSellerRequest}. */
  async rejectSeller(requestId: string): Promise<MessageResponse> {
    return this.rejectSellerRequest(requestId);
  }

  /**
   * Lists all seller requests, newest first.
   *
   * @throws BadRequestException if the query fails
   */
  async getAllSellerRequests(): Promise<SellerRequest[]> {
    const { data, error } = await supabase
      .from('seller_requests')
      .select('*')
      .order('requested_at', { ascending: false });
    if (error) throw new BadRequestException(error.message);
    return (data ?? []) as SellerRequest[];
  }
}
