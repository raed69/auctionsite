import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import type { Auction } from './interfaces/auction.interface';
@Controller('auctions')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @Post()
  createAuction(@Body() createAuctionDto: CreateAuctionDto): Auction {
    return this.auctionService.createAuction(createAuctionDto);
  }

  @Get()
  getAllAuctions(): Auction[] {
    return this.auctionService.getAllAuctions();
  }

  @Get(':id')
  getAuctionById(@Param('id') id: string): Auction {
    return this.auctionService.getAuctionById(id);
  }

  @Patch(':id/close')
  closeAuction(@Param('id') id: string): Auction {
    return this.auctionService.closeAuction(id);
  }
}
