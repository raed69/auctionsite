import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuctionModule } from './auction/auction.module';
import { AuctionSchedulerModule } from './scheduler/auction-scheduler.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuctionModule,
    AuctionSchedulerModule,
  ],
})
export class AppModule {}
