import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

// -- Data ----------------------------------------------------------------------

const TRENDING_ITEMS = [
  'Fortnite Accounts',
  'OSRS Gold',
  'Valorant Accounts',
  'WoW Gold',
  'Roblox Robux',
  'Rocket League Items',
  'Genshin Accounts',
  'LoL Accounts',
  'CS2 Skins',
  'Diablo IV Gold',
];

const LIVE_STATS = [
  { value: 2000000, label: 'Paid to Sellers', prefix: '$', suffix: '+' },
  { value: 50000, label: 'Active Sellers', suffix: '+' },
  { value: 200, label: 'Games Supported', suffix: '+' },
  { value: 4.9, label: 'Avg Rating', suffix: '★', decimals: 1 },
];

const POPULAR_ACCOUNTS = [
  { name: 'Grand Theft Auto 5', color: '#1a6b3a', letter: 'G' },
  { name: 'Fortnite', color: '#1a5fa8', letter: 'F' },
  { name: 'Valorant', color: '#b8001f', letter: 'V' },
  { name: 'Rainbow Six Siege X', color: '#2a2a2a', letter: 'R' },
  { name: 'Roblox', color: '#cc0000', letter: 'R' },
  { name: 'Adopt Me', color: '#f5a623', letter: 'A' },
  { name: 'Call of Duty', color: '#1a1a1a', letter: 'C' },
  { name: 'Rocket League', color: '#003d8f', letter: 'RL' },
  { name: 'Old School RuneScape', color: '#8b2f2f', letter: 'OS' },
  { name: 'League of Legends', color: '#0bc4e3', letter: 'L' },
];

const POPULAR_CURRENCIES = [
  { name: 'WoW Classic Era Gold', color: '#1a5fa8', letter: 'W' },
  { name: 'Old School RuneScape Gold', color: '#8b2f2f', letter: 'OS' },
  { name: 'Growtopia Locks', color: '#6a1fc2', letter: 'G' },
  { name: 'Roblox Robux', color: '#cc0000', letter: 'R' },
  { name: 'DonutSMP Money', color: '#00a8e8', letter: 'D' },
];

const POPULAR_BOOSTING = [
  { name: 'Valorant', color: '#b8001f', letter: 'V' },
  { name: 'Rocket League', color: '#003d8f', letter: 'RL' },
  { name: 'Rainbow Six Siege X', color: '#2a2a2a', letter: 'R' },
  { name: 'EA Sports FC', color: '#1a6b3a', letter: 'FC' },
];

const POPULAR_ITEMS = [
  { name: 'Steal a Brainrot', color: '#e8793a', letter: 'S' },
  { name: 'Roblox', color: '#cc0000', letter: 'R' },
];

// -- GameRow ------------------------------------------------------------------
function GameRow({ game }) {
  return (
    <a
      href={`/browse?game=${encodeURIComponent(game.name)}`}
      className="flex items-center rounded-lg px-3 py-2 transition-colors cursor-pointer"
      style={{ color: 'hsl(var(--foreground))' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'hsl(var(--secondary))'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      <span className="text-sm font-medium truncate">{game.name}</span>
    </a>
  );
}

// -- Phone placeholder ---------------------------------------------------------
function PhonePlaceholder({ step }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <svg width="200" height="400" viewBox="0 0 200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="194" height="394" rx="40" stroke="hsl(var(--foreground)/0.2)" strokeWidth="6" fill="none" opacity="0.5" />
        <rect x="70" y="14" width="60" height="12" rx="6" fill="hsl(var(--foreground)/0.15)" />
        <rect x="14" y="42" width="172" height="310" rx="28" fill="hsl(var(--secondary))" />
        <rect x="60" y="352" width="80" height="6" rx="3" fill="hsl(var(--foreground)/0.2)" />
      </svg>
      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'hsl(var(--muted-foreground))' }}>
        Step {step}
      </span>
    </div>
  );
}

// -- Main component ------------------------------------------------------------
export default function Home() {
  const trendingRef = useRef(null);
  const [liveValues, setLiveValues] = useState(LIVE_STATS.map(() => 0));

  const scrollTrend = (dir) => {
    const el = trendingRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 260, behavior: 'smooth' });
  };

  useEffect(() => {
    const duration = 900;
    let frame;
    const start = performance.now();
    const animate = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = progress * (2 - progress);
      setLiveValues(LIVE_STATS.map((stat) => stat.value * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const tok = p.get('token'), usr = p.get('username'), em = p.get('email'), meth = p.get('method');
      if (tok && usr) {
        localStorage.setItem('bounty_token', tok);
        localStorage.setItem('authenticated_username', usr);
        if (em) localStorage.setItem('authenticated_email', em);
        if (meth) localStorage.setItem('auth_method', meth);
        window.history.replaceState({}, '', '/');
        window.location.reload();
      }
    }
    loadListings('', '', '');
  }, []);

  return (
    <>
      <Head>
        <title>Bounty — Gaming Marketplace</title>
        <meta name="description" content="Premier gaming marketplace for currency, accounts, and items" />
      </Head>

      {/* -- HERO --------------------------------------------------------------- */}
      <section className="relative overflow-hidden" style={{ background: 'hsl(var(--background))' }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)/0.07) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 100%, hsl(var(--background)) 30%, transparent 100%)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-6 pt-24 pb-20">
          <div className="max-w-2xl">
            {/* Badge — white pulse dot */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6 border"
              style={{ background: 'hsl(var(--secondary))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: '#fff' }}
              />
              Trusted by 50,000+ traders worldwide
            </div>

            <h1
              className="font-black tracking-tight mb-5 leading-[1.04]"
              style={{ fontSize: 'clamp(2.6rem, 6vw, 4.5rem)', fontFamily: "'Doto', sans-serif", color: 'hsl(var(--foreground))' }}
            >
              The #1 Gaming<br />Marketplace
            </h1>

            <p className="text-lg leading-relaxed mb-8 max-w-lg" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Buy and sell gaming currency, accounts, items and services. Secure escrow, instant delivery, 24/7 support.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-primary"
              >
                Browse Listings
              </button>
              <Link href="/become-a-seller">
                <button className="btn-outline">Start Selling</button>
              </Link>
            </div>
          </div>

          {/* -- Live Stats --------------------------------------------------- */}
          <div className="mt-16">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'hsl(var(--muted-foreground)/0.6)' }}>
              Live Stats
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {LIVE_STATS.map((stat, i) => {
                const value = liveValues[i];
                const formatted = stat.decimals ? value.toFixed(stat.decimals) : Math.round(value).toLocaleString();
                return (
                  <div
                    key={stat.label}
                    className="rounded-xl px-5 py-4 border"
                    style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  >
                    <div className="text-xl font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                      {stat.prefix ?? ''}{formatted}{stat.suffix ?? ''}
                    </div>
                    <div className="text-xs mt-1 font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* -- POPULAR SECTION (Trending + Category Grids) ------------------------- */}
      <section className="py-12 px-6 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="mx-auto max-w-7xl">

            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black" style={{ color: 'hsl(var(--foreground))' }}>
                Popular
              </h2>
            </div>

            {/* Trending scroll strip */}
            <div className="flex items-center gap-4 mb-8">
              <div
                ref={trendingRef}
                className="flex gap-2 overflow-x-auto pb-2 flex-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {TRENDING_ITEMS.map((item) => (
                  <a
                    key={item}
                    href={`/browse?q=${encodeURIComponent(item)}`}
                    className="rounded-xl border px-4 py-2.5 whitespace-nowrap text-sm font-medium flex-shrink-0 transition-all"
                    style={{
                      background: 'hsl(var(--secondary))',
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'hsl(var(--foreground)/0.35)';
                      e.currentTarget.style.background = 'hsl(var(--accent))';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'hsl(var(--border))';
                      e.currentTarget.style.background = 'hsl(var(--secondary))';
                    }}
                  >
                    {item}
                  </a>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => scrollTrend(-1)}
                  className="w-9 h-9 rounded-full border border-border flex items-center justify-center bg-secondary text-foreground transition-colors"
                  style={{ background: 'hsl(var(--secondary))' }}
                  aria-label="Scroll left"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  onClick={() => scrollTrend(1)}
                  className="w-9 h-9 rounded-full border border-border flex items-center justify-center bg-secondary text-foreground transition-colors"
                  style={{ background: 'hsl(var(--secondary))' }}
                  aria-label="Scroll right"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>

          {/* Category grid — 2 wide left col, 1 narrow right col */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">

            {/* Left column: Accounts (top) + Boosting (bottom) */}
            <div className="flex flex-col gap-4">

              {/* Popular Accounts */}
              <div
                className="rounded-2xl border p-5"
                style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
              >
                <h3 className="text-base font-bold mb-4" style={{ color: 'hsl(var(--foreground))' }}>Popular Accounts</h3>
                <div className="grid grid-cols-2 gap-1">
                  {POPULAR_ACCOUNTS.map(g => (
                    <GameRow key={g.name} game={g} />
                  ))}
                </div>
              </div>

              {/* Popular Boosting Services */}
              <div
                className="rounded-2xl border p-5"
                style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
              >
                <h3 className="text-base font-bold mb-4" style={{ color: 'hsl(var(--foreground))' }}>Popular Boosting Services</h3>
                <div className="grid grid-cols-2 gap-1">
                  {POPULAR_BOOSTING.map(g => (
                    <GameRow key={g.name} game={g} />
                  ))}
                </div>
              </div>
            </div>

            {/* Right column: Currencies (top) + Items (bottom) */}
            <div className="flex flex-col gap-4">

              {/* Popular Currencies */}
              <div
                className="rounded-2xl border p-5"
                style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
              >
                <h3 className="text-base font-bold mb-4" style={{ color: 'hsl(var(--foreground))' }}>Popular Currencies</h3>
                <div className="flex flex-col gap-1">
                  {POPULAR_CURRENCIES.map(g => (
                    <GameRow key={g.name} game={g} />
                  ))}
                </div>
              </div>

              {/* Popular Items */}
              <div
                className="rounded-2xl border p-5"
                style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
              >
                <h3 className="text-base font-bold mb-4" style={{ color: 'hsl(var(--foreground))' }}>Popular Items</h3>
                <div className="flex flex-col gap-1">
                  {POPULAR_ITEMS.map(g => (
                    <GameRow key={g.name} game={g} />
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* -- FEATURES ----------------------------------------------------------- */}
      <section className="py-16 px-6 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black mb-2" style={{ fontFamily: "'Doto', sans-serif" }}>Why choose Bounty?</h2>
            <p style={{ color: 'hsl(var(--muted-foreground))' }}>The safest and most reliable platform for gaming transactions.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Secure Escrow', desc: 'Funds held safely until delivery confirmed. 100% buyer protection on every trade.', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
              { title: 'Low Fees', desc: 'Competitive rates, no hidden costs. Keep more of what you earn as a seller.', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg> },
              { title: 'Global Reach', desc: 'Available 24/7 worldwide. Connect with buyers and sellers across the globe.', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg> },
              { title: '24/7 Support', desc: 'Our team is always here to help resolve any issues quickly and professionally.', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></svg> },
            ].map(f => (
              <div key={f.title} className="feature-box">
                <div className="icon-box mb-4">{f.icon}</div>
                <h3 className="font-bold text-base mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- MARKETPLACE LISTINGS ----------------------------------------------- */}
      <section id="marketplace" className="py-12 px-6 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black" style={{ fontFamily: "'Doto', sans-serif" }}>Browse Listings</h2>
            <select className="sort-select" onChange={e => sortListings(e.target.value)}>
              <option value="">Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4" id="game-tabs" style={{ scrollbarWidth: 'none' }}>
            {['All Games', 'World of Warcraft', 'OSRS', 'Path of Exile', 'Final Fantasy XIV', 'Diablo IV', 'Lost Ark', 'Fortnite', 'Valorant', 'Rocket League', 'FIFA', 'NBA 2K', 'Apex Legends'].map((g, i) => (
              <button key={g} className={'game-tab' + (i === 0 ? ' active' : '')} onClick={e => filterGame(e.target, g === 'All Games' ? '' : g)}>{g}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mb-6" id="cat-filters">
            {['All', 'Currency', 'Accounts', 'Power Leveling', 'Items', 'Boosting', 'Top Ups'].map((c, i) => (
              <button key={c} className={'filter-pill' + (i === 0 ? ' active' : '')} onClick={e => filterCategory(e.target, c === 'All' ? '' : c)}>{c}</button>
            ))}
          </div>
          <div id="listings-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="col-span-full text-center py-16" style={{ color: 'hsl(var(--muted-foreground))' }}>
              <div className="auth-spinner mx-auto mb-3" style={{ borderTopColor: 'hsl(var(--foreground))' }} />
              <p>Loading listings…</p>
            </div>
          </div>
        </div>
      </section>

      {/* -- HOW IT WORKS — Phone mockups --------------------------------------- */}
      <section className="py-16 px-6 border-t" style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--secondary))' }}>
        <div className="mx-auto max-w-5xl">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black mb-2" style={{ fontFamily: "'Doto', sans-serif" }}>How Bounty Works</h2>
        <p style={{ color: 'hsl(var(--muted-foreground))' }}>Blank phone frames are placeholders for upcoming walkthrough GIFs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 justify-items-center">
        <PhonePlaceholder step="1" />
        <PhonePlaceholder step="2" />
        <PhonePlaceholder step="3" />
      </div>
        </div>
      </section>

      {/* -- FOOTER ------------------------------------------------------------- */}
      <footer className="border-t py-10 px-6" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="font-black text-xl mb-3" style={{ fontFamily: "'Doto',sans-serif" }}>Bounty</div>
              <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>The premier gaming marketplace for currency, accounts, items and services.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Marketplace</h4>
              <div className="space-y-2 text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {[['Currency', '/browse?category=Currency'], ['Accounts', '/browse?category=Accounts'], ['Items', '/browse?category=Items'], ['Boosting', '/browse?category=Boosting']].map(([l, h]) => (
                  <Link key={l} href={h} className="block hover:text-foreground transition-colors">{l}</Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Sellers</h4>
              <div className="space-y-2 text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                <Link href="/become-a-seller" className="block hover:text-foreground transition-colors">Become a Seller</Link>
                <Link href="/dashboard" className="block hover:text-foreground transition-colors">Seller Dashboard</Link>
                <a href="#" className="block hover:text-foreground transition-colors">Fees & Payouts</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Support</h4>
              <div className="space-y-2 text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {['Help Center', 'Dispute Policy', 'Terms of Service', 'Privacy Policy'].map(l => (
                  <a key={l} href="#" className="block hover:text-foreground transition-colors">{l}</a>
                ))}
              </div>
              <div className="mt-4">
                <a
                  href="https://discord.com/invite/jyrkFzG7Qs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                  style={{ background: '#5865F2', color: '#fff' }}
                >
                  <svg width="14" height="11" viewBox="0 0 71 55" fill="currentColor">
                    <path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.3 37.3 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 4.9a.2.2 0 00-.1.1C1.5 18.7-.9 32.2.3 45.5v.1a58.7 58.7 0 0017.7 9 .2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.6 38.6 0 01-5.5-2.6.2.2 0 010-.4l1.1-.9a.2.2 0 01.2 0 41.9 41.9 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .3 36.3 36.3 0 01-5.5 2.7.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1A58.5 58.5 0 0070.3 45.6v-.1C71.7 30.1 67.8 16.7 60.2 5a.2.2 0 00-.1-.1zM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2zm23.7 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2z" />
                  </svg>
                  Join our Discord
                </a>
              </div>
            </div>
          </div>
          <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: 'hsl(var(--border))' }}>
            <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>© 2025 Bounty Gaming Marketplace. All rights reserved.</p>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              Secured by escrow protection on every transaction
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

// -- Client-side listing logic -------------------------------------------------
var _game = '', _cat = '', _sort = '';

function filterGame(btn, game) {
  _game = game;
  document.querySelectorAll('#game-tabs .game-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  loadListings(_game, _cat, _sort);
}

function filterCategory(btn, cat) {
  _cat = cat;
  document.querySelectorAll('#cat-filters .filter-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  loadListings(_game, _cat, _sort);
}

function sortListings(sort) { _sort = sort; loadListings(_game, _cat, _sort); }

async function loadListings(game, cat, sort) {
  const grid = document.getElementById('listings-grid');
  if (!grid) return;
  grid.innerHTML = '<div class="col-span-full text-center py-16" style="color:hsl(var(--muted-foreground))"><div class="auth-spinner mx-auto mb-3" style="border-top-color:hsl(var(--foreground))"></div><p>Loading…</p></div>';
  const params = new URLSearchParams({ limit: '16' });
  if (game) params.set('game', game);
  if (cat) params.set('category', cat);
  if (sort) params.set('sort', sort);
  try {
    const res = await fetch('/api/listings?' + params);
    const data = await res.json();
    if (!data.listings?.length) {
      grid.innerHTML = '<div class="col-span-full text-center py-16" style="color:hsl(var(--muted-foreground))"><p class="font-medium">No listings yet</p><p class="text-sm mt-1 opacity-60">Be the first to <a href="/become-a-seller" class="underline">sell something</a></p></div>';
      return;
    }
    grid.innerHTML = data.listings.map(renderCard).join('');
  } catch {
    grid.innerHTML = '<div class="col-span-full text-center py-16" style="color:hsl(var(--muted-foreground))">Failed to load listings.</div>';
  }
}

function renderCard(l) {
  const stars = '?'.repeat(Math.round(l.sellerRating || 5)) + '?'.repeat(5 - Math.round(l.sellerRating || 5));
  const dot = l.isSellerOnline ? '<span class="online-dot"></span>' : '<span class="offline-dot"></span>';
  const verified = l.isSellerVerified ? '<span class="verified-badge"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Verified</span>' : '';
  const gameLabel = l.game ? `<span class="text-xs px-2 py-0.5 rounded-full font-medium" style="background:hsl(var(--accent));color:hsl(var(--muted-foreground))">${esc(l.game)}</span>` : '';
  return `<div class="listing-card">
    <div class="flex items-center gap-2">
      <div class="seller-avatar"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-1.5">${dot}<span class="text-sm font-semibold truncate">${esc(l.sellerUsername)}</span>${verified}</div>
        <div class="text-xs" style="color:hsl(var(--muted-foreground))"><span style="color:#f59e0b">${stars}</span> (${l.sellerReviews || 0})</div>
      </div>${gameLabel}
    </div>
    <div class="flex-1">
      <p class="text-sm font-semibold leading-snug mb-1" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(l.title)}</p>
      <div class="flex items-center gap-3 text-xs" style="color:hsl(var(--muted-foreground))"><span>? ${esc(l.deliveryTime || '1-24h')}</span><span>? ${l.completionRate || 100}% done</span></div>
    </div>
    <div class="flex items-end justify-between pt-2 border-t" style="border-color:hsl(var(--border)/0.5)">
      <div><div class="text-xs" style="color:hsl(var(--muted-foreground))">${esc(l.priceUnit || 'per unit')}</div><div class="text-lg font-black">$${Number(l.price).toFixed(2)}</div></div>
      <button class="buy-btn" onclick="window.openModal&&window.openModal('login')">Buy Now</button>
    </div>
  </div>`;
}

function esc(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }



