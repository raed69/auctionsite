import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BidService } from './bid.service';
import { BidController } from './bid.controller';

@Module({
  imports: [HttpModule],
  providers: [BidService],
  controllers: [BidController],
})
export class BidModule {}