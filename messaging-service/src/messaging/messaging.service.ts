import {
  Injectable,
  Logger,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  // ─── Send a message ───────────────────────────────────────────────────────
  async sendMessage(senderId: string, dto: SendMessageDto) {
    if (senderId === dto.receiverId) {
      throw new BadRequestException('You cannot send a message to yourself');
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: dto.receiverId,
        content: dto.content,
        auction_id: dto.auctionId ?? null,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Failed to save message:', error.message);
      throw new BadRequestException(error.message);
    }

    return data;
  }

  // ─── Get conversation between two users ───────────────────────────────────
  // Optionally scoped to a specific auction (buyer asking about an item)
  async getConversation(
    requesterId: string,
    userA: string,
    userB: string,
    auctionId?: string,
  ) {
    // Requester must be one of the two participants
    if (requesterId !== userA && requesterId !== userB) {
      throw new ForbiddenException('You are not part of this conversation');
    }

    let query = supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${userA},receiver_id.eq.${userB}),and(sender_id.eq.${userB},receiver_id.eq.${userA})`,
      )
      .order('created_at', { ascending: true });

    if (auctionId) {
      query = query.eq('auction_id', auctionId);
    }

    const { data, error } = await query;
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // ─── Get inbox — one entry per conversation thread ────────────────────────
  async getInbox(userId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);

    // Keep only the most recent message per (other-user, auction) thread
    const seen = new Map<string, any>();
    for (const msg of data ?? []) {
      const otherId =
        msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      const key = `${otherId}:${msg.auction_id ?? 'none'}`;
      if (!seen.has(key)) seen.set(key, msg);
    }

    return Array.from(seen.values());
  }

  // ─── Get unread message count ─────────────────────────────────────────────
  async getUnreadCount(userId: string): Promise<{ unread: number }> {
    const { count, error } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('is_read', false);

    if (error) throw new BadRequestException(error.message);
    return { unread: count ?? 0 };
  }

  // ─── Mark a single message as read ────────────────────────────────────────
  async markAsRead(messageId: string, requesterId: string) {
    // Verify the message exists and belongs to the requester
    const { data: msg, error: fetchError } = await supabase
      .from('messages')
      .select('id, receiver_id')
      .eq('id', messageId)
      .single();

    if (fetchError || !msg) throw new NotFoundException('Message not found');

    if (msg.receiver_id !== requesterId) {
      throw new ForbiddenException('You can only mark your own messages as read');
    }

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);

    if (error) throw new BadRequestException(error.message);
    return { message: 'Marked as read' };
  }

  // ─── Mark all messages in a conversation as read ──────────────────────────
  async markConversationAsRead(receiverId: string, senderId: string) {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('receiver_id', receiverId)
      .eq('sender_id', senderId)
      .eq('is_read', false);

    if (error) throw new BadRequestException(error.message);
    return { message: 'Conversation marked as read' };
  }
}
