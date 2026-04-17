import { Module } from '@nestjs/common';
import { AuctionModule } from './auction/auction.module';

@Module({
  imports: [AuctionModule],
})
export class AppModule {}
