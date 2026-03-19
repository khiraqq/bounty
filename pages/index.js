// FILE: pages/index.js
// Pure React — useState for listings, no document.getElementById, no innerHTML

import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';

// ---------------------------------------------------------------------------
// Static data — no emojis
// ---------------------------------------------------------------------------
const TRENDING_ITEMS = [
  'Fortnite Accounts', 'OSRS Gold', 'Valorant Accounts', 'WoW Gold',
  'Roblox Robux', 'Rocket League Items', 'Genshin Accounts', 'LoL Accounts',
  'CS2 Skins', 'Diablo IV Gold', 'Apex Legends Accounts', 'FIFA Coins',
];

const POPULAR_ACCOUNTS = [
  'Grand Theft Auto 5', 'Fortnite', 'Valorant', 'Rainbow Six Siege X',
  'Roblox', 'Adopt Me', 'Call of Duty', 'Rocket League',
  'Old School RuneScape', 'League of Legends',
];

const POPULAR_CURRENCIES = [
  'WoW Classic Era Gold', 'Old School RuneScape Gold',
  'Growtopia Locks', 'Roblox Robux', 'DonutSMP Money',
];

const POPULAR_BOOSTING = [
  'Valorant', 'Rocket League', 'Rainbow Six Siege X', 'EA Sports FC',
];

const POPULAR_ITEMS = [
  'Steal a Brainrot', 'Roblox',
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function GameRow({ name, category }) {
  return (
    <Link
      href={`/browse?category=${encodeURIComponent(category)}&q=${encodeURIComponent(name)}`}
      className="flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors"
      style={{ color: 'hsl(var(--foreground))', textDecoration: 'none' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'hsl(var(--secondary))'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      {name}
    </Link>
  );
}

function PhoneMockup({ step, title, desc }) {
  return (
    <div className="flex flex-col items-center gap-5">
      <div style={{
        width: 200, height: 400, borderRadius: 36,
        background: '#0a0a0a', border: '2.5px solid #2a2a2a',
        boxShadow: '0 0 0 1px #111, 0 24px 60px rgba(0,0,0,0.55)',
        position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>
        {/* Dynamic island */}
        <div style={{ height: 32, background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ width: 80, height: 22, borderRadius: 12, background: '#000', border: '1px solid #1a1a1a' }} />
        </div>
        {/* Blank screen — add your GIF here */}
        <div style={{ flex: 1, background: '#111' }} />
        {/* Home bar */}
        <div style={{ height: 28, background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ width: 80, height: 4, borderRadius: 2, background: '#2a2a2a' }} />
        </div>
        {/* Side buttons */}
        <div style={{ position: 'absolute', left: -3, top: 90, width: 3, height: 28, background: '#1e1e1e', borderRadius: '2px 0 0 2px' }} />
        <div style={{ position: 'absolute', left: -3, top: 128, width: 3, height: 48, background: '#1e1e1e', borderRadius: '2px 0 0 2px' }} />
        <div style={{ position: 'absolute', left: -3, top: 186, width: 3, height: 48, background: '#1e1e1e', borderRadius: '2px 0 0 2px' }} />
        <div style={{ position: 'absolute', right: -3, top: 140, width: 3, height: 64, background: '#1e1e1e', borderRadius: '0 2px 2px 0' }} />
      </div>
      <div className="text-center">
        <div
          className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black mb-2"
          style={{ background: 'hsl(var(--foreground))', color: 'hsl(var(--background))' }}
        >
          {step}
        </div>
        <h3 className="font-bold text-base mb-1" style={{ color: 'hsl(var(--foreground))' }}>{title}</h3>
        <p className="text-sm leading-relaxed max-w-[180px] mx-auto" style={{ color: 'hsl(var(--muted-foreground))' }}>{desc}</p>
      </div>
    </div>
  );
}

function ListingCard({ listing }) {
  const rating = Math.round(listing.sellerRating || 5);
  const stars = Array.from({ length: 5 }, (_, i) => i < rating ? '★' : '☆').join('');

  return (
    <div className="listing-card">
      <div className="flex items-center gap-2">
        <div className="seller-avatar">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={listing.isSellerOnline ? 'online-dot' : 'offline-dot'} />
            <span className="text-sm font-semibold truncate">{listing.sellerUsername}</span>
            {listing.isSellerVerified && (
              <span className="verified-badge">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Verified
              </span>
            )}
          </div>
          <div className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
            <span style={{ color: '#f59e0b' }}>{stars}</span> ({listing.sellerReviews || 0})
          </div>
        </div>
        {listing.game && (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'hsl(var(--accent))', color: 'hsl(var(--muted-foreground))' }}
          >
            {listing.game}
          </span>
        )}
      </div>
      <div className="flex-1">
        <p
          className="text-sm font-semibold leading-snug mb-1"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {listing.title}
        </p>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
          <span>{listing.deliveryTime || '1-24h'}</span>
          <span>{listing.completionRate || 100}% completion</span>
        </div>
      </div>
      <div className="flex items-end justify-between pt-2 border-t" style={{ borderColor: 'hsl(var(--border)/0.5)' }}>
        <div>
          <div className="text-xs mb-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {listing.priceUnit || 'per unit'}
          </div>
          <div className="text-lg font-black">${Number(listing.price).toFixed(2)}</div>
        </div>
        <button
          className="buy-btn"
          onClick={() => { if (typeof window !== 'undefined') window.openModal?.('login'); }}
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------
export default function Home() {
  const trendingRef = useRef(null);

  // Listings state
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsError, setListingsError] = useState(false);
  const [activeGame, setActiveGame] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [sortOrder, setSortOrder] = useState('');

  const GAMES = ['All Games', 'World of Warcraft', 'OSRS', 'Path of Exile', 'Final Fantasy XIV', 'Diablo IV', 'Lost Ark', 'Fortnite', 'Valorant', 'Rocket League', 'FIFA', 'NBA 2K', 'Apex Legends'];
  const CATEGORIES = ['All', 'Currency', 'Accounts', 'Power Leveling', 'Items', 'Boosting', 'Top Ups'];

  // Handle OAuth redirect tokens — client only
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    const tok = p.get('token');
    const usr = p.get('username');
    const em = p.get('email');
    const meth = p.get('method');
    if (tok && usr) {
      localStorage.setItem('bounty_token', tok);
      localStorage.setItem('authenticated_username', usr);
      if (em) localStorage.setItem('authenticated_email', em);
      if (meth) localStorage.setItem('auth_method', meth);
      window.history.replaceState({}, '', '/');
      window.location.reload();
    }
  }, []);

  // Fetch listings whenever filters change
  useEffect(() => {
    async function fetchListings() {
      setListingsLoading(true);
      setListingsError(false);
      const params = new URLSearchParams({ limit: '16' });
      if (activeGame) params.set('game', activeGame);
      if (activeCategory) params.set('category', activeCategory);
      if (sortOrder) params.set('sort', sortOrder);
      try {
        const res = await fetch('/api/listings?' + params.toString());
        const data = await res.json();
        setListings(data.listings || []);
      } catch {
        setListingsError(true);
      } finally {
        setListingsLoading(false);
      }
    }
    fetchListings();
  }, [activeGame, activeCategory, sortOrder]);

  function scrollTrend(dir) {
    trendingRef.current?.scrollBy({ left: dir * 280, behavior: 'smooth' });
  }

  return (
    <>
      <Head>
        <title>Bounty — Non-KYC Marketplace</title>
        <meta name="description" content="Premier gaming marketplace for currency, accounts, and items" />
      </Head>

      {/* HERO */}
      <section className="relative overflow-hidden" style={{ background: 'hsl(var(--background))' }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)/0.055) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 55% at 50% 100%, hsl(var(--background)) 25%, transparent 100%)' }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-6 pt-24 pb-20">
          <div className="max-w-2xl">
            {/* Trust badge — white dot + white text */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6 border"
              style={{ background: 'hsl(var(--secondary))', borderColor: 'hsl(var(--border))', color: '#ffffff' }}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: '#ffffff' }}
              />
              Trusted by 50,000+ traders worldwide
            </div>

            <h1
              className="font-black tracking-tight mb-5 leading-[1.04]"
              style={{ fontSize: 'clamp(2.6rem, 6vw, 4.5rem)', fontFamily: "'Doto', sans-serif", color: 'hsl(var(--foreground))' }}
            >
              The #1 Non-KYC<br />Marketplace
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

          {/* Live Stats */}
          <div className="mt-16">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'hsl(var(--muted-foreground)/0.55)' }}>
              Live Stats
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ['$2M+', 'Paid to Sellers'],
                ['50K+', 'Active Sellers'],
                ['200+', 'Games Supported'],
                ['4.9', 'Avg Rating'],
              ].map(([val, label]) => (
                <div
                  key={label}
                  className="rounded-xl px-5 py-4 border"
                  style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                >
                  <div className="text-xl font-semibold" style={{ color: 'hsl(var(--foreground))' }}>{val}</div>
                  <div className="text-xs mt-1 font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR SECTION */}
      <section className="py-12 px-6 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="mx-auto max-w-7xl">
          {/* Header with arrows at far right */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black" style={{ color: 'hsl(var(--foreground))' }}>Popular</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollTrend(-1)}
                className="w-8 h-8 rounded-lg border flex items-center justify-center transition-colors"
                style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--secondary))', color: 'hsl(var(--foreground))' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'hsl(var(--foreground)/0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'hsl(var(--border))'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                onClick={() => scrollTrend(1)}
                className="w-8 h-8 rounded-lg border flex items-center justify-center transition-colors"
                style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--secondary))', color: 'hsl(var(--foreground))' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'hsl(var(--foreground)/0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'hsl(var(--border))'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Scrollable trending strip — text only, no emojis */}
          <div
            ref={trendingRef}
            className="flex gap-2 overflow-x-auto pb-3 mb-8"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {TRENDING_ITEMS.map(item => (
              <Link
                key={item}
                href={`/browse?q=${encodeURIComponent(item)}`}
                className="flex items-center rounded-xl border px-4 py-2.5 whitespace-nowrap text-sm font-medium flex-shrink-0 transition-all"
                style={{ background: 'hsl(var(--secondary))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', textDecoration: 'none' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'hsl(var(--foreground)/0.35)'; e.currentTarget.style.background = 'hsl(var(--accent))'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'hsl(var(--border))'; e.currentTarget.style.background = 'hsl(var(--secondary))'; }}
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Category grids — text only, no icons */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border p-5" style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}>
                <h3 className="text-sm font-bold mb-3" style={{ color: 'hsl(var(--foreground))' }}>Popular Accounts</h3>
                <div className="grid grid-cols-2 gap-0">
                  {POPULAR_ACCOUNTS.map(name => <GameRow key={name} name={name} category="Accounts" />)}
                </div>
              </div>
              <div className="rounded-2xl border p-5" style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}>
                <h3 className="text-sm font-bold mb-3" style={{ color: 'hsl(var(--foreground))' }}>Popular Boosting Services</h3>
                <div className="grid grid-cols-2 gap-0">
                  {POPULAR_BOOSTING.map(name => <GameRow key={name} name={name} category="Boosting" />)}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border p-5" style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}>
                <h3 className="text-sm font-bold mb-3" style={{ color: 'hsl(var(--foreground))' }}>Popular Currencies</h3>
                <div className="flex flex-col gap-0">
                  {POPULAR_CURRENCIES.map(name => <GameRow key={name} name={name} category="Currency" />)}
                </div>
              </div>
              <div className="rounded-2xl border p-5" style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}>
                <h3 className="text-sm font-bold mb-3" style={{ color: 'hsl(var(--foreground))' }}>Popular Items</h3>
                <div className="flex flex-col gap-0">
                  {POPULAR_ITEMS.map(name => <GameRow key={name} name={name} category="Items" />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 px-6 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black mb-2" style={{ fontFamily: "'Doto', sans-serif" }}>Why choose Bounty?</h2>
            <p style={{ color: 'hsl(var(--muted-foreground))' }}>The safest and most reliable platform for gaming transactions.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Secure Escrow',
                desc: 'Funds held safely until delivery confirmed. 100% buyer protection on every trade.',
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
              },
              {
                title: 'Low Fees',
                desc: 'Competitive rates, no hidden costs. Keep more of what you earn as a seller.',
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
              },
              {
                title: 'Global Reach',
                desc: 'Available 24/7 worldwide. Connect with buyers and sellers across the globe.',
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
              },
              {
                title: '24/7 Support',
                desc: 'Our team is always here to help resolve any issues quickly and professionally.',
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></svg>,
              },
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

      {/* MARKETPLACE LISTINGS — pure React state, no DOM manipulation */}
      <section id="marketplace" className="py-12 px-6 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black" style={{ fontFamily: "'Doto', sans-serif" }}>Browse Listings</h2>
            <select
              className="sort-select"
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
            >
              <option value="">Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {/* Game tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
            {GAMES.map(g => (
              <button
                key={g}
                className={'game-tab' + (activeGame === (g === 'All Games' ? '' : g) ? ' active' : '')}
                onClick={() => setActiveGame(g === 'All Games' ? '' : g)}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={'filter-pill' + (activeCategory === (c === 'All' ? '' : c) ? ' active' : '')}
                onClick={() => setActiveCategory(c === 'All' ? '' : c)}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Listings grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {listingsLoading && (
              <div className="col-span-full text-center py-16" style={{ color: 'hsl(var(--muted-foreground))' }}>
                <div className="auth-spinner mx-auto mb-3" style={{ borderTopColor: 'hsl(var(--foreground))' }} />
                <p>Loading listings...</p>
              </div>
            )}
            {!listingsLoading && listingsError && (
              <div className="col-span-full text-center py-16" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Failed to load listings.
              </div>
            )}
            {!listingsLoading && !listingsError && listings.length === 0 && (
              <div className="col-span-full text-center py-16" style={{ color: 'hsl(var(--muted-foreground))' }}>
                <p className="font-medium">No listings yet</p>
                <p className="text-sm mt-1 opacity-60">
                  Be the first to{' '}
                  <Link href="/become-a-seller" className="underline">sell something</Link>
                </p>
              </div>
            )}
            {!listingsLoading && !listingsError && listings.map(listing => (
              <ListingCard key={listing._id || listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — blank phone frames */}
      <section className="py-16 px-6 border-t" style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--secondary))' }}>
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black mb-2" style={{ fontFamily: "'Doto', sans-serif" }}>How Bounty Works</h2>
            <p style={{ color: 'hsl(var(--muted-foreground))' }}>Buy and sell gaming goods safely in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 justify-items-center">
            <PhoneMockup step="1" title="Find a Listing" desc="Browse thousands of verified listings by game, category, and price." />
            <PhoneMockup step="2" title="Place an Order" desc="Buy securely with escrow protection. Funds held until delivery confirmed." />
            <PhoneMockup step="3" title="Receive and Review" desc="Get your items, confirm delivery, and leave a review." />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-10 px-6" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="font-black text-xl mb-3" style={{ fontFamily: "'Doto',sans-serif" }}>Bounty</div>
              <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>
                The premier gaming marketplace for currency, accounts, items and services.
              </p>
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
                <a href="#" className="block hover:text-foreground transition-colors">Fees and Payouts</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Support</h4>
              <div className="space-y-2 text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {['Help Center', 'Dispute Policy', 'Terms of Service', 'Privacy Policy'].map(l => (
                  <a key={l} href="#" className="block hover:text-foreground transition-colors">{l}</a>
                ))}
              </div>
              <a
                href="https://discord.com/invite/jyrkFzG7Qs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-3 py-2 rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity"
                style={{ background: '#5865F2', color: '#fff' }}
              >
                <svg width="14" height="11" viewBox="0 0 71 55" fill="currentColor">
                  <path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.3 37.3 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 4.9a.2.2 0 00-.1.1C1.5 18.7-.9 32.2.3 45.5v.1a58.7 58.7 0 0017.7 9 .2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.6 38.6 0 01-5.5-2.6.2.2 0 010-.4l1.1-.9a.2.2 0 01.2 0 41.9 41.9 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .3 36.3 36.3 0 01-5.5 2.7.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1A58.5 58.5 0 0070.3 45.6v-.1C71.7 30.1 67.8 16.7 60.2 5a.2.2 0 00-.1-.1zM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2zm23.7 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2z" />
                </svg>
                Join our Discord
              </a>
            </div>
          </div>
          <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: 'hsl(var(--border))' }}>
            <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
              2025 Bounty. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Secured by Bounty protection on every transaction
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}