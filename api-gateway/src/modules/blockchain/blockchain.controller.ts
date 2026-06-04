import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { proxyRequest } from '../../common/proxy.util';

@Controller('blockchain')
export class BlockchainController {
  private readonly blockchainServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.blockchainServiceUrl = this.configService.get<string>('BLOCKCHAIN_SERVICE_URL')!;
  }

  /** POST /blockchain/createAuction — public (signed on frontend) */
  @Post('createAuction')
  @HttpCode(HttpStatus.CREATED)
  createAuction(@Body() body: any, @Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.blockchainServiceUrl,
      path: '/blockchain/createAuction',
      method: 'POST',
      req,
      body,
    });
  }

  /** POST /blockchain/placeBid — public (signed on frontend) */
  @Post('placeBid')
  @HttpCode(HttpStatus.CREATED)
  placeBid(@Body() body: any, @Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.blockchainServiceUrl,
      path: '/blockchain/placeBid',
      method: 'POST',
      req,
      body,
    });
  }

  /** POST /blockchain/closeAuction — public (signed on frontend) */
  @Post('closeAuction')
  @HttpCode(HttpStatus.OK)
  closeAuction(@Body() body: any, @Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.blockchainServiceUrl,
      path: '/blockchain/closeAuction',
      method: 'POST',
      req,
      body,
    });
  }

  /** POST /blockchain/sendTransaction — send signed tx from frontend */
  @Post('sendTransaction')
  @HttpCode(HttpStatus.OK)
  sendTransaction(@Body() body: any, @Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.blockchainServiceUrl,
      path: '/blockchain/sendTransaction',
      method: 'POST',
      req,
      body,
    });
  }

  /** GET /blockchain/auction/:auctionId — public */
  @Get('auction/:auctionId')
  getAuction(@Param('auctionId') auctionId: string, @Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.blockchainServiceUrl,
      path: `/blockchain/auction/${auctionId}`,
      method: 'GET',
      req,
    });
  }

  /** GET /blockchain/escrow/:auctionId — public */
  @Get('escrow/:auctionId')
  getEscrowBalance(@Param('auctionId') auctionId: string, @Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.blockchainServiceUrl,
      path: `/blockchain/escrow/${auctionId}`,
      method: 'GET',
      req,
    });
  }

  /** GET /blockchain/balance/:wallet — public */
  @Get('balance/:wallet')
  getBalance(@Param('wallet') wallet: string, @Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.blockchainServiceUrl,
      path: `/blockchain/balance/${wallet}`,
      method: 'GET',
      req,
    });
  }
}
