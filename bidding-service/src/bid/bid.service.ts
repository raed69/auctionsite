import {
    BadRequestException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { HttpService } from '@nestjs/axios';
  import { ConfigService } from '@nestjs/config';
  import { firstValueFrom } from 'rxjs';
  import { CreateBidDto } from './dto/create-bid.dto';
  import { Bid } from './interface/bid.interface';
  
  @Injectable()
  export class BidService {
    private bids: Bid[] = [];
    private auctionServiceUrl: string;
  
    constructor(
      private readonly httpService: HttpService,
      private readonly configService: ConfigService,
    ) {
      this.auctionServiceUrl =
        this.configService.get<string>('AUCTION_SERVICE_URL') || '';
    }
  
    async placeBid(dto: CreateBidDto): Promise<Bid> {
      let auction: any;
      const auctionUrl = `${this.auctionServiceUrl}/auctions/${dto.auctionId}`;
  
      console.log('Auction URL:', auctionUrl);
      console.log('Incoming bid DTO:', dto);
  
      try {
        const response = await firstValueFrom(this.httpService.get(auctionUrl));
        auction = response.data;
        console.log('Auction fetched:', auction);
      } catch (error: any) {
        console.log('Auction fetch failed status:', error?.response?.status);
        console.log('Auction fetch failed data:', error?.response?.data);
        console.log('Auction fetch failed message:', error?.message);
        throw new NotFoundException('Auction not found');
      }
  
      if (auction.status !== 'active') {
        throw new BadRequestException('Auction is not active');
      }
  
      const now = new Date();
      const endTime = new Date(auction.endTime ?? auction.end_time);
  
      if (now > endTime) {
        throw new BadRequestException('Auction already ended');
      }
  
      if (dto.bidderId === auction.seller_id) {
        throw new BadRequestException('Seller cannot bid');
      }
  
      if (dto.amount <= Number(auction.current_price)) {
        throw new BadRequestException(
          `Bid must be higher than ${auction.current_price}`,
        );
      }
  
      const bid: Bid = {
        id: Date.now().toString(),
        auction_id: dto.auctionId,
        bidder_id: dto.bidderId,
        amount: dto.amount,
        createdAt: new Date().toISOString(),
      };
  
      this.bids.push(bid);
  
      const patchUrl = `${this.auctionServiceUrl}/auctions/${dto.auctionId}/bid`;
      console.log('Patch URL:', patchUrl);
  
      await firstValueFrom(
        this.httpService.patch(patchUrl, {
          amount: dto.amount,
          bidderId: dto.bidderId,
        }),
      );
  
      return bid;
    }
  
    async getBidsByAuctionId(auctionId: string): Promise<Bid[]> {
      return this.bids.filter((bid) => bid.auction_id === auctionId);
    }
  }