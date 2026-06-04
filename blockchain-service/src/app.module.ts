import { Module } from '@nestjs/common';
import { BlockchainController } from './blockchain/blockchain.controller';
import { BlockchainService } from './blockchain/blockchain.service';

@Module({
  imports: [],
  controllers: [BlockchainController],
  providers: [BlockchainService],
})
export class AppModule {}
