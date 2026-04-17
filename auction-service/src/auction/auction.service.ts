import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { Auction } from './interfaces/auction.interface';

@Injectable()
export class AuctionService {
  private auctions: Auction[] = [];

  createAuction(createAuctionDto: CreateAuctionDto): Auction {
    const newAuction: Auction = {
      id: Date.now().toString(),
      ...createAuctionDto,
      currentPrice: createAuctionDto.startingPrice,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    this.auctions.push(newAuction);
    return newAuction;
  }

  getAllAuctions(): Auction[] {
    return this.auctions;
  }

  getAuctionById(id: string): Auction {
    const auction = this.auctions.find((a) => a.id === id);

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    return auction;
  }

  closeAuction(id: string): Auction {
    const auction = this.getAuctionById(id);
    auction.status = 'ended';
    return auction;
  }

  isAuctionActive(id: string): boolean {
    const auction = this.getAuctionById(id);
    return auction.status === 'active';
  }

  updateCurrentPrice(id: string, amount: number): Auction {
    const auction = this.getAuctionById(id);
    auction.currentPrice = amount;
    return auction;
  }
}