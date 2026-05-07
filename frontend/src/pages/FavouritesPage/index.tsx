import { useState, useMemo } from 'react';
import type { Auction } from '../../types/auction';
import FavouriteCard from './FavouriteCard';
 
const PAGE_SIZE = 8;
 
const MOCK_FAVOURITES: Auction[] = [
  {
    id: '1', title: '1964 Vintage Rolex Daytona', description: 'Iconic chronograph in near-mint condition.',
    category: 'Timepieces', subCategory: 'Horology', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCqiMiznTcNfcZ9iykfhM6dd_buSjTKZ0kxOs2DIvY9BTVOgfug92vYP8X3FlY8L5XonSZv-LQ_1aJFCBS-IWKCJ2f5XP4HPDcXBdIaFBkvmcblQ2RgnHls7UXM1xcibahEaPL9Cus6idF7-y9ef0mWp_2AQ4ZWLHjMfUF4v2LDfMfYpp8sGTEnciNS5llGKttTtEy-U0wqhqVmNw32jNszsQ1EZaRtG4EuxywaSgN1XfXxA5qh1zn3cRvU9kz3TA0evm1Y5qGlsw',
    currentBid: 15200, startingBid: 10000, bidCount: 12, bidderCount: 8,
    status: 'ending_soon', endsAt: new Date(Date.now() + 2.25 * 3_600_000),
    hasReserve: true, isHotLot: false, sellerId: 's1',
  },
  {
    id: '2', title: 'Azure Equilibrium #4', description: 'Abstract expressionist oil on canvas.',
    category: 'Fine Art', subCategory: 'Contemporary Art', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVPNFsGWOM59cfQr46tesXgFNmQYS9lT9SSq0VbSxk1-y9P-prvEGunJS000E-B4FMq7SxdCNxtXD6r2S9nSR08yYu_yG2YOOsAAj1hV4EJ6nkMSLAgJuLLebK2HBuQpB9PUvGwKWeD4twlayM-WdE5koVMUbqREh8jaZaaWjyVu8EYmVOmXBy4L05Qb8q-HAjwrHMZ6hgT-CGO4xsuztt0wC4c7mxZQF4vs5wuKkLi2UrXmllJE21Erq3fKNfaDsTsPYgO_pba8g',
    currentBid: 8450, startingBid: 5000, bidCount: 6, bidderCount: 4,
    status: 'active', endsAt: new Date(Date.now() + 28 * 3_600_000),
    hasReserve: true, isHotLot: false, sellerId: 's2',
  },
  {
    id: '3', title: '1956 Original Eames Lounge', description: 'First-run production with walnut shell.',
    category: 'Fine Art', subCategory: 'Design Classics', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAb3P0mZZQxRDU6s3GB3WM_s76pHDz2yy1h6y-hETZCDTNQsuaTT0_9Q_0uOzmIbeRnXMTGPaTW4xBt6mTEJ5b_tJE-eYNsem_ayQvoqRFftzKyy9lIgmH20S4pku0u3dTtpzUZnIF4OGikYDRzFTbvaUGtrKsZAESxLi82bp3X0ajad1DXgiSnf3Gxlf7t12txGdVfrwQn77wjYKCHAocNpWkPh34IpVl7tkQXC-Wvx5JJMg3Iy9lXl6OwCXd_8DxvDeATm6cENg',
    currentBid: 12000, startingBid: 8000, bidCount: 9, bidderCount: 7,
    status: 'active', endsAt: new Date(Date.now() + 5.5 * 3_600_000),
    hasReserve: true, isHotLot: false, sellerId: 's3',
  },
  {
    id: '4', title: '1962 Ferrari 250 GTO', description: 'One of 36 ever built. Matching numbers.',
    category: 'Automobiles', subCategory: 'Automotive', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlp0UQgziGwJZlpOFZr2fuZXWvNJZUT7l5maQ5ZKcA81Xas0APp-NLuzHzcIoQnNLhZNClSks6hUrgNgy1pzimyyf84jF1Y_hocUB5XsrAHTvUZSlXoXSfzIAkLo1BlS5TF2fnZ6l8yhmSNdd8dGqY3JeXiR_qTXL7ECBb-PIq_q71gH5m7sbo2I7Hp8H15K5lM5L4VEKchg4xcd24HJFHLyYkEdJMCQxp9TXto0KMS3uAwKgA5iVtEiO9N2nFpqjaCgUpxx8ZoA',
    currentBid: 2_100_000, startingBid: 1_500_000, bidCount: 24, bidderCount: 11,
    status: 'active', endsAt: new Date(Date.now() + 84 * 3_600_000),
    hasReserve: true, isHotLot: true, sellerId: 's4',
  },
  {
    id: '5', title: 'Great Gatsby 1st Edition', description: "Scribner's 1925, near fine dust jacket.",
    category: 'Fine Art', subCategory: 'Literature', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFT6OGuNAHwT5GiLGWWZ3YSXVoM-UealEyPcLJRCp4lInIiIVMqjlnHX6J5lKBM7LEtkl-ftbZ5MCQelcwlmFyBH_NSj5WVUutiahBDam72X4WYQS__FLqLOMA6h2smbAKlSCK1EWtoMmpr0ip0kD0xtMN4NmlVU4v__gg6bq9nwK2AgGwLQaFTp4xmw6ETk1YQp__lXr-rOeL8LdqTvccdEvfy2SkUOACmoX-DlNjeNuxtYfZyFYMeloUECxbIkD6KOo0XZI-Jw',
    currentBid: 3200, startingBid: 2000, bidCount: 5, bidderCount: 4,
    status: 'ending_soon', endsAt: new Date(Date.now() + 4.75 * 3_600_000),
    hasReserve: true, isHotLot: false, sellerId: 's5',
  },
  {
    id: '6', title: "Air Jordan 1 'Sample' 1985", description: 'Pre-production sample, one of a kind.',
    category: 'Fine Art', subCategory: 'Collectibles', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBm_jAAdYwJiy3uov5avyWAVV-masUTn86aK3hFhnYdXyOEobM_4HXM73Z873wiAUZaGby2GASgYA6v_t-6M4lYezqIjwYE0yX_JOZfVAuhifgm3CRZJ3oSPL69WpRGGWFgBSP9EDep6ehE-fz2xJJ43HJqLXTeWyIcKHfa3C_DjA6hrE9g9cv2PeAsHxm0jppnh_y76u5FYCb0SLId__0JWlTrmKcWMOiZpiN-GWwf7Jnk5BF1TP53QN_OvrCOkyF4kw0JEhqnKA',
    currentBid: 45000, startingBid: 30000, bidCount: 18, bidderCount: 13,
    status: 'ending_soon', endsAt: new Date(Date.now() + 1.17 * 3_600_000),
    hasReserve: true, isHotLot: false, sellerId: 's6',
  },
  {
    id: '7', title: 'Leica M3 Single Stroke', description: 'First production run 1954, clean glass.',
    category: 'Timepieces', subCategory: 'Photography', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9D8mpnh8qnsJxqT9KMxadtdW2eYgKf5W8QTtHkxascC4naxKc07puIGAkpsP0USazkb07uTNqaew-kB08uLK7NVuMoEx2OVxUnQk0FEy0H92KWO8F2L6UQDn6YAt9mbaS3WDMrXTx3TgZefyYmHk9JW9HHTrd2w32NW-nYS_jApAd_zVVa0zfEzin-eg7nJ2Fu7InuXCFCcw9m26CzM91lmmEoEJ8drOveX0ZEjUjKBE6pwZjEa7BoZ6aWTRZTCFru9tm-hO3kg',
    currentBid: 2400, startingBid: 1500, bidCount: 4, bidderCount: 3,
    status: 'active', endsAt: new Date(Date.now() + 66 * 3_600_000),
    hasReserve: true, isHotLot: false, sellerId: 's7',
  },
  {
    id: '8', title: '1.2ct Ocean Blue Diamond', description: 'VS1 clarity, GIA certified, cushion cut.',
    category: 'Jewelry', subCategory: 'Jewelry', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBduyINKwfEmtkutPIkLEyOKAdx6kg4XTjNzH4qbaHapQWjyOfOcN0kUh8vLOb_hEJJidh5pV50Q0LHEegQvaJ5nYc6qnnIGwBbLvgW4iXX19gXhf9_TJihvVfNVO8rrnCIprywqYGOj57T4wCOKfxt43cQW_RQLjpFfCBXSveUaOMHAtTJKLhxiNkGheiPM8mUiiVdLS8rM4cJ72qoFOREfqiPAi68r6XmsOaugkJOplOE1OChBgoRX2jOLOwcmpEJ-sxFV1l-vg',
    currentBid: 18700, startingBid: 12000, bidCount: 11, bidderCount: 8,
    status: 'active', endsAt: new Date(Date.now() + 6.25 * 3_600_000),
    hasReserve: true, isHotLot: false, sellerId: 's8',
  },
];
 
export default function FavouritesPage() {
  const [favourites, setFavourites] = useState<Auction[]>(MOCK_FAVOURITES);
  const [visible, setVisible] = useState(PAGE_SIZE);
 
  const remove = (id: string) =>
    setFavourites((prev) => prev.filter((a) => a.id !== id));
 
  // Total value derived from current bids — recalculates only when favourites change
  const totalValue = useMemo(
    () => favourites.reduce((sum, a) => sum + a.currentBid, 0),
    [favourites],
  );
 
  const shown = favourites.slice(0, visible);
  const hasMore = visible < favourites.length;
 
  return (
    <main className="max-w-[1440px] mx-auto px-8 py-16 w-full">
 
      {/* ── Stats header ── */}
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="font-label text-sm uppercase tracking-[0.2em] text-outline font-semibold mb-2 block">
            Personal Collection
          </span>
          <h1 className="font-headline text-5xl font-extrabold text-on-surface tracking-tight">
            My Favourites
          </h1>
        </div>
 
        <div className="flex gap-12 items-center bg-surface-container-low px-8 py-6 rounded-xl">
          <div className="text-center">
            <span className="block font-headline text-2xl font-bold text-primary">
              {String(favourites.length).padStart(2, '0')}
            </span>
            <span className="font-label text-xs uppercase tracking-wider text-outline">Saved Items</span>
          </div>
          <div className="w-px h-8 bg-outline-variant/30" />
          <div className="text-center">
            <span className="block font-headline text-2xl font-bold text-secondary">
              ${(totalValue / 1000).toFixed(1)}k
            </span>
            <span className="font-label text-xs uppercase tracking-wider text-outline">Total Value</span>
          </div>
        </div>
      </header>
 
      {/* ── Grid ── */}
      {favourites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
          <span className="material-symbols-outlined text-6xl text-outline/30">favorite</span>
          <p className="font-headline text-2xl font-bold text-on-surface">No favourites yet</p>
          <p className="text-on-surface-variant font-body text-sm">
            Browse auctions and tap the heart icon to save items here.
          </p>
          <a href="/" className="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold text-sm">
            Browse Auctions
          </a>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
          {shown.map((auction) => (
            <FavouriteCard key={auction.id} auction={auction} onUnfavourite={remove} />
          ))}
        </section>
      )}
 
      {/* ── Load more ── */}
      {hasMore && (
        <div className="mt-20 flex justify-center">
          <button
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="px-12 py-4 rounded-full border border-outline-variant/30 text-on-surface font-headline font-bold text-sm hover:bg-surface-container-high transition-all flex items-center gap-3"
          >
            Load More Items
            <span className="material-symbols-outlined">expand_more</span>
          </button>
        </div>
      )}
    </main>
  );
}