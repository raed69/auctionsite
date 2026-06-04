import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WithdrawController } from './withdraw.controller';
import { WithdrawService } from './withdraw.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [WithdrawController],
  providers: [WithdrawService],
})
export class WithdrawModule {}