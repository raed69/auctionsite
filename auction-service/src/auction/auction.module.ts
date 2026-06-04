import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuctionController } from './auction.controller';
import { AuctionService } from './auction.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ConfigModule, SupabaseModule,AuthModule],
  controllers: [AuctionController],
  providers: [AuctionService],
  exports: [AuctionService],
})
export class AuctionModule {}