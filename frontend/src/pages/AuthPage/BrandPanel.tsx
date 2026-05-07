// BrandPanel.tsx — left visual panel for auth pages (sign up & login)
// Accepts a quote prop so each page can customise the copy.

interface Props {
  quote: string;
  sub: string;
}

const IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAZZIAB0ZQS6ViJ2i8IDlxxudQXgkOnhWE53LoGP2tTv_0SdNig61_hui2k6fxJntuNFhFWx8v3QEUXNhMAYhWCPbnQYqcEL4fOrApPFCyw1ob1DLFZa7OSDjI3JavduefCN_LVUkfIDkmcJYq0769xzzYUeeuJ6Gq4Wk1okQbCJwkSmGDMg8k5Z8pZ8lKcAhbVePBEhSy9uJ4CuvaZBcmAAzQbQE2_PZo5pikOdcTzYBtCgGMQDiCaudPOTEcMNnqzrZ5U8Max-w';

export default function BrandPanel({ quote, sub }: Props) {
  return (
    <div className="hidden md:block relative overflow-hidden bg-primary min-h-[680px]">
      <img src={IMAGE} alt="Abstract art" className="absolute inset-0 w-full h-full object-cover opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary to-transparent opacity-60" />
      <div className="relative h-full flex flex-col justify-end p-12 text-white">
        <span className="font-label text-xs tracking-[0.2em] uppercase text-primary-fixed mb-6">
          The Premier Destination
        </span>
        <h2 className="text-4xl font-extrabold leading-tight mb-4 font-headline tracking-tight">
          {quote}
        </h2>
        <p className="text-primary-fixed-dim text-lg font-body max-w-sm">{sub}</p>
      </div>
    </div>
  );
}
