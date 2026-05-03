import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DepositController } from './deposit.controller';
import { DepositService } from './deposit.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [DepositController],
  providers: [DepositService],
})
export class DepositModule {}