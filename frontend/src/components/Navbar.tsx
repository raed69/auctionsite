import { useState } from 'react';

// Toggle this to simulate logged-in vs logged-out state.
// Replace with `const { user } = useAuth()` once Supabase Auth is wired.
const MOCK_USER = { name: 'Thabet M.', initials: 'TM' };

export default function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 h-16 bg-[#e0e3e5] dark:bg-slate-900 flex justify-between items-center px-8 font-headline font-bold uppercase tracking-wider">
      {/* Logo + Nav Links */}
      <div className="flex items-center gap-12 shrink-0">
        <a href="/" className="text-2xl font-black text-[#191c1e] dark:text-white tracking-tight">
          The Curatorrrr
        </a>
        <nav className="hidden lg:flex gap-8 items-center h-full">
          {[
            { label: 'Auctions', href: '/' },
            { label: 'Categories', href: '/categories' },
            { label: 'Live', href: '/live' },
            { label: 'Archive', href: '/archive' },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[#191c1e] dark:text-slate-300 font-medium hover:text-primary transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Search Bar — grows to fill available space */}
      <div className="flex-1 px-8 hidden md:block">
        <div className="relative flex items-center max-w-xl">
          <input
            type="text"
            placeholder="Search the collection..."
            className="w-full h-10 bg-surface-container-highest rounded-full border-none focus:ring-2 focus:ring-primary px-10 text-on-surface-variant font-label text-sm"
          />
          <span className="material-symbols-outlined absolute left-3 text-on-surface-variant">
            search
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Notifications */}
        <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        {/* Watchlist */}
        <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container">
          <span className="material-symbols-outlined">favorite</span>
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-surface-container transition-colors"
          >
            {/* Avatar circle with initials */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white text-xs font-black font-label">
              {MOCK_USER.initials}
            </div>
            <span className="hidden lg:block text-sm font-bold text-[#191c1e] dark:text-white normal-case tracking-normal">
              {MOCK_USER.name}
            </span>
            <span
              className="material-symbols-outlined text-on-surface-variant text-sm transition-transform duration-200"
              style={{ transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              expand_more
            </span>
          </button>

          {/* Dropdown menu */}
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-surface-container-lowest rounded-2xl shadow-lg border border-outline-variant/20 overflow-hidden z-50 font-label normal-case tracking-normal">
              <div className="px-4 py-3 border-b border-outline-variant/10">
                <p className="text-xs text-on-surface-variant">Signed in as</p>
                <p className="text-sm font-bold text-on-surface truncate">{MOCK_USER.name}</p>
              </div>
              {[
                { icon: 'person', label: 'My Profile', href: '/profile' },
                { icon: 'gavel', label: 'My Bids', href: '/bids' },
                { icon: 'sell', label: 'My Listings', href: '/listings' },
                { icon: 'settings', label: 'Settings', href: '/settings' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '18px' }}>
                    {item.icon}
                  </span>
                  {item.label}
                </a>
              ))}
              <div className="border-t border-outline-variant/10">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-tertiary hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}