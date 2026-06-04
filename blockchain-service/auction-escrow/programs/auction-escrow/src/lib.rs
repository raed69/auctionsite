use anchor_lang::prelude::*;

declare_id!("7x3UJv4wHouZpPDJ6Mf6KQBgGCiPuFN9oF1dziuMx6y8");

#[program]
pub mod auction_escrow {
    use super::*;

    pub fn create_auction(
        ctx: Context<CreateAuction>,
        auction_id: String,
        min_bid: u64,
        end_time: i64,
    ) -> Result<()> {
        let auction = &mut ctx.accounts.auction;
        auction.seller = ctx.accounts.seller.key();
        auction.auction_id = auction_id;
        auction.min_bid = min_bid;
        auction.highest_bid = 0;
        auction.highest_bidder = Pubkey::default();
        auction.end_time = end_time;
        auction.is_closed = false;
        Ok(())
    }

    pub fn place_bid(
        ctx: Context<PlaceBid>,
        bid_amount: u64,
    ) -> Result<()> {
        let auction = &mut ctx.accounts.auction;
        let clock = Clock::get()?;

        require!(!auction.is_closed, AuctionError::AuctionClosed);
        require!(clock.unix_timestamp < auction.end_time, AuctionError::AuctionEnded);
        require!(bid_amount > auction.highest_bid, AuctionError::BidTooLow);
        require!(bid_amount >= auction.min_bid, AuctionError::BidTooLow);

        if auction.highest_bid > 0 {
            **ctx.accounts.escrow.to_account_info().try_borrow_mut_lamports()? -= auction.highest_bid;
            **ctx.accounts.previous_bidder.to_account_info().try_borrow_mut_lamports()? += auction.highest_bid;
        }

        let transfer = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.bidder.key(),
            &ctx.accounts.escrow.key(),
            bid_amount,
        );
        anchor_lang::solana_program::program::invoke(
            &transfer,
            &[
                ctx.accounts.bidder.to_account_info(),
                ctx.accounts.escrow.to_account_info(),
            ],
        )?;

        auction.highest_bid = bid_amount;
        auction.highest_bidder = ctx.accounts.bidder.key();
        Ok(())
    }

    pub fn close_auction(ctx: Context<CloseAuction>) -> Result<()> {
        let auction = &mut ctx.accounts.auction;
        let clock = Clock::get()?;

        require!(ctx.accounts.seller.key() == auction.seller, AuctionError::Unauthorized);
        require!(clock.unix_timestamp >= auction.end_time, AuctionError::AuctionNotEnded);
        require!(!auction.is_closed, AuctionError::AuctionClosed);

        if auction.highest_bid > 0 {
            **ctx.accounts.escrow.to_account_info().try_borrow_mut_lamports()? -= auction.highest_bid;
            **ctx.accounts.seller.to_account_info().try_borrow_mut_lamports()? += auction.highest_bid;
        }

        auction.is_closed = true;
        Ok(())
    }
}

#[account]
pub struct Auction {
    pub seller: Pubkey,
    pub auction_id: String,
    pub min_bid: u64,
    pub highest_bid: u64,
    pub highest_bidder: Pubkey,
    pub end_time: i64,
    pub is_closed: bool,
}

#[derive(Accounts)]
#[instruction(auction_id: String)]
pub struct CreateAuction<'info> {
    #[account(
        init,
        payer = seller,
        space = 8 + 32 + 64 + 8 + 8 + 32 + 8 + 1,
        seeds = [b"auction", auction_id.as_bytes()],
        bump
    )]
    pub auction: Account<'info, Auction>,
    #[account(mut)]
    pub seller: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlaceBid<'info> {
    #[account(mut)]
    pub auction: Account<'info, Auction>,
    #[account(mut)]
    pub bidder: Signer<'info>,
    /// CHECK: previous bidder wallet for refund
    #[account(mut)]
    pub previous_bidder: AccountInfo<'info>,
    /// CHECK: escrow account holds funds
    #[account(mut)]
    pub escrow: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseAuction<'info> {
    #[account(mut)]
    pub auction: Account<'info, Auction>,
    #[account(mut)]
    pub seller: Signer<'info>,
    /// CHECK: escrow account
    #[account(mut)]
    pub escrow: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum AuctionError {
    #[msg("Auction is already closed")]
    AuctionClosed,
    #[msg("Auction has not ended yet")]
    AuctionNotEnded,
    #[msg("Auction has already ended")]
    AuctionEnded,
    #[msg("Bid amount is too low")]
    BidTooLow,
    #[msg("Unauthorized action")]
    Unauthorized,
}