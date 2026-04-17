import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BidModule } from './bid/bid.module';

@Module({
  imports: [BidModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
