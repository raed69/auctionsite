
interface Category {
  label: string;
  icon: string;
  href: string;
  active?: boolean;
}

const categories: Category[] = [
  { label: 'Fine Art', icon: 'palette', href: '/categories/fine-art', active: true },
  { label: 'Timepieces', icon: 'watch', href: '/categories/timepieces' },
  { label: 'Jewelry', icon: 'diamond', href: '/categories/jewelry' },
  { label: 'Rare Coins', icon: 'monetization_on', href: '/categories/rare-coins' },
  { label: 'Automobiles', icon: 'directions_car', href: '/categories/automobiles' },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 pt-20 bg-[#f2f4f6] dark:bg-slate-950 font-body font-semibold z-40">
      {/* Header */}
      <div className="px-6 mb-8">
        <h2 className="text-lg font-bold text-[#191c1e]">Categories</h2>
        <p className="text-xs text-outline font-label uppercase tracking-widest mt-1">
          Explore the Collection
        </p>
      </div>

      {/* Category Links */}
      <nav className="flex flex-col">
        {categories.map((cat) => (
          <a
            key={cat.label}
            href={cat.href}
            className={
              cat.active
                ? 'flex items-center gap-3 px-6 py-4 text-primary dark:text-[#4f46e5] bg-white dark:bg-slate-900 rounded-l-xl translate-x-1 duration-200'
                : 'flex items-center gap-3 px-6 py-4 text-[#191c1e] dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800 transition-all'
            }
          >
            <span className="material-symbols-outlined">{cat.icon}</span>
            {cat.label}
          </a>
        ))}
      </nav>

      {/* Quick Filters */}
      <div className="mt-auto px-6 pb-12">
        <div className="p-4 bg-surface-container rounded-xl">
          <h4 className="font-bold text-sm mb-4">Quick Filters</h4>
          <div className="space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-outline-variant text-primary focus:ring-primary"
              />
              <span className="text-sm font-label">Ending Soon</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-outline-variant text-primary focus:ring-primary"
              />
              <span className="text-sm font-label">No Reserve</span>
            </label>
            <div className="pt-2">
              <p className="text-xs font-label text-outline mb-2">Price Range</p>
              <input type="range" className="w-full accent-primary" />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}