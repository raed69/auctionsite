import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SupabaseService } from '../supabase/supabase.service';
import { AuctionSchedulerService } from './auction-scheduler.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [AuctionSchedulerService, SupabaseService],
})
export class AuctionSchedulerModule {}