interface BidEntry {
  bidderId: string;
  amount: number;
  timeAgo: string;
  isHighest?: boolean;
}

interface BidHistoryProps {
  bids: BidEntry[];
  totalCount: number;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export default function BidHistory({ bids, totalCount }: BidHistoryProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h4 className="font-headline font-bold text-xl">Bid History</h4>
        <span className="bg-surface-container-high px-3 py-1 rounded-full font-label text-xs font-bold">
          {totalCount} Bids
        </span>
      </div>

      <div className="flex flex-col gap-0.5 rounded-2xl overflow-hidden bg-surface-container-high">
        {bids.map((bid, i) => (
          <div
            key={i}
            className={`flex justify-between items-center px-6 py-4 ${
              bid.isHighest ? 'bg-secondary/5' : i % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface-container-low'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-2 h-2 rounded-full ${
                  bid.isHighest ? 'bg-secondary' : 'bg-outline-variant opacity-30'
                }`}
              />
              <div>
                <p className={`font-body text-on-surface ${bid.isHighest ? 'font-bold' : 'font-medium'}`}>
                  {bid.bidderId}
                </p>
                <p className="font-label text-[10px] text-on-surface-variant uppercase">
                  {bid.timeAgo}
                </p>
              </div>
            </div>
            <p className={`font-headline font-bold text-lg ${bid.isHighest ? 'text-secondary' : 'text-on-surface'}`}>
              {formatCurrency(bid.amount)}
            </p>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 text-primary font-label font-bold py-3 hover:bg-primary/5 rounded-xl transition-colors">
        View Complete Bid Log
      </button>
    </div>
  );
}