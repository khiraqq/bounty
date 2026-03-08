import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const TRENDING_ITEMS = [
  { label: 'Fortnite Accounts', emoji: '🎯' },
  { label: 'OSRS Gold', emoji: '🪙' },
  { label: 'Valorant Accounts', emoji: '🔫' },
  { label: 'WoW Gold', emoji: '⚔️' },
  { label: 'Roblox Robux', emoji: '🟡' },
  { label: 'Rocket League Items', emoji: '🚀' },
  { label: 'Genshin Accounts', emoji: '🌊' },
  { label: 'LoL Accounts', emoji: '🏆' },
  { label: 'CS2 Skins', emoji: '💣' },
  { label: 'Diablo IV Gold', emoji: '😈' },
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

function GameIcon({ color, letter, size = 36 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontSize: letter.length > 1 ? 9 : 13,
        fontWeight: 900,
        color: '#fff',
        letterSpacing: '-0.03em',
      }}
    >
      {letter}
    </div>
  );
}

function GameRow({ game }) {
  return (
    <a
      href={`/browse?game=${encodeURIComponent(game.name)}`}
      className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors cursor-pointer"
      style={{ color: 'hsl(var(--foreground))' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'hsl(var(--secondary))'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      <GameIcon color={game.color} letter={game.letter} />
      <span className="text-sm font-medium truncate">{game.name}</span>
    </a>
  );
}

function PhoneMockup({ step, title, desc }) {
  return (
    <div className="flex flex-col items-center gap-5">
      <div
        style={{
          width: 200,
          height: 400,
          borderRadius: 36,
          background: '#0a0a0a',
          border: '2.5px solid #2a2a2a',
          boxShadow: '0 0 0 1px #111, 0 24px 60px rgba(0,0,0,0.6)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ height: 32, background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 2 }}>
          <div style={{ width: 80, height: 22, borderRadius: 12, background: '#000', border: '1px solid #1a1a1a' }} />
        </div>
        <div style={{ flex: 1, background: '#111', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 11, color: '#333', fontFamily: 'monospace', textAlign: 'center', padding: '0 16px' }} />
        </div>
        <div style={{ height: 28, background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ width: 80, height: 4, borderRadius: 2, background: '#2a2a2a' }} />
        </div>
        <div style={{ position: 'absolute', left: -3, top: 90, width: 3, height: 28, background: '#1a1a1a', borderRadius: '2px 0 0 2px' }} />
        <div style={{ position: 'absolute', left: -3, top: 128, width: 3, height: 48, background: '#1a1a1a', borderRadius: '2px 0 0 2px' }} />
        <div style={{ position: 'absolute', left: -3, top: 186, width: 3, height: 48, background: '#1a1a1a', borderRadius: '2px 0 0 2px' }} />
        <div style={{ position: 'absolute', right: -3, top: 140, width: 3, height: 64, background: '#1a1a1a', borderRadius: '0 2px 2px 0' }} />
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

export default function Home() {
  const trendingRef = useRef(null);
  const [trendIdx, setTrendIdx] = useState(0);

  const scrollTrend = (dir) => {
    const el = trendingRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 260, behavior: 'smooth' });
  };

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

      {/* ... rest of JSX as provided ... */}
    </>
  );
}

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
  const stars = '★'.repeat(Math.round(l.sellerRating || 5)) + '☆'.repeat(5 - Math.round(l.sellerRating || 5));
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
      <div class="flex items-center gap-3 text-xs" style="color:hsl(var(--muted-foreground))"><span>⚡ ${esc(l.deliveryTime || '1-24h')}</span><span>✓ ${l.completionRate || 100}% done</span></div>
    </div>
    <div class="flex items-end justify-between pt-2 border-t" style="border-color:hsl(var(--border)/0.5)">
      <div><div class="text-xs mb-0.5" style="color:hsl(var(--muted-foreground))">${esc(l.priceUnit || 'per unit')}</div><div class="text-lg font-black">$${Number(l.price).toFixed(2)}</div></div>
      <button class="buy-btn" onclick="window.openModal&&window.openModal('login')">Buy Now</button>
    </div>
  </div>`;
}

function esc(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
