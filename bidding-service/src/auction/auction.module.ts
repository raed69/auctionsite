import { Module } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { AuctionController } from './auction.controller';

@Module({
  providers: [AuctionService],
  controllers: [AuctionController]
})
export class AuctionModule {}
