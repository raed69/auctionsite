// src/pages/AuctionDetailPage/BiddingBox.tsx
// The main interaction card: current bid, countdown timer, bid input, place bid CTA.
// Local to AuctionDetailPage — not shared.

import { useState } from 'react';

interface BiddingBoxProps {
  currentBid: number;
  minimumNextBid: number;
  reserveMet: boolean;
  countdown: string; // e.g. "02h 14m 55s"
  estimate: string;  // e.g. "$300k — $450k"
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export default function BiddingBox({ currentBid, minimumNextBid, reserveMet, countdown, estimate }: BiddingBoxProps) {
  const [bidAmount, setBidAmount] = useState('');

  return (
    <div className="bg-surface-container-low rounded-2xl p-8 flex flex-col gap-6 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Current bid + countdown */}
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="font-label text-xs text-on-surface-variant font-medium uppercase tracking-widest mb-1">
            Current Bid
          </p>
          <h2 className="text-4xl font-bold font-headline text-on-surface">
            {formatCurrency(currentBid)}
          </h2>
          {reserveMet && (
            <p className="font-label text-sm text-secondary font-semibold mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">trending_up</span>
              Reserve Met
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="font-label text-xs text-tertiary font-bold uppercase tracking-widest mb-1 flex items-center justify-end gap-1">
            <span className="material-symbols-outlined text-xs">schedule</span>
            ENDS SOON
          </p>
          <h3 className="text-2xl font-bold font-headline text-tertiary">{countdown}</h3>
        </div>
      </div>

      {/* Bid input */}
      <div className="bg-surface-container-lowest rounded-xl p-6 flex flex-col gap-4 relative z-10">
        <div className="flex justify-between items-center text-sm font-label">
          <span className="text-on-surface-variant">Minimum next bid:</span>
          <span className="font-bold text-on-surface">{formatCurrency(minimumNextBid)}</span>
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">$</span>
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder="Enter bid amount"
            className="w-full bg-surface-container-low border-none rounded-xl pl-8 pr-4 py-4 focus:ring-2 focus:ring-primary/20 font-label font-bold text-lg"
          />
        </div>
        <button className="w-full bg-gradient-to-r from-primary to-primary-container text-white py-4 rounded-xl font-bold text-lg font-headline transition-all hover:opacity-90 active:scale-95 shadow-lg shadow-primary/20">
          Place Your Bid
        </button>
        <p className="text-center text-xs text-on-surface-variant font-label">
          By bidding, you agree to our{' '}
          <a href="/terms" className="underline">Terms &amp; Conditions</a>.
        </p>
      </div>

      {/* Watch + Share */}
      <div className="flex items-center justify-center gap-8 relative z-10">
        <button className="flex items-center gap-2 text-on-surface font-label font-semibold transition-all hover:text-primary">
          <span className="material-symbols-outlined text-lg">favorite</span>
          Watch Item
        </button>
        <button className="flex items-center gap-2 text-on-surface font-label font-semibold transition-all hover:text-primary">
          <span className="material-symbols-outlined text-lg">share</span>
          Share Lot
        </button>
      </div>

      {/* Meta pills */}
      <div className="grid grid-cols-2 gap-4 relative z-10">
        <div className="p-4 bg-surface-container-lowest border border-outline-variant/10 rounded-xl">
          <p className="font-label text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em] mb-1">
            Estimate
          </p>
          <p className="font-body font-bold text-on-surface">{estimate}</p>
        </div>
        <div className="p-4 bg-surface-container-lowest border border-outline-variant/10 rounded-xl">
          <p className="font-label text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em] mb-1">
            Lot Status
          </p>
          <p className="font-body font-bold text-secondary">Active Auction</p>
        </div>
      </div>
    </div>
  );
}