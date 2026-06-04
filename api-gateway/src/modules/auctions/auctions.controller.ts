import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { Request } from 'express';

// NOTE: POST /auctions/realtime and POST /auctions/draft are handled
// by http-proxy-middleware in auctions.module.ts (multipart/form-data)

@Controller('auctions')
export class AuctionsController {
  private readonly auctionServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.auctionServiceUrl =
      this.configService.get<string>('AUCTION_SERVICE_URL') ?? '';
  }

  @Get()
  async getAllAuctions() {
    const { data } = await axios.get(`${this.auctionServiceUrl}/auctions`);
    return data;
  }

  @Get(':id')
  async getAuctionById(@Param('id') id: string) {
    const { data } = await axios.get(`${this.auctionServiceUrl}/auctions/${id}`);
    return data;
  }

  @Patch(':id/close')
  @UseGuards(JwtAuthGuard)
  async closeAuction(@Param('id') id: string, @Req() req: Request) {
    const { data } = await axios.patch(
      `${this.auctionServiceUrl}/auctions/${id}/close`,
      {},
      { headers: { authorization: req.headers['authorization'] ?? '' } },
    );
    return data;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteAuctionById(@Param('id') id: string, @Req() req: Request) {
    const { data } = await axios.delete(
      `${this.auctionServiceUrl}/auctions/${id}`,
      { headers: { authorization: req.headers['authorization'] ?? '' } },
    );
    return data;
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async deleteAllAuctions(@Req() req: Request) {
    const { data } = await axios.delete(
      `${this.auctionServiceUrl}/auctions`,
      { headers: { authorization: req.headers['authorization'] ?? '' } },
    );
    return data;
  }

  @Patch(':id/bid')
  async updateAuctionAfterBid(
    @Param('id') id: string,
    @Body() body: { amount: number; bidderId: string },
  ) {
    const { data } = await axios.patch(
      `${this.auctionServiceUrl}/auctions/${id}/bid`,
      body,
    );
    return data;
  }

  @Patch(':id/confirm-winner')
  @UseGuards(JwtAuthGuard)
  async confirmWinner(@Param('id') id: string, @Req() req: Request) {
    const { data } = await axios.patch(
      `${this.auctionServiceUrl}/auctions/${id}/confirm-winner`,
      {},
      { headers: { authorization: req.headers['authorization'] ?? '' } },
    );
    return data;
  }
}