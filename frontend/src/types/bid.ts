export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  amount: number;
  placedAt: Date;
}

export interface PlaceBidDTO {
  auctionId: string;
  amount: number;
}
