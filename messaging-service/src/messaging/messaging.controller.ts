import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('messaging')
@UseGuards(JwtAuthGuard)  // every route in this controller requires a valid JWT
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  /**
   * POST /messaging
   * Send a message to another user.
   * Body: { receiverId, content, auctionId? }
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  sendMessage(
    @CurrentUser() userId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagingService.sendMessage(userId, dto);
  }

  /**
   * GET /messaging/conversation/:otherUserId
   * Get the full message thread between the logged-in user and another user.
   * Optional query param: ?auctionId=<uuid>
   */
  @Get('conversation/:otherUserId')
  getConversation(
    @CurrentUser() userId: string,
    @Param('otherUserId') otherUserId: string,
    @Query('auctionId') auctionId?: string,
  ) {
    return this.messagingService.getConversation(
      userId,
      userId,
      otherUserId,
      auctionId,
    );
  }

  /**
   * GET /messaging/inbox
   * Get the inbox of the logged-in user — one entry per conversation thread.
   */
  @Get('inbox')
  getInbox(@CurrentUser() userId: string) {
    return this.messagingService.getInbox(userId);
  }

  /**
   * GET /messaging/unread
   * Get the unread message count for the logged-in user.
   * Returns: { unread: number }
   */
  @Get('unread')
  getUnreadCount(@CurrentUser() userId: string) {
    return this.messagingService.getUnreadCount(userId);
  }

  /**
   * PATCH /messaging/:messageId/read
   * Mark a specific message as read.
   */
  @Patch(':messageId/read')
  @HttpCode(HttpStatus.OK)
  markAsRead(
    @CurrentUser() userId: string,
    @Param('messageId') messageId: string,
  ) {
    return this.messagingService.markAsRead(messageId, userId);
  }

  /**
   * PATCH /messaging/conversation/:otherUserId/read
   * Mark all messages from a specific user as read in one go.
   * Useful when the user opens the conversation thread.
   */
  @Patch('conversation/:otherUserId/read')
  @HttpCode(HttpStatus.OK)
  markConversationAsRead(
    @CurrentUser() userId: string,
    @Param('otherUserId') otherUserId: string,
  ) {
    return this.messagingService.markConversationAsRead(userId, otherUserId);
  }
}
