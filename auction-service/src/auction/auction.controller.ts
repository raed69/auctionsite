/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuctionService } from './auction.service';
import { CreateRealtimeAuctionDto } from './dto/create-realtime-auction.dto';
import { CreateDraftAuctionDto } from './dto/create-draft-auction.dto';

import type { Auction } from './interfaces/auction.interface';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { Roles } from './auth/roles.decorator';

@Controller('auctions')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @Post('realtime')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  @UseInterceptors(FilesInterceptor('images', 10, { storage: memoryStorage() }))
  async createRealtimeAuction(
    @Body() dto: CreateRealtimeAuctionDto,
    @UploadedFiles() images: Express.Multer.File[],
    @Request() req, // ← get token
  ) {
    console.log('JWT USER:', req.user); // ← add this
    dto.sellerId = req.user.sub; // ← inject sellerId from JWT
    return await this.auctionService.createRealtimeAuction(dto, images);
  }

  @Post('draft')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  @UseInterceptors(FilesInterceptor('images', 10, { storage: memoryStorage() }))
  async createDraftAuction(
    @Body() dto: CreateDraftAuctionDto,
    @UploadedFiles() images: Express.Multer.File[],
    @Request() req, // ← get token
  ) {
    dto.sellerId = req.user.sub; // ← inject sellerId from JWT
    return await this.auctionService.createDraftAuction(dto, images);
  }

  @Get()
  async getAllAuctions(): Promise<Auction[]> {
    return await this.auctionService.getAllAuctions();
  }

  @Get(':id')
  async getAuctionById(@Param('id') id: string): Promise<Auction> {
    return await this.auctionService.getAuctionById(id);
  }

  @Patch(':id/close')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'admin')
  async closeAuction(
    @Param('id') id: string,
    @Request() req,
  ): Promise<Auction> {
    return await this.auctionService.closeAuction(id, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller', 'admin')
  async deleteAuctionById(
    @Param('id') id: string,
    @Request() req,
  ): Promise<{ message: string }> {
    return await this.auctionService.deleteAuctionById(id, req.user.sub);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteAllAuctions(
    @Request() req,
  ): Promise<{ message: string; deletedCount: number }> {
    return await this.auctionService.deleteAllAuctions(req.user.sub);
  }

  @Patch(':id/bid')
  async updateAuctionAfterBid(
    @Param('id') id: string,
    @Body() body: { amount: number; bidderId: string },
  ) {
    return this.auctionService.updateAuctionAfterBid(
      id,
      body.amount,
      body.bidderId,
    );
  }

  @Patch(':id/confirm-winner')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  async confirmWinner(@Param('id') id: string, @Request() req) {
    return this.auctionService.confirmWinner(id, req.user.sub);
  }
}
