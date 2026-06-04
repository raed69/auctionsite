import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { proxyRequest } from '../../common/proxy.util';

@Controller('notifications')
export class NotificationsController {
  private readonly notificationServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.notificationServiceUrl = this.configService.get<string>('NOTIFICATION_SERVICE_URL')!;
  }

  /** POST /notifications/auction-ended — called by auction-service scheduler */
  @Post('auction-ended')
  @HttpCode(HttpStatus.OK)
  auctionEnded(@Body() body: any, @Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.notificationServiceUrl,
      path: '/notifications/auction-ended',
      method: 'POST',
      req,
      body,
    });
  }

  /** POST /notifications/confirm-winner — called by auction-service */
  @Post('confirm-winner')
  @HttpCode(HttpStatus.OK)
  confirmWinner(@Body() body: any, @Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.notificationServiceUrl,
      path: '/notifications/confirm-winner',
      method: 'POST',
      req,
      body,
    });
  }

  /** GET /notifications/user/:userId — get in-app notifications for a user */
  @Get('user/:userId')
  getUserNotifications(@Param('userId') userId: string, @Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.notificationServiceUrl,
      path: `/notifications/user/${userId}`,
      method: 'GET',
      req,
    });
  }

  /** PATCH /notifications/:id/read — mark notification as read */
  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  markAsRead(@Param('id') id: string, @Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.notificationServiceUrl,
      path: `/notifications/${id}/read`,
      method: 'PATCH',
      req,
    });
  }
}
