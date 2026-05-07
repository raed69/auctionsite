// src/pages/HomePage/index.tsx
// Home page entry point.
// Composes: HeroBanner → FeaturedSection → ConsignCTA
// The surrounding layout (Navbar + Sidebar + Footer) lives in AppRouter.

import HeroBanner from './HeroBanner';
import FeaturedSection from './FeaturedSection';
import ConsignCTA from './ConsignCTA';

export default function HomePage() {
  return (
    <main className="flex-1 lg:ml-64 p-8">
      <HeroBanner />
      <FeaturedSection />
      <ConsignCTA />
    </main>
  );
}