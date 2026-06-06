import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuctionsController } from './auctions.controller';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { createProxyMiddleware } from 'http-proxy-middleware';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [AuctionsController],
  providers: [JwtAuthGuard],
})
export class AuctionsModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}

configure(consumer: MiddlewareConsumer) {
  console.log('AUCTION_SERVICE_URL:', process.env.AUCTION_SERVICE_URL);
  const auctionServiceUrl = process.env.AUCTION_SERVICE_URL!;

    consumer
      .apply(
        createProxyMiddleware({
          target: auctionServiceUrl,
          changeOrigin: true,
          on: {
            proxyReq: (proxyReq, req: any) => {
              if (req.headers['authorization']) {
                proxyReq.setHeader('authorization', req.headers['authorization']);
              }
              if (req.headers['content-type']) {
                proxyReq.setHeader('content-type', req.headers['content-type']);
              }
            },
            error: (err, req, res: any) => {
              res.status(502).json({ message: 'Auction service unavailable' });
            },
          },
        }),
      )
      .forRoutes(
        { path: 'auctions/realtime', method: RequestMethod.POST },
        { path: 'auctions/draft', method: RequestMethod.POST },
      );
  }
}
