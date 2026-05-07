// TipsSidebar.tsx — static right sidebar with tips, concierge CTA, and photography service card
export default function TipsSidebar() {
  const tips = [
    { icon: 'lightbulb', title: 'Photography is King', body: 'Items with 10+ high-res images see 40% higher final bids. Focus on micro-details and textures.' },
    { icon: 'history_edu', title: 'Tell the Story', body: "Describe the provenance. Who owned it? Where has it been? Collectors buy the history as much as the object." },
    { icon: 'timer', title: 'Timing Matters', body: 'Ending an auction on a Sunday evening (EST/GMT) typically captures the highest traffic volume.' },
  ];

  return (
    <aside className="w-full lg:w-80 space-y-8 pt-8 shrink-0">
      {/* Expert tips */}
      <div className="p-8 bg-surface-container-lowest border border-outline-variant/10 rounded-2xl shadow-sm">
        <h3 className="font-headline font-bold text-lg mb-6">Expert Curator Tips</h3>
        <div className="space-y-8">
          {tips.map((tip) => (
            <div key={tip.title} className="flex gap-4">
              <span className="material-symbols-outlined text-primary shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                {tip.icon}
              </span>
              <div>
                <p className="font-headline font-bold text-sm mb-1">{tip.title}</p>
                <p className="text-xs font-body text-on-surface-variant leading-relaxed">{tip.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Concierge CTA */}
      <div className="p-8 bg-inverse-surface text-inverse-on-surface rounded-2xl">
        <h3 className="font-headline font-bold text-lg mb-4">Need Help?</h3>
        <p className="text-sm font-body opacity-80 mb-6 leading-relaxed">
          Our senior appraisers are available 24/7 to assist with valuing your collection.
        </p>
        <button className="w-full py-3 bg-white text-on-surface font-headline font-bold rounded-xl text-sm hover:bg-slate-100 transition-all">
          Chat with Concierge
        </button>
      </div>

      {/* Photography service */}
      <div className="p-8 bg-surface-container-low rounded-2xl">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDs1SK6Kj_fcakWkAS6aTJ4IGF5QVRnR3Tp1_xyJFSwQwRP_GdLkSdo_cjbBvCy-PpzB5XUdtQi3a7bTVrG_kETrgrjBjQhJj-c-oIcqsDRsby_ZrSFSNwHFYI6dgp9FuTGCbH2VSXEfLR0emKF5BZPD_AQu4bs3nnZsr_geibVaiUcpFvxKmkrjAWLXgBtqfwlvvRS8TQJHu4Hx_AYMD3AQqxHdjZx5WaHPrr-AqHTcZreOy5ailfNF6FHSalSNkA-wPmxQajslg"
          alt="Professional photography setup"
          className="w-full h-48 object-cover rounded-xl mb-4 grayscale"
        />
        <p className="text-xs font-label uppercase tracking-widest text-primary font-bold mb-2">Service</p>
        <p className="font-headline font-bold text-sm mb-2">Professional Imaging</p>
        <p className="text-xs font-body text-on-surface-variant mb-4">
          Don't have a camera? Request a mobile photography team to your location.
        </p>
        <a href="#" className="text-primary font-bold text-xs font-label underline underline-offset-4">
          Learn More
        </a>
      </div>
    </aside>
  );
}
