import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuctionSchedulerService {
  private readonly logger = new Logger(AuctionSchedulerService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  // ✅ Runs every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async activateDraftAuctions() {
    this.logger.log('Checking for draft auctions to activate...');
    const supabase = this.supabaseService.getClient();
    const now = new Date().toISOString();

    // Find all draft auctions where startTime <= now
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

    this.logger.log(
      `Found ${draftAuctions.length} draft auction(s) to activate`,
    );

    for (const auction of draftAuctions) {
      await this.activateAuction(auction);
    }
  }

  private async activateAuction(auction: any) {
    const supabase = this.supabaseService.getClient();

    // ✅ TND auction — just update status to active
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

    // ✅ SOL auction — call blockchain-service first
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

        // Call blockchain-service to build the transaction
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

        // Update Supabase with escrow address and activate
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
