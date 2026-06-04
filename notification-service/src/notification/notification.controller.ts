import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuctionEndedDto } from './dto/auction-ended.dto';
import { ConfirmWinnerDto } from './dto/confirm-winner.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // ─── Called by auction-service scheduler when auction ends ────
  @Post('auction-ended')
  async auctionEnded(@Body() dto: AuctionEndedDto) {
    return this.notificationService.handleAuctionEnded(dto);
  }

  // ─── Called by auction-service when seller confirms winner ────
  @Post('confirm-winner')
  async confirmWinner(@Body() dto: ConfirmWinnerDto) {
    return this.notificationService.handleConfirmWinner(dto);
  }

  // ─── Get in-app notifications for a user ─────────────────────
  @Get('user/:userId')
  async getUserNotifications(@Param('userId') userId: string) {
    return this.notificationService.getUserNotifications(userId);
  }

  // ─── Mark notification as read ────────────────────────────────
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }
}