/* eslint-disable prettier/prettier */
export interface Bid {
    id?: string;
    auction_id: string;
    bidder_id: string;
    amount: number;
    createdAt?: string;
  }