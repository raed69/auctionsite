import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuctionModule } from './auction/auction.module';
import { AuctionSchedulerModule } from './scheduler/auction-scheduler.module';
import { AuthModule } from './auction/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuctionModule,
    AuctionSchedulerModule,
    AuthModule,
  ],
})
export class AppModule {}
