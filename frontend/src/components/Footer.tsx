// src/components/Footer.tsx
// Dark site-wide footer with logo, legal links, and social icons.

const footerLinks = [
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Auction Rules', href: '/rules' },
  { label: 'Consignment', href: '/consign' },
  { label: 'Contact', href: '/contact' },
];

export default function Footer() {
  return (
    <footer className="w-full py-12 px-8 bg-[#191c1e] dark:bg-black font-label text-xs tracking-tight border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
      {/* Brand */}
      <div className="flex flex-col gap-2">
        <span className="text-xl font-bold text-white font-headline">The Curator</span>
        <p className="text-slate-400">© 2024 The Digital Curator. All rights reserved.</p>
      </div>

      {/* Links */}
      <nav className="flex gap-8">
        {footerLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* Social icons */}
      <div className="flex gap-4">
        {['share', 'public'].map((icon) => (
          <div
            key={icon}
            className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black cursor-pointer transition-all"
          >
            <span className="material-symbols-outlined text-sm">{icon}</span>
          </div>
        ))}
      </div>
    </footer>
  );
}