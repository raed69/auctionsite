export type AuctionStatus = 'active' | 'ending_soon' | 'closed' | 'upcoming';
export type AuctionCategory =
  | 'Fine Art'
  | 'Timepieces'
  | 'Jewelry'
  | 'Rare Coins'
  | 'Automobiles';
export type AuctionDuration = '3 Days' | '5 Days' | '7 Days' | '14 Days' | 'Private Sale (No Timer)';
export type ConditionGrade = 'Mint (As New)' | 'Excellent' | 'Good (Shows Wear)' | 'Restored' | 'Fair (Functional)';

export interface Auction {
  id: string;
  title: string;
  description: string;
  category: AuctionCategory;
  subCategory: string;
  imageUrl: string;
  currentBid: number;
  startingBid: number;
  bidCount: number;
  bidderCount: number;
  status: AuctionStatus;
  endsAt: Date;
  hasReserve: boolean;
  isHotLot: boolean;
  sellerId: string;
}

export interface CreateAuctionDTO {
  title: string;
  description: string;
  category: AuctionCategory;
  provenance: string;
  reservePrice: number | '';
  startingBid: number | '';
  duration: AuctionDuration;
  startDate: string;
  conditionGrade: ConditionGrade;
  location: string;
  imageUrls: string[];
}