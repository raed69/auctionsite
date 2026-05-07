// src/pages/HomePage/HeroBanner.tsx
// Full-width hero section shown at the top of the home page.
// Local to HomePage — not shared across other pages.

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD_D9WUYCx9aOW4XyetfXE4IBHacFPktbNm55WVnyeq0wjUOrN3IJk0NuIAPUDXOZ7F6pN6Kq3nHrh7G66uMKl_2x6aOsTDpDUwTxh-0pZu5OHXtY3XKe6kI9_4Wu9Q1kPRazzylLTsAEZLE-y4OkEh82KG48ziNqFA1_Lvh8vDNQxxhcW9tkPRdrp5nniyXedR5i5-z2ljniEn0RhASfxXAoUopytCa9hZwqHCBthGd9Fb1XrCZIq-AOOfd9HySx-hBkt27vocBg';

export default function HeroBanner() {
  return (
    <section className="mb-12 relative h-[420px] rounded-2xl overflow-hidden bg-primary flex items-center">
      <img
        src={HERO_IMAGE}
        alt="Museum gallery with spotlight on a contemporary sculpture"
        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
      />
      <div className="relative z-10 px-16 max-w-2xl">
        <span className="text-secondary-fixed font-label font-bold tracking-[0.2em] uppercase text-sm mb-4 block">
          Summer Invitational 2024
        </span>
        <h1 className="font-headline text-5xl font-extrabold text-white leading-tight mb-6">
          Own a piece of modern history.
        </h1>
        <p className="text-primary-fixed text-lg font-body mb-8">
          Discover curated collections from emerging global artists and legendary archives. Secure
          your legacy today.
        </p>
        <div className="flex gap-4">
          <button className="bg-gradient-to-r from-secondary-fixed to-secondary text-on-secondary-fixed font-bold px-8 py-3 rounded-xl hover:scale-105 transition-transform">
            Browse Auctions
          </button>
          <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold px-8 py-3 rounded-xl hover:bg-white/20 transition-all">
            Start Selling
          </button>
        </div>
      </div>
    </section>
  );
}