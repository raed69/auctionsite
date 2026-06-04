import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { proxyRequest } from '../../common/proxy.util';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('bids')
export class BidsController {
  private readonly biddingServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.biddingServiceUrl = this.configService.get<string>('BIDDING_SERVICE_URL')!;
  }

  /** POST /bids — protected */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  placeBid(@Body() body: any, @Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.biddingServiceUrl,
      path: '/bids',
      method: 'POST',
      req,
      body,
    });
  }

  /** GET /bids/auction/:auctionId — public */
  @Get('auction/:auctionId')
  getBidsByAuctionId(@Param('auctionId') auctionId: string, @Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.biddingServiceUrl,
      path: `/bids/auction/${auctionId}`,
      method: 'GET',
      req,
    });
  }
}
