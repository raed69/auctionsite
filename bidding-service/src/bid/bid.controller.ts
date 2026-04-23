import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BidService } from './bid.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { Bid } from './interface/bid.interface';


@Controller('bids')
export class BidController {
  constructor(private readonly bidService: BidService) {}

  @Post()
  async placeBid(@Body() dto: CreateBidDto): Promise<Bid> {
    return this.bidService.placeBid(dto);
  }

  @Get('auction/:auctionId')
  async getBidsByAuctionId(
    @Param('auctionId') auctionId: string,
  ): Promise<Bid[]> {
    return this.bidService.getBidsByAuctionId(auctionId);
  }
}