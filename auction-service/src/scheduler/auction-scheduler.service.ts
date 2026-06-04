import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from '../supabase/supabase.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuctionSchedulerService {
  private readonly logger = new Logger(AuctionSchedulerService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {}

  // ─── Activate draft auctions ──────────────────────────────────
  @Cron(CronExpression.EVERY_MINUTE)
  async activateDraftAuctions() {
    this.logger.log('Checking for draft auctions to activate...');
    const supabase = this.supabaseService.getClient();
    const now = new Date().toISOString();

    const { data: draftAuctions, error } = await supabase
      .from('auctions')
      .select('*')
      .eq('status', 'draft')
      .lte('start_time', now);

    if (error) {
      this.logger.error('Error fetching draft auctions:', error.message);
      return;
    }

    if (!draftAuctions || draftAuctions.length === 0) {
      this.logger.log('No draft auctions to activate');
      return;
    }

    for (const auction of draftAuctions) {
      await this.activateAuction(auction);
    }
  }

  // ─── End expired auctions + trigger winner flow ───────────────
  @Cron(CronExpression.EVERY_MINUTE)
  async closeExpiredAuctions() {
    this.logger.log('Checking for expired auctions to close...');
    const supabase = this.supabaseService.getClient();
    const now = new Date().toISOString();

    const { data: expiredAuctions, error } = await supabase
      .from('auctions')
      .select('*')
      .in('status', ['active'])
      .lte('end_time', now);

    if (error) {
      this.logger.error('Error fetching expired auctions:', error.message);
      return;
    }

    if (!expiredAuctions || expiredAuctions.length === 0) {
      this.logger.log('No expired auctions to close');
      return;
    }

    this.logger.log(`Found ${expiredAuctions.length} expired auction(s)`);

    for (const auction of expiredAuctions) {
      await this.closeAuction(auction);
    }
  }

  // ─── Close a single auction + handle winner flow ──────────────
  private async closeAuction(auction: any) {
    const supabase = this.supabaseService.getClient();
    const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL');
    const internalSecret = this.configService.get<string>('INTERNAL_SECRET');
    const notificationServiceUrl = this.configService.get<string>(
      'NOTIFICATION_SERVICE_URL',
    );

    const hasWinner = !!auction.highest_bidder_id;

    // ─── 1. Mark auction as ended ─────────────────────────────
    const { error: closeError } = await supabase
      .from('auctions')
      .update({
        status: 'ended',
        winner_id: hasWinner ? auction.highest_bidder_id : null,
        closed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', auction.id);

    if (closeError) {
      this.logger.error(
        `Failed to close auction ${auction.id}:`,
        closeError.message,
      );
      return;
    }

    this.logger.log(
      `✅ Auction ${auction.id} closed. Winner: ${auction.highest_bidder_id ?? 'none'}`,
    );

    // ─── 2. No winner — nothing else to do ───────────────────
    if (!hasWinner) {
      this.logger.log(`Auction ${auction.id} ended with no bids`);
      return;
    }

    // ─── 3. TND: Credit seller balance ───────────────────────
    if (auction.bid_method === 'TND' || !auction.bid_method) {
      try {
        await fetch(
          `${userServiceUrl}/user/internal/balance/credit/${auction.seller_id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'x-service-secret': internalSecret ?? '',
            },
            body: JSON.stringify({ amount: Number(auction.current_price) }),
          },
        );
        this.logger.log(
          `✅ Seller ${auction.seller_id} credited ${auction.current_price} TND`,
        );
      } catch (err) {
        this.logger.error(
          `Failed to credit seller ${auction.seller_id}:`,
          err.message,
        );
      }
    }

    // ─── 4. SOL: Release escrow ───────────────────────────────
    if (auction.bid_method === 'SOL') {
      try {
        await fetch(
          `${process.env.BLOCKCHAIN_SERVICE_URL}/blockchain/releaseEscrow`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              auctionId: auction.solana_auction_id,
              escrowAddress: auction.escrow_address,
              sellerWallet: auction.sellerwallet,
            }),
          },
        );
        this.logger.log(`✅ SOL escrow released for auction ${auction.id}`);
      } catch (err) {
        this.logger.error(
          `Failed to release escrow for auction ${auction.id}:`,
          err.message,
        );
      }
    }

    // ─── 5. Notify winner and seller ─────────────────────────
    try {
      await fetch(`${notificationServiceUrl}/notifications/auction-ended`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auctionId: auction.id,
          auctionTitle: auction.title,
          winnerId: auction.highest_bidder_id,
          sellerId: auction.seller_id,
          winningAmount: auction.current_price,
          bidMethod: auction.bid_method,
        }),
      });
      this.logger.log(`✅ Notifications sent for auction ${auction.id}`);
    } catch (err) {
      this.logger.error(
        `Failed to send notifications for auction ${auction.id}:`,
        err.message,
      );
    }
  }

  // ─── Activate auction (existing logic unchanged) ──────────────
  private async activateAuction(auction: any) {
    const supabase = this.supabaseService.getClient();

    if (auction.bid_method === 'TND' || !auction.bid_method) {
      const { error } = await supabase
        .from('auctions')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', auction.id);

      if (error) {
        this.logger.error(
          `Failed to activate TND auction ${auction.id}:`,
          error.message,
        );
      } else {
        this.logger.log(`✅ TND auction ${auction.id} activated`);
      }
      return;
    }

    if (auction.bid_method === 'SOL') {
      try {
        if (!auction.sellerwallet) {
          this.logger.error(
            `SOL auction ${auction.id} has no seller wallet — skipping`,
          );
          return;
        }

        const endTimeUnix = Math.floor(
          new Date(auction.end_time).getTime() / 1000,
        );
        const solanaAuctionId = auction.id.replace(/-/g, '').substring(0, 32);

        const blockchainRes = await fetch(
          `${process.env.BLOCKCHAIN_SERVICE_URL}/blockchain/createAuction`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sellerWallet: auction.sellerwallet,
              auctionId: solanaAuctionId,
              minBidSol: auction.starting_price,
              endTime: endTimeUnix,
            }),
          },
        );

        const blockchainData = await blockchainRes.json();

        if (blockchainData.error) {
          this.logger.error(
            `Blockchain error for auction ${auction.id}:`,
            blockchainData.error,
          );
          return;
        }

        const { error } = await supabase
          .from('auctions')
          .update({
            status: 'active',
            escrow_address: blockchainData.escrowAddress,
            solana_auction_id: solanaAuctionId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', auction.id);

        if (error) {
          this.logger.error(
            `Failed to update SOL auction ${auction.id}:`,
            error.message,
          );
        } else {
          this.logger.log(
            `✅ SOL auction ${auction.id} activated with escrow: ${blockchainData.escrowAddress}`,
          );
        }
      } catch (err) {
        this.logger.error(
          `Failed to activate SOL auction ${auction.id}:`,
          err.message,
        );
      }
    }
  }
}
