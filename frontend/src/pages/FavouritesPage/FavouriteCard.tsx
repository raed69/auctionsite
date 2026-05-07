// FavouriteCard.tsx — portrait auction card used only in FavouritesPage.
// Different from AuctionCard: aspect-[4/5], status badge, unfavourite button, "View Details" CTA.
import { useState } from 'react';
import type { Auction } from '../../types/auction';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

function timeLeft(endsAt: Date): string {
  const ms = endsAt.getTime() - Date.now();
  if (ms <= 0) return 'Ended';
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h >= 24 ? `${Math.floor(h / 24)}d ${h % 24}h` : `${h}h ${m}m`;
}

interface Props {
  auction: Auction;
  onUnfavourite: (id: string) => void;
}

export default function FavouriteCard({ auction, onUnfavourite }: Props) {
  const [removing, setRemoving] = useState(false);
  const isEndingSoon = auction.status === 'ending_soon';
  const isLive = auction.status === 'active' && auction.isHotLot;

  const handleUnfavourite = () => {
    setRemoving(true);
    // Small delay so the animation is visible before removal
    setTimeout(() => onUnfavourite(auction.id), 300);
  };

  return (
    <article
      className={`group bg-surface-container-lowest rounded-xl overflow-hidden transition-all duration-300
        hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(25,28,30,0.06)]
        ${removing ? 'opacity-0 scale-95' : 'opacity-100'}`}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-container-low">
        <img
          src={auction.imageUrl}
          alt={auction.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Unfavourite button */}
        <button
          onClick={handleUnfavourite}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center text-tertiary transition-transform active:scale-90"
          aria-label="Remove from favourites"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            favorite
          </span>
        </button>

        {/* Status badge */}
        {isEndingSoon && (
          <div className="absolute bottom-4 left-4">
            <span className="bg-tertiary/10 backdrop-blur-md border border-tertiary/20 text-tertiary font-label text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
              Ending Soon
            </span>
          </div>
        )}
        {isLive && (
          <div className="absolute bottom-4 left-4">
            <span className="bg-secondary/10 backdrop-blur-md border border-secondary/20 text-secondary font-label text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              Live Auction
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-6">
        <span className="font-label text-[10px] uppercase tracking-widest text-outline font-bold mb-1 block">
          {auction.subCategory}
        </span>
        <h3 className="font-headline text-lg font-bold text-on-surface leading-tight mb-4">
          {auction.title}
        </h3>

        <div className="flex items-center justify-between py-4 border-y border-outline-variant/10 mb-6">
          <div>
            <span className="block font-label text-[10px] uppercase tracking-wider text-outline mb-0.5">
              Current Bid
            </span>
            <span className="block font-headline text-xl font-extrabold text-on-surface">
              {fmt(auction.currentBid)}
            </span>
          </div>
          <div className="text-right">
            <span className="block font-label text-[10px] uppercase tracking-wider text-outline mb-0.5">
              Time Left
            </span>
            <span className={`block font-headline text-lg font-semibold ${isEndingSoon ? 'text-tertiary' : 'text-on-surface'}`}>
              {timeLeft(auction.endsAt)}
            </span>
          </div>
        </div>

        <a
          href={`/auctions/${auction.id}`}
          className="block w-full py-3.5 text-center rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold text-sm hover:brightness-110 active:opacity-90 transition-all"
        >
          View Details
        </a>
      </div>
    </article>
  );
}