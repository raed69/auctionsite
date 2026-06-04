import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { supabase } from '../supabase/supabase.client';
import { AuctionEndedDto } from './dto/auction-ended.dto';
import { ConfirmWinnerDto } from './dto/confirm-winner.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly resend: Resend;
  private readonly userServiceUrl: string;
  private readonly internalSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
    this.userServiceUrl = this.configService.get<string>('USER_SERVICE_URL') ?? '';
    this.internalSecret = this.configService.get<string>('INTERNAL_SECRET') ?? '';
  }

  // ─── Handle auction ended ─────────────────────────────────────
  async handleAuctionEnded(dto: AuctionEndedDto): Promise<void> {
    const [winner, seller] = await Promise.all([
      this.getUser(dto.winnerId),
      this.getUser(dto.sellerId),
    ]);

    if (!winner || !seller) {
      this.logger.error('Could not fetch winner or seller info');
      return;
    }

    // ── Save in-app notifications ──────────────────────────────
    await Promise.all([
      this.saveNotification({
        userId: dto.winnerId,
        title: '🎉 You won an auction!',
        message: `You won "${dto.auctionTitle}" with a bid of ${dto.winningAmount} ${dto.bidMethod}. Waiting for seller confirmation.`,
        type: 'you_won',
        auctionId: dto.auctionId,
      }),
      this.saveNotification({
        userId: dto.sellerId,
        title: '🏁 Your auction ended!',
        message: `Your auction "${dto.auctionTitle}" ended. Winner: ${winner.first_name} ${winner.last_name} with ${dto.winningAmount} ${dto.bidMethod}. Please confirm to proceed.`,
        type: 'auction_ended',
        auctionId: dto.auctionId,
      }),
    ]);

    // ── Send emails ────────────────────────────────────────────
    await Promise.all([
      this.sendEmail({
        to: winner.email,
        subject: `🎉 You won "${dto.auctionTitle}"!`,
        html: `
          <h2>Congratulations ${winner.first_name}!</h2>
          <p>You won the auction <strong>${dto.auctionTitle}</strong>.</p>
          <p>Your winning bid: <strong>${dto.winningAmount} ${dto.bidMethod}</strong></p>
          <p>We are waiting for the seller to confirm. You will be notified once confirmed.</p>
        `,
      }),
      this.sendEmail({
        to: seller.email,
        subject: `🏁 Your auction "${dto.auctionTitle}" has ended`,
        html: `
          <h2>Your auction ended, ${seller.first_name}!</h2>
          <p>Auction: <strong>${dto.auctionTitle}</strong></p>
          <p>Winner: <strong>${winner.first_name} ${winner.last_name}</strong></p>
          <p>Winning amount: <strong>${dto.winningAmount} ${dto.bidMethod}</strong></p>
          <p>Please log in and confirm the winner to receive your payment.</p>
        `,
      }),
    ]);

    this.logger.log(`✅ Auction ended notifications sent for auction ${dto.auctionId}`);
  }

  // ─── Handle seller confirms winner ───────────────────────────
  async handleConfirmWinner(dto: ConfirmWinnerDto): Promise<void> {
    const [winner, seller] = await Promise.all([
      this.getUser(dto.winnerId),
      this.getUser(dto.sellerId),
    ]);

    if (!winner || !seller) {
      this.logger.error('Could not fetch winner or seller info');
      return;
    }

    // ── Save in-app notifications ──────────────────────────────
    await Promise.all([
      this.saveNotification({
        userId: dto.winnerId,
        title: '✅ Seller confirmed your win!',
        message: `The seller confirmed your win for "${dto.auctionTitle}". Amount: ${dto.winningAmount} TND.`,
        type: 'winner_confirmed',
        auctionId: dto.auctionId,
      }),
      this.saveNotification({
        userId: dto.sellerId,
        title: '✅ Winner confirmed!',
        message: `You confirmed the winner for "${dto.auctionTitle}". Payment of ${dto.winningAmount} TND has been credited to your balance.`,
        type: 'winner_confirmed',
        auctionId: dto.auctionId,
      }),
    ]);

    // ── Send emails ────────────────────────────────────────────
    await Promise.all([
      this.sendEmail({
        to: winner.email,
        subject: `✅ Your win is confirmed for "${dto.auctionTitle}"`,
        html: `
          <h2>Great news, ${winner.first_name}!</h2>
          <p>The seller has confirmed your win for <strong>${dto.auctionTitle}</strong>.</p>
          <p>Amount: <strong>${dto.winningAmount} TND</strong></p>
          <p>The seller will be in touch regarding delivery.</p>
        `,
      }),
      this.sendEmail({
        to: seller.email,
        subject: `✅ Winner confirmed for "${dto.auctionTitle}"`,
        html: `
          <h2>Done, ${seller.first_name}!</h2>
          <p>You confirmed the winner for <strong>${dto.auctionTitle}</strong>.</p>
          <p>Amount of <strong>${dto.winningAmount} TND</strong> has been credited to your balance.</p>
        `,
      }),
    ]);

    this.logger.log(`✅ Confirm winner notifications sent for auction ${dto.auctionId}`);
  }

  // ─── Get user notifications ───────────────────────────────────
  async getUserNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  // ─── Mark as read ─────────────────────────────────────────────
  async markAsRead(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { message: 'Notification marked as read' };
  }

  // ─── Helpers ──────────────────────────────────────────────────
  private async getUser(userId: string): Promise<any> {
    try {
      const res = await fetch(
        `${this.userServiceUrl}/user/internal/${userId}`,
        {
          headers: { 'x-service-secret': this.internalSecret },
        },
      );
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  private async saveNotification(payload: {
    userId: string;
    title: string;
    message: string;
    type: string;
    auctionId: string;
  }): Promise<void> {
    const { error } = await supabase.from('notifications').insert({
      user_id: payload.userId,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      auction_id: payload.auctionId,
    });

    if (error) {
      this.logger.error('Failed to save notification:', error.message);
    }
  }

  private async sendEmail(payload: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    try {
      await this.resend.emails.send({
        from: 'Auction Platform <onboarding@resend.dev>',
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      });
    } catch (err) {
      this.logger.error('Failed to send email:', err.message);
    }
  }
}