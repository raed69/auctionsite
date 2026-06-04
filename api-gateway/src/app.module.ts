import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

// ── Feature Modules ──────────────────────────────────────────────
import { AuctionsModule } from './modules/auctions/auctions.module';

// ── Controllers registered directly (no middleware needed) ───────
import { AuthController } from './modules/auth/auth.controller';
import { UsersController } from './modules/users/users.controller';
import { BidsController } from './modules/bids/bids.controller';
import { BlockchainController } from './modules/blockchain/blockchain.controller';
import { NotificationsController } from './modules/notifications/notifications.controller';
import { PaymentsController } from './modules/payments/payments.controller';

// ── Guards ───────────────────────────────────────────────────────
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
    AuctionsModule,   // ← this loads the middleware for /auctions/realtime and /auctions/draft
  ],

  controllers: [
    AuthController,
    UsersController,
    // AuctionsController is registered inside AuctionsModule — do NOT add it here
    BidsController,
    BlockchainController,
    NotificationsController,
    PaymentsController,
  ],

  providers: [
    JwtAuthGuard,
  ],
})
export class AppModule {}