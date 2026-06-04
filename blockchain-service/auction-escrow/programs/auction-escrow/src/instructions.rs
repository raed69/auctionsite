use anchor_lang::prelude::*;
use crate::state::Escrow;  // Ensure the Escrow struct is properly imported

#[derive(Accounts)]
pub struct PlaceBid<'info> {
    #[account(mut)]
    pub escrow_account: Account<'info, Escrow>,  // Escrow account to hold the bid
    #[account(mut)]
    pub bidder: Signer<'info>,                   // The bidder
    pub system_program: Program<'info, System>,  // System program to handle transfers
}

pub fn place_bid(ctx: Context<PlaceBid>, bid_amount: u64) -> ProgramResult {
    let escrow_account = &mut ctx.accounts.escrow_account;
    let bidder = &ctx.accounts.bidder;

    // Refund previous bidder if necessary
    if escrow_account.bid_amount > 0 && escrow_account.bidder != bidder.key() {
        let refund_ix = anchor_lang::solana_program::system_instruction::transfer(
            &escrow_account.bidder,
            &bidder.key(),
            escrow_account.bid_amount,
        );
        anchor_lang::solana_program::program::invoke(
            &refund_ix,
            &[ctx.accounts.escrow_account.to_account_info(), bidder.to_account_info()],
        )?;
    }

    // Update the escrow account with the new bid amount and bidder info
    escrow_account.bid_amount = bid_amount;
    escrow_account.bidder = bidder.key();

    Ok(())
}