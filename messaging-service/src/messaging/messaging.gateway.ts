import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { MessagingService } from './messaging.service';
import { wsCorsOrigin } from '../common/ws-cors';

interface SendPayload {
  receiverId?: string;
  content?: string;
  auctionId?: string;
}

/**
 * Real-time direct messaging over Socket.IO.
 *
 * Connection management / best practices:
 *  - JWT verified at handshake (`auth.token` or `Authorization` header);
 *    bad tokens are disconnected immediately.
 *  - Each socket joins a private room `user:<id>`; messages are emitted to both
 *    the sender's and the recipient's rooms so every open tab stays in sync.
 *  - Payloads are validated before hitting the DB; all handlers reply through
 *    Socket.IO ack callbacks with a consistent `{ ok, error? }` shape.
 *  - Persistence reuses MessagingService, so REST and WebSocket share one path.
 */
@WebSocketGateway({
  cors: { origin: wsCorsOrigin, credentials: true },
  namespace: '/ws/messaging',
})
export class MessagingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(MessagingGateway.name);

  @WebSocketServer()
  private server: Server;

  constructor(private readonly messagingService: MessagingService) {}

  /**
   * Authenticate during the Socket.IO handshake (before "connect" fires) so an
   * unauthenticated client never establishes a connection — it receives a
   * connect_error instead.
   */
  afterInit(server: Server): void {
    server.use((client: Socket, next: (err?: Error) => void) => {
      const userId = this.authenticate(client);
      if (!userId) return next(new Error('Unauthorized'));
      client.data.userId = userId;
      next();
    });
    this.logger.log('Messaging WebSocket gateway initialised (/ws/messaging)');
  }

  handleConnection(client: Socket): void {
    const userId = client.data.userId as string;
    void client.join(this.room(userId));
    this.logger.log(`Messaging socket connected for user ${userId}`);
  }

  handleDisconnect(client: Socket): void {
    const userId = client.data?.userId as string | undefined;
    if (userId) this.logger.log(`Messaging socket disconnected (${userId})`);
  }

  // ─── Send a message ───────────────────────────────────────────────────────
  @SubscribeMessage('message:send')
  async onSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendPayload,
  ): Promise<{ ok: boolean; message?: unknown; error?: string }> {
    const senderId = client.data.userId as string;

    const validationError = this.validateSend(payload);
    if (validationError) return { ok: false, error: validationError };

    try {
      const message = await this.messagingService.sendMessage(senderId, {
        receiverId: payload.receiverId as string,
        content: (payload.content as string).trim(),
        auctionId: payload.auctionId,
      });

      // Deliver to both participants (all their open tabs).
      this.server.to(this.room(payload.receiverId as string)).emit('message:new', message);
      this.server.to(this.room(senderId)).emit('message:new', message);

      return { ok: true, message };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to send message';
      return { ok: false, error };
    }
  }

  // ─── Typing indicator ─────────────────────────────────────────────────────
  @SubscribeMessage('typing')
  onTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { receiverId?: string; typing?: boolean },
  ): void {
    const senderId = client.data.userId as string;
    if (!payload?.receiverId) return;
    this.server.to(this.room(payload.receiverId)).emit('typing', {
      from: senderId,
      typing: !!payload.typing,
    });
  }

  // ─── Mark a conversation as read ──────────────────────────────────────────
  @SubscribeMessage('message:read')
  async onRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { otherUserId?: string },
  ): Promise<{ ok: boolean; error?: string }> {
    const userId = client.data.userId as string;
    if (!payload?.otherUserId) return { ok: false, error: 'otherUserId is required' };
    try {
      await this.messagingService.markConversationAsRead(userId, payload.otherUserId);
      // Tell the other participant their messages were read (read receipts).
      this.server.to(this.room(payload.otherUserId)).emit('message:read', { by: userId });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Failed' };
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  private validateSend(payload: SendPayload): string | null {
    if (!payload || typeof payload !== 'object') return 'Invalid payload';
    if (!payload.receiverId) return 'receiverId is required';
    if (!payload.content || !payload.content.trim()) return 'content is required';
    if (payload.content.length > 2000) return 'content exceeds 2000 characters';
    return null;
  }

  private room(userId: string): string {
    return `user:${userId}`;
  }

  private authenticate(client: Socket): string | null {
    const token =
      (client.handshake.auth?.token as string | undefined) ??
      this.bearerFromHeader(client.handshake.headers?.authorization);
    if (!token) return null;
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
        sub?: string;
        userId?: string;
      };
      return payload.sub ?? payload.userId ?? null;
    } catch {
      return null;
    }
  }

  private bearerFromHeader(header?: string): string | undefined {
    if (!header || !header.startsWith('Bearer ')) return undefined;
    return header.slice(7);
  }
}
