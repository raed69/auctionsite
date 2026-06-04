import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';

@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  // ✅ Create auction
  @Post('createAuction')
  async createAuction(
    @Body()
    body: {
      sellerWallet: string;
      auctionId: string;
      minBidSol: number;
      endTime: number;
    },
  ) {
    try {
      return await this.blockchainService.buildCreateAuctionTransaction(
        body.sellerWallet,
        body.auctionId,
        body.minBidSol,
        body.endTime,
      );
    } catch (error) {
      return { error: error.message };
    }
  }

  // ✅ Place bid
  @Post('placeBid')
  async placeBid(
    @Body()
    body: {
      bidderWallet: string;
      auctionId: string;
      bidAmountSol: number;
      previousBidderWallet?: string;
    },
  ) {
    try {
      return await this.blockchainService.buildPlaceBidTransaction(
        body.bidderWallet,
        body.auctionId,
        body.bidAmountSol,
        body.previousBidderWallet,
      );
    } catch (error) {
      return { error: error.message };
    }
  }

  // ✅ Close auction
  @Post('closeAuction')
  async closeAuction(
    @Body() body: { sellerWallet: string; auctionId: string },
  ) {
    try {
      return await this.blockchainService.buildCloseAuctionTransaction(
        body.sellerWallet,
        body.auctionId,
      );
    } catch (error) {
      return { error: error.message };
    }
  }

  // ✅ Send signed transaction
  @Post('sendTransaction')
  async sendTransaction(@Body() body: { signedTransaction: string }) {
    try {
      return await this.blockchainService.sendSignedTransaction(
        body.signedTransaction,
      );
    } catch (error) {
      return { error: error.message };
    }
  }

  // ✅ Get auction state
  @Get('auction/:auctionId')
  async getAuction(@Param('auctionId') auctionId: string) {
    try {
      return await this.blockchainService.getAuctionState(auctionId);
    } catch (error) {
      return { error: error.message };
    }
  }

  // ✅ Get escrow balance
  @Get('escrow/:auctionId')
  async getEscrowBalance(@Param('auctionId') auctionId: string) {
    try {
      const balance = await this.blockchainService.getEscrowBalance(auctionId);
      return { auctionId, escrowBalance: balance };
    } catch (error) {
      return { error: error.message };
    }
  }

  // ✅ Check wallet balance
  @Get('balance/:wallet')
  async getBalance(@Param('wallet') wallet: string) {
    try {
      const balance = await this.blockchainService.checkBalance(wallet);
      return { wallet, balance };
    } catch (error) {
      return { error: error.message };
    }
  }
}
