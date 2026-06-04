/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { AnchorProvider, Program, web3, BN } from '@coral-xyz/anchor';
import * as IDL from './auction_escrow.json';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class BlockchainService {
  private connection: Connection;
  private programId: PublicKey;

  constructor() {
    const rpcUrl = process.env.RPC_URL;
    if (!rpcUrl) throw new Error('RPC_URL is not set.');

    const programId = process.env.ESCROW_PROGRAM_ID;
    if (!programId) throw new Error('ESCROW_PROGRAM_ID is not set.');

    this.connection = new Connection(rpcUrl, 'confirmed');
    this.programId = new PublicKey(programId);
  }

  // ✅ Get auction PDA address
  async getAuctionPDA(auctionId: string): Promise<PublicKey> {
    const [pda] = await PublicKey.findProgramAddress(
      [Buffer.from('auction'), Buffer.from(auctionId)],
      this.programId,
    );
    return pda;
  }

  // ✅ Check wallet balance
  async checkBalance(userWallet: string): Promise<number> {
    const publicKey = new PublicKey(userWallet);
    const balance = await this.connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  }

  // ✅ Build create auction transaction
  async buildCreateAuctionTransaction(
    sellerWallet: string,
    auctionId: string,
    minBidSol: number,
    endTime: number,
  ): Promise<{ transaction: string; escrowAddress: string }> {
    const sellerPublicKey = new PublicKey(sellerWallet);
    const auctionPDA = await this.getAuctionPDA(auctionId);
    const program = this.getProgram();

    const tx = await program.methods
      .createAuction(
        auctionId,
        new BN(minBidSol * LAMPORTS_PER_SOL),
        new BN(endTime),
      )
      .accounts({
        auction: auctionPDA,
        seller: sellerPublicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .transaction();

    const { blockhash } = await this.connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = sellerPublicKey;

    return {
      transaction: tx
        .serialize({ requireAllSignatures: false })
        .toString('base64'),
      escrowAddress: auctionPDA.toString(),
    };
  }

  // ✅ Build place bid transaction
  async buildPlaceBidTransaction(
    bidderWallet: string,
    auctionId: string,
    bidAmountSol: number,
    previousBidderWallet?: string,
  ): Promise<{ transaction: string; escrowAddress: string }> {
    const bidderPublicKey = new PublicKey(bidderWallet);
    const auctionPDA = await this.getAuctionPDA(auctionId);

    // Check balance before building transaction
    const balance = await this.connection.getBalance(bidderPublicKey);
    const bidAmountLamports = bidAmountSol * LAMPORTS_PER_SOL;
    if (balance < bidAmountLamports) {
      throw new Error(
        `Insufficient funds. Balance: ${balance / LAMPORTS_PER_SOL} SOL, Required: ${bidAmountSol} SOL`,
      );
    }

    const previousBidder = previousBidderWallet
      ? new PublicKey(previousBidderWallet)
      : bidderPublicKey;

    const program = this.getProgram();

    const tx = await program.methods
      .placeBid(new BN(bidAmountLamports))
      .accounts({
        auction: auctionPDA,
        bidder: bidderPublicKey,
        previousBidder: previousBidder,
        escrow: auctionPDA,
        systemProgram: web3.SystemProgram.programId,
      })
      .transaction();

    const { blockhash } = await this.connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = bidderPublicKey;

    return {
      transaction: tx
        .serialize({ requireAllSignatures: false })
        .toString('base64'),
      escrowAddress: auctionPDA.toString(),
    };
  }

  // ✅ Build close auction transaction
  async buildCloseAuctionTransaction(
    sellerWallet: string,
    auctionId: string,
  ): Promise<{ transaction: string }> {
    const sellerPublicKey = new PublicKey(sellerWallet);
    const auctionPDA = await this.getAuctionPDA(auctionId);
    const program = this.getProgram();

    const tx = await program.methods
      .closeAuction()
      .accounts({
        auction: auctionPDA,
        seller: sellerPublicKey,
        escrow: auctionPDA,
        systemProgram: web3.SystemProgram.programId,
      })
      .transaction();

    const { blockhash } = await this.connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = sellerPublicKey;

    return {
      transaction: tx
        .serialize({ requireAllSignatures: false })
        .toString('base64'),
    };
  }

  // ✅ Send signed transaction from frontend
  async sendSignedTransaction(signedTransactionBase64: string) {
    try {
      const buffer = Buffer.from(signedTransactionBase64, 'base64');
      const txId = await this.connection.sendRawTransaction(buffer);
      await this.connection.confirmTransaction(txId, 'confirmed');
      return { success: true, txId };
    } catch (error) {
      throw new Error('Error sending transaction: ' + error.message);
    }
  }

  // ✅ Get auction state from blockchain
  async getAuctionState(auctionId: string) {
    try {
      const auctionPDA = await this.getAuctionPDA(auctionId);
      const program = this.getProgram();
      const state = await program.account.auction.fetch(auctionPDA);
      return {
        seller: state.seller.toString(),
        minBid: state.minBid.toNumber() / LAMPORTS_PER_SOL,
        highestBid: state.highestBid.toNumber() / LAMPORTS_PER_SOL,
        highestBidder: state.highestBidder.toString(),
        endTime: state.endTime.toNumber(),
        isClosed: state.isClosed,
      };
    } catch {
      throw new Error('Auction not found on blockchain');
    }
  }

  // ✅ Get escrow balance
  async getEscrowBalance(auctionId: string): Promise<number> {
    const auctionPDA = await this.getAuctionPDA(auctionId);
    const balance = await this.connection.getBalance(auctionPDA);
    return balance / LAMPORTS_PER_SOL;
  }

  // ✅ Readonly program instance (no wallet needed)
  private getProgram() {
    const provider = new AnchorProvider(
      this.connection,
      {
        publicKey: PublicKey.default,
        signTransaction: async (tx) => tx,
        signAllTransactions: async (txs) => txs,
      },
      { commitment: 'confirmed' },
    );
    return new Program(IDL as any, provider) as any; // ✅ cast as any
  }
}
