import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BidService } from './bid.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Bid } from './interfaces/bid.interface';

@Controller('bid')
export class BidController {
  constructor(private readonly bidService: BidService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createBid(
    @CurrentUser() user: UserPayload,
    @Body() createBidDto: CreateBidDto,
  ): Promise<{ message: string; bid: Bid }> {
    const bid = await this.bidService.createBid(user.userId, createBidDto);
    return {
      message: 'Bid created successfully',
      bid,
    };
  }

  @Get('auction/:auctionId')
  async getBidsByAuction(
    @Param('auctionId') auctionId: string,
  ): Promise<Bid[]> {
    return await this.bidService.getBidsByAuction(auctionId);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getBidsByUser(@CurrentUser() user: UserPayload): Promise<Bid[]> {
    return await this.bidService.getBidsByUser(user.userId);
  }

  @Get(':id')
  async getBidById(@Param('id') id: string): Promise<Bid> {
    return await this.bidService.getBidById(id);
  }

  @Get('auction/:auctionId/highest')
  async getHighestBid(
    @Param('auctionId') auctionId: string,
  ): Promise<Bid | null> {
    return await this.bidService.getHighestBid(auctionId);
  }
}
