import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserBalanceClient } from './user-balance.client';

/**
 * Shared providers used across payment modules (deposit, payment, refund).
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [UserBalanceClient],
  exports: [UserBalanceClient],
})
export class CommonModule {}
