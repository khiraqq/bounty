import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
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

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: 'hsl(var(--background))' }}>
        {/* Dot-grid background texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)/0.07) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Fade-out vignette on the texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 100%, hsl(var(--background)) 30%, transparent 100%)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-6 pt-24 pb-20">
          <div className="max-w-2xl">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6 border"
              style={{ background: 'hsl(var(--secondary))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
              Trusted by 50,000+ traders worldwide
            </div>

            <h1
              className="font-black tracking-tight mb-5 leading-[1.04]"
              style={{ fontSize: 'clamp(2.6rem, 6vw, 4.5rem)', fontFamily: "'Doto', sans-serif", color: 'hsl(var(--foreground))' }}
            >
              The #1 Gaming<br />
              <span style={{ color: 'hsl(var(--foreground))' }}>Marketplace</span>
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

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-16">
            {[['$2M+', 'Paid to Sellers'], ['50K+', 'Active Sellers'], ['200+', 'Games Supported'], ['4.9★', 'Avg Rating']].map(([val, label]) => (
              <div
                key={val}
                className="rounded-xl px-5 py-4 border"
                style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
              >
                <div className="text-2xl font-black" style={{ color: 'hsl(var(--foreground))' }}>{val}</div>
                <div className="text-xs mt-1 font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
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

      {/* ── MARKETPLACE LISTINGS ─────────────────────────────────────────────── */}
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

      {/* ── POPULAR GAMES ────────────────────────────────────────────────────── */}
      <section className="py-14 px-6 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black mb-2" style={{ fontFamily: "'Doto', sans-serif" }}>Popular Games</h2>
            <p style={{ color: 'hsl(var(--muted-foreground))' }}>Thousands of listings across the most popular titles</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { name: 'World of Warcraft', emoji: '⚔️', listings: '12.4K' },
              { name: 'OSRS', emoji: '🏹', listings: '8.9K' },
              { name: 'Path of Exile', emoji: '💀', listings: '6.2K' },
              { name: 'Fortnite', emoji: '🎯', listings: '5.1K' },
              { name: 'Valorant', emoji: '🔫', listings: '4.8K' },
              { name: 'Diablo IV', emoji: '😈', listings: '3.7K' },
              { name: 'Final Fantasy XIV', emoji: '🌟', listings: '3.2K' },
              { name: 'CS2', emoji: '💣', listings: '2.9K' },
              { name: 'Genshin Impact', emoji: '🌊', listings: '2.5K' },
              { name: 'League of Legends', emoji: '🏆', listings: '2.1K' },
              { name: 'Rocket League', emoji: '🚀', listings: '1.8K' },
              { name: 'Apex Legends', emoji: '🎖️', listings: '1.5K' },
            ].map(g => (
              <a key={g.name} href={'/browse?game=' + encodeURIComponent(g.name)} className="game-tile">
                <div className="text-2xl mb-2">{g.emoji}</div>
                <div className="text-xs font-bold leading-tight text-center">{g.name}</div>
                <div className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>{g.listings} offers</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="py-14 px-6 border-t" style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--secondary))' }}>
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-black mb-2" style={{ fontFamily: "'Doto', sans-serif" }}>How Bounty Works</h2>
          <p className="mb-12" style={{ color: 'hsl(var(--muted-foreground))' }}>Buy and sell gaming goods safely in 3 simple steps</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: '1', title: 'Find a Listing', desc: 'Browse thousands of verified listings by game, category, price, and seller rating.', emoji: '🔍' },
              { step: '2', title: 'Place an Order', desc: 'Buy securely with escrow protection. Your funds are held until delivery is confirmed.', emoji: '🛒' },
              { step: '3', title: 'Receive & Review', desc: 'Get your items, confirm delivery, and leave a review to help the community.', emoji: '✅' },
            ].map(s => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="text-4xl mb-4">{s.emoji}</div>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm mb-3"
                  style={{ background: 'hsl(var(--foreground))', color: 'hsl(var(--background))' }}
                >{s.step}</div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
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

// ── Client-side listing logic ─────────────────────────────────────────────────
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
  grid.innerHTML = '<div class="col-span-full text-center py-16 text-muted-foreground"><div class="auth-spinner mx-auto mb-3" style="border-top-color:hsl(var(--foreground))"></div><p>Loading…</p></div>';
  const params = new URLSearchParams({ limit: '16' });
  if (game) params.set('game', game);
  if (cat) params.set('category', cat);
  if (sort) params.set('sort', sort);
  try {
    const res = await fetch('/api/listings?' + params);
    const data = await res.json();
    if (!data.listings?.length) {
      grid.innerHTML = '<div class="col-span-full text-center py-16 text-muted-foreground"><p class="font-medium">No listings yet</p><p class="text-sm mt-1 opacity-60">Be the first to <a href="/become-a-seller" class="underline">sell something</a></p></div>';
      return;
    }
    grid.innerHTML = data.listings.map(renderCard).join('');
  } catch {
    grid.innerHTML = '<div class="col-span-full text-center py-16 text-muted-foreground">Failed to load listings.</div>';
  }
}

function renderCard(l) {
  const stars = '★'.repeat(Math.round(l.sellerRating || 5)) + '☆'.repeat(5 - Math.round(l.sellerRating || 5));
  const dot = l.isSellerOnline ? '<span class="online-dot"></span>' : '<span class="offline-dot"></span>';
  const verified = l.isSellerVerified ? '<span class="verified-badge"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Verified</span>' : '';
  const gameLabel = l.game ? `<span class="text-xs px-2 py-0.5 rounded-full font-medium" style="background:hsl(var(--accent));color:hsl(var(--muted-foreground))">${esc(l.game)}</span>` : '';
  return `<div class="listing-card">
    <div class="flex items-center gap-2">
      <div class="seller-avatar"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-1.5">${dot}<span class="text-sm font-semibold truncate">${esc(l.sellerUsername)}</span>${verified}</div>
        <div class="text-xs text-muted-foreground"><span style="color:#f59e0b">${stars}</span> (${l.sellerReviews || 0})</div>
      </div>${gameLabel}
    </div>
    <div class="flex-1">
      <p class="text-sm font-semibold leading-snug mb-1" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(l.title)}</p>
      <div class="flex items-center gap-3 text-xs text-muted-foreground"><span>⚡ ${esc(l.deliveryTime || '1-24h')}</span><span>✓ ${l.completionRate || 100}% done</span></div>
    </div>
    <div class="flex items-end justify-between pt-2 border-t" style="border-color:hsl(var(--border)/0.5)">
      <div><div class="text-xs text-muted-foreground mb-0.5">${esc(l.priceUnit || 'per unit')}</div><div class="text-lg font-black">$${Number(l.price).toFixed(2)}</div></div>
      <button class="buy-btn" onclick="window.openModal&&window.openModal('login')">Buy Now</button>
    </div>
  </div>`;
}

function esc(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
