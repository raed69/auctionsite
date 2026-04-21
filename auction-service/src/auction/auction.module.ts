import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuctionController } from './auction.controller';
import { AuctionService } from './auction.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [ConfigModule, SupabaseModule],
  controllers: [AuctionController],
  providers: [AuctionService],
  exports: [AuctionService],
})
export class AuctionModule {}