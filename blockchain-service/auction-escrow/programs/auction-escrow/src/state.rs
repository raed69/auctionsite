use anchor_lang::prelude::*;

// Define the Escrow struct for storing bid information and bidder details
#[account]
pub struct Escrow {
    pub bid_amount: u64,     // The amount held in escrow
    pub bidder: Pubkey,      // The public key of the current highest bidder
    pub auction_status: u8,  // Auction status (0: running, 1: closed)
}

impl Escrow {
    pub const LEN: usize = 8 + 8 + 32 + 1; // size for bid_amount + bidder + auction_status
}