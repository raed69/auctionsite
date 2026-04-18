import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { AuctionService } from './auction.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import type { Auction } from './interfaces/auction.interface';

class CloseAuctionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}

@Controller('auctions')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @Post()
  async createAuction(
    @Body() createAuctionDto: CreateAuctionDto,
  ): Promise<Auction> {
    return await this.auctionService.createAuction(createAuctionDto);
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
}