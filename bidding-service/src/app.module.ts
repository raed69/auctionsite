import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BidModule } from './bid/bid.module';

@Module({
  imports: [
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BidModule,
  ],
})
export class AppModule {}
