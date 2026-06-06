import { Controller, Get, Post, Patch, Param, Query, Body, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { proxyRequest } from '../../common/proxy.util';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('messaging')
@UseGuards(JwtAuthGuard)
export class MessagingController {
  private readonly url: string;
  constructor(cfg: ConfigService) {
    this.url = cfg.get<string>('MESSAGING_SERVICE_URL')!;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  send(@Body() body: any, @Req() req: Request) {
    return proxyRequest({ serviceUrl: this.url, path: '/messaging', method: 'POST', req, body });
  }

  @Get('inbox')
  inbox(@Req() req: Request) {
    return proxyRequest({ serviceUrl: this.url, path: '/messaging/inbox', method: 'GET', req });
  }

  @Get('unread')
  unread(@Req() req: Request) {
    return proxyRequest({ serviceUrl: this.url, path: '/messaging/unread', method: 'GET', req });
  }

  @Get('conversation/:otherUserId')
  conversation(@Param('otherUserId') id: string, @Query('auctionId') aid: string, @Req() req: Request) {
    const qs = aid ? `?auctionId=${aid}` : '';
    return proxyRequest({ serviceUrl: this.url, path: `/messaging/conversation/${id}${qs}`, method: 'GET', req });
  }

  @Patch(':messageId/read')
  @HttpCode(HttpStatus.OK)
  markOne(@Param('messageId') mid: string, @Req() req: Request) {
    return proxyRequest({ serviceUrl: this.url, path: `/messaging/${mid}/read`, method: 'PATCH', req });
  }

  @Patch('conversation/:otherUserId/read')
  @HttpCode(HttpStatus.OK)
  markThread(@Param('otherUserId') id: string, @Req() req: Request) {
    return proxyRequest({ serviceUrl: this.url, path: `/messaging/conversation/${id}/read`, method: 'PATCH', req });
  }
}
