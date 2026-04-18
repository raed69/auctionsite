import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { AuctionService } from './auction.service';
import { CreateRealtimeAuctionDto } from './dto/create-realtime-auction.dto';
import { CreateDraftAuctionDto } from './dto/create-draft-auction.dto';
import type { Auction } from './interfaces/auction.interface';

class CloseAuctionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}

class DeleteAuctionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}

class DeleteAllAuctionsDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}

@Controller('auctions')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @Post('realtime')
  async createRealtimeAuction(
    @Body() dto: CreateRealtimeAuctionDto,
  ): Promise<Auction> {
    return await this.auctionService.createRealtimeAuction(dto);
  }

  @Post('draft')
  async createDraftAuction(
    @Body() dto: CreateDraftAuctionDto,
  ): Promise<Auction> {
    return await this.auctionService.createDraftAuction(dto);
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
  async closeAuction(
    @Param('id') id: string,
    @Body() body: CloseAuctionDto,
  ): Promise<Auction> {
    return await this.auctionService.closeAuction(id, body.userId);
  }

  @Delete(':id')
  async deleteAuctionById(
    @Param('id') id: string,
    @Body() body: DeleteAuctionDto,
  ): Promise<{ message: string }> {
    return await this.auctionService.deleteAuctionById(id, body.userId);
  }

  @Delete()
  async deleteAllAuctions(
    @Body() body: DeleteAllAuctionsDto,
  ): Promise<{ message: string; deletedCount: number }> {
    return await this.auctionService.deleteAllAuctions(body.userId);
  }
}