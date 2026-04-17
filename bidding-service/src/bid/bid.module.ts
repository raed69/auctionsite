import { Module } from '@nestjs/common';
import { BidService } from './bid.service';
import { BidController } from './bid.controller';

@Module({
  providers: [BidService],
  controllers: [BidController]
})
export class BidModule {}
