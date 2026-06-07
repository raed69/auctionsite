import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RefundController } from './refund.controller';
import { RefundService } from './refund.service';

@Module({
  imports: [ConfigModule],
  controllers: [RefundController],
  providers: [RefundService],
})
export class RefundModule {}
