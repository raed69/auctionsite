// src/pages/AuctionDetailPage/index.tsx
// Auction detail page. No sidebar — uses full content width.
// Reuses: Navbar (via RootLayout), Footer (via RootLayout).
// Local sub-components: ImageGallery, BiddingBox, BidHistory.

import { useState } from 'react';
import ImageGallery from './ImageGallery';
import BiddingBox from './BiddingBox';
import BidHistory from './BidHistory';

// ─── Mock data — replace with useAuction(id) hook once backend is wired ────────
const IMAGES = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPbCO6bQIynOcOc96Yw-2XC2Mry_yOE-PloUjoeQpS1okZQPUMfdC5PsPOkFl06zNbMiA-9UbWORJgMiddW1xNi0KMcdwMpoRa8E8DzHtdnsAEDBm_IsItUDSGUveNYxf3WvQBUV6U-2H7xZj9Kz5LwpHj-5zmLVsDGm8AtwexxKMvmxxGnr3KVOOi13NiUzgdhZKuATxrxrGb7bDVYfIYXy7_5pkSkjycMRgh13ErZxrgLOFwqp-_RUJbhHKJB4AIVwxQ20eBcQ',
    alt: 'Impressionist oil painting depicting a sunset over a calm river',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJssEugzk19O5-ormi2E3uQ5ZgM156Om7KHRx-q-h1IMCTHIkKLGQPKr8BSasO9n9YvafID8iojtwr2L3LasYsDKQNIembL7_FhYyfMRpvCGn_PgTIi5q4HgweJoj4o6ci_Z1xquVTHlSzF_cUz2adm7ihEYk3iXPap2t8hUdHb87nLPKRgoHfVRDCfVaCtsE2_tSwchYxBIay6gFnN4APMK22uqkLJo-YdfS2sYOz5tsriuc6M9kpgK_jKSXyM8UMe1-9HyCf4g',
    alt: 'Close up macro shot of thick oil paint brushstrokes on canvas',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA36LeNTTc-nF_3Nlbb4gkwCEOP8Lqy5881KyX0c1dHPqWJFRt3QeACKAj69S5X0NFA1xw0b_FSn-FX2qiPwhL3HiVP0qRESZMevz4SjDv8QziZIRfdgfRL8b8C_38ugxC4QLqa1FD5uvzMixtgnoCrOvXUqQDQeVEOvhx0b2I_H2x5SXYG_aWtsyMJxyoykcPEPM5Od9neIJoh4sGVe6hlf5bfEwiHt3RV-qIaMyZtCLMlx-UIOLXNV4w2zutsyB1mMTbDf0ZiKQ',
    alt: 'Side profile view of an ornate gold gilded picture frame',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOisNo3yN65LmTPh5H22vOyBLtvlm1PCHyM7FV0uPipmZpsbeYoPjhTqQtybkMiM8u1UPMPmDe4UAUU7Y-dwAlOK48EUe_pwBX-CGIXL5crjc2mu61HxHRw7O7LMIQHLD4aJHUjnz3fyq9kexhalO7YR65Eaddn1UKLApCppPQqYCll6q-4WpQ2eTE1ZGuvbeI7AIEubgUAtuOXkfk7vYRLStS7QJm27BmBH1Rv5hHuOjrwxLGffwBWT2kz5GWjIrchxOUOzZWhg',
    alt: 'Back of wooden canvas frame with auction house stamps',
  },
];

const BIDS = [
  { bidderId: 'Bidder #7712', amount: 284500, timeAgo: '3 minutes ago', isHighest: true },
  { bidderId: 'Bidder #4092', amount: 280000, timeAgo: '14 minutes ago' },
  { bidderId: 'Bidder #1128', amount: 275500, timeAgo: '1 hour ago' },
  { bidderId: 'Bidder #7712', amount: 270000, timeAgo: '2 hours ago' },
];

const TABS = ['Description', 'Condition Report', 'Provenance', 'Shipping'] as const;
type Tab = (typeof TABS)[number];
// ─────────────────────────────────────────────────────────────────────────────

export default function AuctionDetailPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Description');

  return (
    // No lg:ml-64 — this page has no sidebar in the HTML design
    <main className="pt-28 pb-24 px-8 max-w-7xl mx-auto w-full">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-8 font-label text-sm text-on-surface-variant">
        <a href="/" className="hover:text-primary transition-colors">Fine Art</a>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <a href="/" className="hover:text-primary transition-colors">Impressionism</a>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-on-surface font-semibold">Lot #4421</span>
      </nav>

      {/* ── Top grid: gallery (7) + bidding panel (5) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* Gallery */}
        <div className="lg:col-span-7">
          <ImageGallery images={IMAGES} />
        </div>

        {/* Details + Bidding */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          {/* Title + consignor */}
          <div>
            <h1 className="text-4xl lg:text-5xl font-extrabold font-headline leading-tight text-on-surface mb-4">
              L'Horizon Doré, 1884
            </h1>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-surface-container-high overflow-hidden shrink-0">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIro1sOZ2zSCUC3gdJ5ts_0maBt0Bdz093CEkmoRjVDDAJekHTyETaSaR3IAL6OErsOgMORVI80RjbC9IpYpr5qYOTFW54QcwJ2WxBq1iIGoF10Hcf8fJugGwpPgxads8lrR6EKAgVi0HzFHtm9gXonxI3DyJ73EI6G1EZglr0N3AvT4NYDEQBI4d8MWyDB--F4FCCge5omf1vRTo5GKqAba0ZAWIQuOkr4hIWgXqMB8Vv9ttqEVwEI-k8Vulfi2XGQveXLgY4XQ"
                  alt="Gallery Des Vosges"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-label text-xs text-on-surface-variant font-medium uppercase tracking-widest">
                  Consigned by
                </p>
                <p className="font-body font-bold text-on-surface">Gallery Des Vosges</p>
              </div>
              <div className="ml-auto">
                <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-bold font-label flex items-center gap-1">
                  <span
                    className="material-symbols-outlined text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  AUTHENTICATED
                </span>
              </div>
            </div>
          </div>

          {/* Bidding box */}
          <BiddingBox
            currentBid={284500}
            minimumNextBid={285000}
            reserveMet={true}
            countdown="02h 14m 55s"
            estimate="$300k — $450k"
          />
        </div>
      </div>

      {/* ── Bottom grid: description tabs (8) + bid history (4) ── */}
      <div className="mt-24 grid grid-cols-1 lg:grid-cols-12 gap-16">

        {/* Tabs + content */}
        <div className="lg:col-span-8">
          <div className="flex gap-8 border-b border-surface-container mb-8 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 whitespace-nowrap font-bold font-headline text-lg transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-primary text-on-surface'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'Description' && (
            <div className="text-on-surface-variant font-body leading-relaxed space-y-6">
              <p className="text-lg font-medium text-on-surface">
                A masterwork of the late 19th century,{' '}
                <em className="font-bold">L'Horizon Doré</em> represents the pinnacle of the
                artist's experimentation with atmospheric light and water reflection.
              </p>
              <p>
                The work, executed in the summer of 1884, marks a departure from earlier, more
                structured compositions toward a more fluid, subjective interpretation of the
                natural world. The canvas is thick with impasto in the sky region, creating a
                physical sense of the setting sun's warmth, while the water is rendered with
                delicate, transparent glazes that capture the shifting currents of the Seine.
              </p>
              <ul className="space-y-3 list-none p-0">
                {[
                  "Signed and dated 'G. Durant 84' lower right.",
                  'Oil on canvas, 28.5 x 36 inches (72.4 x 91.4 cm).',
                  'Exhibited at the International Impressionist Survey (Paris, 1889).',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-sm mt-1">
                      check_circle
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {activeTab !== 'Description' && (
            <p className="text-on-surface-variant font-body">
              [{activeTab}] — content coming soon.
            </p>
          )}
        </div>

        {/* Bid history */}
        <div className="lg:col-span-4">
          <BidHistory bids={BIDS} totalCount={24} />
        </div>
      </div>
    </main>
  );
}