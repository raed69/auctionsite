// src/pages/HomePage/ConsignCTA.tsx
// Asymmetric call-to-action section encouraging sellers to consign their items.
// Local to HomePage.

const CTA_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB4k7tG6tewPSByXfN_rxLmfpoVWQ6yseivu_a39HYXTYoInSLUjn6AUzU0H3ssLV1eX6OlHcegbWEO_64G3ve1kyVxmzGPp-xlXi4O3kxx6jRpGLEY9L1HcWenwNZCAHS7ElWNv39tOZDlt7BKvND1CmGF2TO1x0guNTVklJ2kda52qz_dQ4oEqE111yWVZMQB9T1msdB-9ftOLO_i0PYw49XKRI1qeFBe3Cp-ogVbS5GtYwziS8wHlUz9fKUzFy96VTmmgH1pPQ';

export default function ConsignCTA() {
  return (
    <section className="mt-20 mb-20 flex flex-col md:flex-row gap-12 items-center bg-surface-container-low p-12 rounded-3xl overflow-hidden relative">
      {/* Decorative blob */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />

      {/* Copy */}
      <div className="flex-1 z-10">
        <h2 className="font-headline text-4xl font-black mb-6 leading-tight">
          Consign your collection to the world's finest curators.
        </h2>
        <p className="text-on-surface-variant text-lg mb-8 max-w-xl">
          Join a community of prestigious collectors. Our white-glove service handles
          authentication, photography, and global marketing.
        </p>
        <div className="flex gap-6">
          <a
            href="/consign"
            className="font-body font-bold text-primary flex items-center gap-2 group"
          >
            Start Consignment
            <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">
              arrow_forward
            </span>
          </a>
          <a
            href="/consign/fees"
            className="font-body font-bold text-on-surface-variant border-b border-outline-variant"
          >
            Learn about fees
          </a>
        </div>
      </div>

      {/* Image */}
      <div className="flex-1 relative">
        <img
          src={CTA_IMAGE}
          alt="Professional photographer adjusting studio lighting on a rare porcelain vase"
          className="rounded-2xl shadow-2xl scale-110 translate-x-4"
        />
      </div>
    </section>
  );
}