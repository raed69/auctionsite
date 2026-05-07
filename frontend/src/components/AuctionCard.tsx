import { type Auction } from '../types/auction';

interface AuctionCardProps {
  auction: Auction;
  variant?: 'featured' | 'standard';
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

// --- Featured (large) card ---
function FeaturedCard({ auction }: { auction: Auction }) {
  return (
    <article className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-2xl overflow-hidden group editorial-shadow transition-all">
      <div className="flex flex-col md:flex-row h-full">
        {/* Image */}
        <div className="md:w-1/2 relative overflow-hidden">
          <img
            src={auction.imageUrl}
            alt={auction.title}
            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          {auction.status === 'ending_soon' && (
            <div className="absolute top-4 left-4 bg-tertiary-container/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-label font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">alarm</span>
              02:14:55
            </div>
          )}
        </div>

        {/* Details */}
        <div className="md:w-1/2 p-8 flex flex-col justify-between">
          <div>
            <span className="text-xs font-label text-outline uppercase tracking-widest block mb-2">
              {auction.category} • {auction.subCategory}
            </span>
            <h3 className="font-headline text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
              {auction.title}
            </h3>
            <p className="text-on-surface-variant text-sm line-clamp-2 mb-6">
              {auction.description}
            </p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-label text-outline">Current Bid</span>
              <span className="text-xs font-label text-outline">Bidders</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-headline text-3xl font-black text-on-surface">
                {formatCurrency(auction.currentBid)}
              </span>
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-white" />
                <div className="w-8 h-8 rounded-full bg-primary-container border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                  +{auction.bidderCount}
                </div>
              </div>
            </div>
          </div>
          <button className="mt-8 w-full bg-gradient-to-r from-primary to-primary-container text-white py-4 rounded-xl font-bold text-lg hover:brightness-110 active:scale-[0.98] transition-all">
            Place Bid
          </button>
        </div>
      </div>
    </article>
  );
}

// --- Standard card ---
function StandardCard({ auction }: { auction: Auction }) {
  const isEndingSoon = auction.status === 'ending_soon';

  return (
    <article className="col-span-12 md:col-span-6 lg:col-span-4 bg-surface-container-lowest rounded-2xl overflow-hidden group editorial-shadow transition-all">
      {/* Image */}
      <div className="aspect-square relative overflow-hidden">
        <img
          src={auction.imageUrl}
          alt={auction.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />

        {/* Hover description overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
          <p className="text-white text-xs font-label">{auction.description}</p>
        </div>

        {/* Badges */}
        {!auction.hasReserve && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-primary">
            NO RESERVE
          </div>
        )}
        {auction.isHotLot && (
          <div className="absolute bottom-4 left-4 bg-tertiary text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
            Hot Lot
          </div>
        )}

        {/* Favourite button */}
        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-2 rounded-full cursor-pointer hover:bg-white transition-all shadow-sm">
          <span
            className="material-symbols-outlined text-tertiary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            favorite
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <span className="text-[10px] font-label text-outline uppercase tracking-widest block mb-1">
          {auction.category} • {auction.subCategory}
        </span>
        <h3 className="font-headline text-lg font-bold mb-4 line-clamp-1">{auction.title}</h3>

        <div className="flex items-end justify-between">
          <div>
            <span
              className={`text-[10px] font-label block ${isEndingSoon ? 'text-tertiary font-bold' : 'text-outline'}`}
            >
              Current Bid
            </span>
            <span
              className={`font-headline text-xl font-bold ${isEndingSoon ? 'text-tertiary' : ''}`}
            >
              {formatCurrency(auction.currentBid)}
            </span>
          </div>
          <div className="text-right">
            <span
              className={`text-[10px] font-label block ${isEndingSoon ? 'text-tertiary' : 'text-outline'}`}
            >
              {isEndingSoon ? 'Closes In' : 'Remaining'}
            </span>
            <span
              className={`text-sm font-bold font-label ${isEndingSoon ? 'text-tertiary' : ''}`}
            >
              {isEndingSoon ? '42m 12s' : '4 Days'}
            </span>
          </div>
        </div>

        {isEndingSoon ? (
          <button className="mt-6 w-full bg-gradient-to-r from-primary to-primary-container text-white py-3 rounded-xl font-bold text-sm shadow-sm">
            Quick Bid
          </button>
        ) : (
          <button className="mt-6 w-full py-3 rounded-xl border border-outline-variant font-bold text-sm text-on-surface hover:bg-surface-container transition-all">
            View Details
          </button>
        )}
      </div>
    </article>
  );
}

// --- Public export ---
export default function AuctionCard({ auction, variant = 'standard' }: AuctionCardProps) {
  if (variant === 'featured') return <FeaturedCard auction={auction} />;
  return <StandardCard auction={auction} />;
}