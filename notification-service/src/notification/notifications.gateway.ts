import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { wsCorsOrigin } from '../common/ws-cors';

/**
 * Real-time notification push over Socket.IO.
 *
 * Connection management / best practices:
 *  - JWT is verified at connection time (handshake `auth.token` or
 *    `Authorization: Bearer` header); unauthenticated sockets are disconnected.
 *  - Each authenticated socket joins a private room `user:<id>`, so a user
 *    receiving notifications on several tabs/devices gets them on all of them.
 *  - CORS origins are constrained by FRONTEND_URL (see ws-cors).
 *  - Socket.IO handles heartbeats, reconnection and transport upgrades for us.
 */
@WebSocketGateway({
  cors: { origin: wsCorsOrigin, credentials: true },
  // Dedicated namespace keeps notification traffic separate from any other
  // socket usage on the same origin.
  namespace: '/ws/notifications',
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  private server: Server;

  /**
   * Authenticate during the Socket.IO handshake (before "connect" fires) so an
   * unauthenticated client never establishes a connection — it receives a
   * connect_error instead. This is cleaner and safer than connecting then
   * disconnecting inside handleConnection.
   */
  afterInit(server: Server): void {
    server.use((client: Socket, next: (err?: Error) => void) => {
      const userId = this.authenticate(client);
      if (!userId) return next(new Error('Unauthorized'));
      client.data.userId = userId;
      next();
    });
    this.logger.log('Notifications WebSocket gateway initialised (/ws/notifications)');
  }

  handleConnection(client: Socket): void {
    const userId = client.data.userId as string;
    void client.join(this.room(userId));
    this.logger.log(`Notification socket connected for user ${userId}`);
  }

  handleDisconnect(client: Socket): void {
    const userId = client.data?.userId as string | undefined;
    if (userId) this.logger.log(`Notification socket disconnected (${userId})`);
  }

  /** Pushes a fresh notification to every live socket of a user. */
  emitToUser(userId: string, notification: unknown): void {
    if (!this.server) return; // gateway not yet initialised
    this.server.to(this.room(userId)).emit('notification:new', notification);
  }

  private room(userId: string): string {
    return `user:${userId}`;
  }

  /** Returns the authenticated user id (JWT `sub`) or null if the token is invalid. */
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
