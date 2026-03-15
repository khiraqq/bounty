// FILE: components/Layout.js
// Pure React — no document.getElementById, no innerHTML, all window/localStorage in useEffect

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ---------------------------------------------------------------------------
// Captcha — pure functions, no DOM
// ---------------------------------------------------------------------------
function seededVal(code) {
  return code.split('').reduce((acc, ch, i) => acc + ch.charCodeAt(0) + i * 11, 0);
}
function jitter(seed, offset) {
  return ((Math.sin((seed + offset) * 0.37)) + 1) / 2;
}
function rng(min, max, t) {
  return min + (max - min) * t;
}
function genCaptchaCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
function buildCaptchaSVG(code) {
  const W = 150, H = 50, seed = seededVal(code);
  const hLines = Array.from({ length: 3 }, (_, i) => {
    const y = rng(8, H - 8, jitter(seed, 10 + i));
    return `<line x1="6" x2="${W - 6}" y1="${y}" y2="${y}" stroke="#fff" stroke-width="0.35" stroke-opacity="0.12"/>`;
  });
  const vLines = Array.from({ length: 3 }, (_, i) => {
    const x = rng(8, W - 8, jitter(seed, 20 + i));
    return `<line x1="${x}" x2="${x}" y1="6" y2="${H - 6}" stroke="#fff" stroke-width="0.35" stroke-opacity="0.12"/>`;
  });
  const glyphs = code.split('').map((c, i) => {
    const x = 28 + i * 30 + rng(-4, 4, jitter(seed, 80 + i)) - i * 2;
    const y = 32 + rng(-4, 4, jitter(seed, 90 + i));
    const r = rng(-14, 14, jitter(seed, 70 + i));
    return `<text x="${x}" y="${y}" fill="#f5f5f5" font-size="24" font-family="'Doto',sans-serif" font-weight="700" transform="rotate(${r} ${x} ${y})">${c}</text>`;
  });
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10" fill="#101010" stroke="rgba(255,255,255,0.08)"/>${hLines.join('')}${vLines.join('')}${glyphs.join('')}</svg>`;
}

// ---------------------------------------------------------------------------
// Dropdown data
// ---------------------------------------------------------------------------
const NAV_CATEGORIES = {
  Currency: {
    popular: [
      'WoW Classic Era Gold', 'Old School RuneScape Gold', 'Growtopia Locks', 'Roblox Robux',
      'DonutSMP Money', 'Blade Ball Tokens', 'Arc Raiders Coins', 'RuneScape 3 Gold',
      'EA Sports FC Coins', 'World of Warcraft Gold', 'Warframe Platinum', 'Delta Force Tekniq Alloy',
    ],
    all: [
      '8 Ball Pool Coins', 'Aion 2 Kinah', 'Albion Online Silver', 'Arc Raiders Coins',
      'Black Desert Online Silver', 'CS2 Coins', 'Diablo IV Gold', 'Final Fantasy XIV Gil',
      'Guild Wars 2 Gold', 'Lost Ark Gold', 'Path of Exile Currency', 'Roblox Robux',
    ],
  },
  Accounts: {
    popular: [
      'Grand Theft Auto 5', 'Fortnite', 'Valorant', 'Rainbow Six Siege X',
      'Roblox', 'Adopt Me', 'Call of Duty', 'Rocket League',
      'Old School RuneScape', 'League of Legends', 'Overwatch', 'Minecraft',
    ],
    all: [
      '8 Ball Pool', '99 Nights in the Forest', 'Adopt Me', 'Aion 2',
      'Albion Online', 'All Star Tower Defense X', 'Animal Crossing: New Horizons',
      'Anime Defenders', 'Apex Legends', 'Arc Raiders', 'Arena Breakout', 'Battlefield',
    ],
  },
  Items: {
    popular: [
      'Steal a Brainrot', 'Roblox', 'Adopt Me', 'Arc Raiders',
      'Escape Tsunami For Brainrots', 'DonutSMP', 'Murder Mystery 2', 'Roblox Rivals',
      'Pokemon Go', 'Old School RuneScape', 'Blox Fruits', 'Anime Vanguards',
    ],
    all: [
      'Abyss', 'Adopt Me', 'Albion Online', 'All Star Tower Defense X',
      'Animal Crossing: New Horizons', 'Anime Defenders', 'Apex Legends', 'Arc Raiders',
      'Arena Breakout', 'Arena Breakout: Infinite', 'Battlefield', 'Blox Fruits',
    ],
  },
  Boosting: {
    popular: [
      'Valorant', 'Rocket League', 'Rainbow Six Siege X', 'EA Sports FC',
      'Brawl Stars', 'Arc Raiders', 'League of Legends', 'Call of Duty',
      'Marvel Rivals', 'Overwatch', 'WoW Classic', 'Old School RuneScape',
    ],
    all: [
      'Anime Vanguards', 'Apex Legends', 'Arc Raiders', 'Arena Breakout',
      'Arena Breakout: Infinite', 'Battlefield', 'Brawl Stars', 'Call of Duty',
      'CS2', 'Destiny 2', 'Diablo IV', 'EA Sports FC',
    ],
  },
  'Top Ups': {
    popular: [
      'Pokemon Go Top Ups', 'Genshin Impact Top Ups', 'Apex Legends Top Ups', 'Valorant Points',
      'Fortnite V-Bucks', 'Mobile Legends Diamonds', 'EA Sports FC Points', 'Call of Duty Points',
      'Spotify Subscription', 'Xbox Game Pass', 'PUBG Mobile UC', 'Honkai: Star Rail Oneiric Shards',
    ],
    all: [
      '8 Ball Pool Cash', 'Amazon Subscription', 'Apex Legends Top Ups', 'Arena Breakout Top Ups',
      'Brawl Stars Gems', 'Call of Duty Points', 'Clash of Clans Gems', 'EA Sports FC Points',
      'Fortnite V-Bucks', 'Free Fire Diamonds', 'Genshin Impact Top Ups', 'PUBG Mobile UC',
    ],
  },
  Giftcards: {
    popular: [
      'Roblox Gift Cards', 'Valorant Gift Cards', 'Steam Gift Cards', 'Razer Gold',
      'Apple Gift Cards', 'PlayStation Gift Card', 'Discord Nitro', 'Steam Game Accounts',
      'Amazon Gift Cards', 'Xbox Gift Cards', 'PUBG Mobile Gift Cards', 'CD Keys',
    ],
    all: [
      'Amazon Gift Cards', 'Apple Gift Cards', 'Blizzard Gift Cards', 'CD Keys',
      'Discord Nitro', 'EA Gift Cards', 'Epic Games Gift Cards', 'Google Play Gift Cards',
      'iTunes Gift Cards', 'Nintendo eShop', 'PlayStation Gift Card', 'Razer Gold',
    ],
  },
};

const CATEGORY_KEYS = ['Currency', 'Accounts', 'Items', 'Boosting', 'Top Ups', 'Giftcards'];

// ---------------------------------------------------------------------------
// MegaDropdown sub-component
// ---------------------------------------------------------------------------
function MegaDropdown({ cat, searchVal, onSearchChange }) {
  const data = NAV_CATEGORIES[cat] || { popular: [], all: [] };
  const filteredAll = searchVal.trim()
    ? data.all.filter(n => n.toLowerCase().includes(searchVal.toLowerCase()))
    : data.all;

  return (
    <div className="flex" style={{ minHeight: 300 }}>
      {/* Left: popular grid */}
      <div className="flex-1 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Popular games
        </p>
        <div className="grid grid-cols-2 gap-0">
          {data.popular.map(name => (
            <Link
              key={name}
              href={`/browse?category=${encodeURIComponent(cat)}&q=${encodeURIComponent(name)}`}
              className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ color: 'hsl(var(--foreground))', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'hsl(var(--secondary))'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div
                className="w-8 h-8 rounded-lg shrink-0"
                style={{ background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))' }}
              />
              <span className="truncate leading-tight">{name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Right: search + all games */}
      <div
        className="w-56 border-l flex flex-col"
        style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--secondary))' }}
      >
        <div className="p-3 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
          <div
            className="flex items-center gap-2 rounded-lg border px-3 py-2"
            style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'hsl(var(--muted-foreground))', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search for game"
              value={searchVal}
              onChange={e => onSearchChange(e.target.value)}
              className="bg-transparent outline-none text-sm w-full"
              style={{ color: 'hsl(var(--foreground))' }}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2" style={{ maxHeight: 300 }}>
          <p className="text-xs font-bold px-2 py-1 mb-1" style={{ color: 'hsl(var(--foreground))' }}>
            All games
          </p>
          {filteredAll.map(name => (
            <Link
              key={name}
              href={`/browse?category=${encodeURIComponent(cat)}&q=${encodeURIComponent(name)}`}
              className="flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors"
              style={{ color: 'hsl(var(--foreground))', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'hsl(var(--accent))'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div
                className="w-7 h-7 rounded-lg shrink-0"
                style={{ background: 'hsl(var(--accent))', border: '1px solid hsl(var(--border))' }}
              />
              <span className="text-sm truncate">{name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AuthModal — fully controlled React component
// ---------------------------------------------------------------------------
function AuthModal({ isOpen, initialView, onClose }) {
  const [view, setView] = useState(initialView || 'login');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Generate captcha only on client
  useEffect(() => {
    setCaptchaCode(genCaptchaCode());
  }, []);

  useEffect(() => {
    if (isOpen) {
      setView(initialView || 'login');
      setCaptchaCode(genCaptchaCode());
      setCaptchaInput('');
      setError('');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
    }
  }, [isOpen, initialView]);

  // Lock scroll when open
  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  function refreshCaptcha() {
    setCaptchaCode(genCaptchaCode());
    setCaptchaInput('');
  }

  function switchView(v) {
    setView(v);
    setError('');
    refreshCaptcha();
  }

  const captchaValid = captchaCode && captchaInput.toUpperCase() === captchaCode;
  const isSignup = view === 'signup';

  async function handleSubmit() {
    setError('');
    if (!captchaValid) return;
    if (!username || !password) { setError('Please fill in all required fields.'); return; }
    if (isSignup && password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const endpoint = isSignup ? '/api/auth/register' : '/api/auth/login';
      const body = { username, password };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Something went wrong.'); return; }
      if (data.token && typeof window !== 'undefined') {
        localStorage.setItem('bounty_token', data.token);
        localStorage.setItem('authenticated_username', data.username || username);
        onClose();
        window.location.reload();
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.65)' }} />
      <div
        className="relative z-10 w-full max-w-md mx-4 rounded-2xl p-8 shadow-2xl border"
        style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 hover:opacity-70 transition-opacity"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h2
          className="text-3xl font-black text-center mb-1"
          style={{ fontFamily: "'Doto', sans-serif", color: 'hsl(var(--foreground))' }}
        >
          {isSignup ? 'Create an account' : 'Welcome back'}
        </h2>
        <p className="text-center text-sm mb-6" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {isSignup
            ? 'Enter your details to create a new account'
            : 'Enter your credentials to access your account'}
        </p>

        {error && (
          <p
            className="text-sm text-red-500 mb-4 text-center rounded-lg px-3 py-2"
            style={{ background: 'rgba(239,68,68,0.1)' }}
          >
            {error}
          </p>
        )}

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide block" style={{ color: 'hsl(var(--muted-foreground))' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Your username"
              autoComplete="username"
              className="w-full h-10 px-3 rounded-lg border text-sm outline-none"
              style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--input))', color: 'hsl(var(--foreground))' }}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide block" style={{ color: 'hsl(var(--muted-foreground))' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              className="w-full h-10 px-3 rounded-lg border text-sm outline-none"
              style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--input))', color: 'hsl(var(--foreground))' }}
            />
          </div>

          {isSignup && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide block" style={{ color: 'hsl(var(--muted-foreground))' }}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  className="w-full h-10 px-3 rounded-lg border text-sm outline-none"
                  style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--input))', color: 'hsl(var(--foreground))' }}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Verify you&apos;re human
            </p>
            <div className="flex gap-3 items-center">
              {captchaCode && (
                <button
                  type="button"
                  title="Click to refresh"
                  onClick={refreshCaptcha}
                  className="rounded-xl border overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ width: 150, height: 50, padding: 0, borderColor: 'hsl(var(--border))' }}
                  dangerouslySetInnerHTML={{ __html: buildCaptchaSVG(captchaCode) }}
                />
              )}
              <input
                type="text"
                value={captchaInput}
                onChange={e => setCaptchaInput(e.target.value)}
                placeholder="Enter code"
                maxLength={4}
                className="flex-1 h-[50px] px-3 rounded-xl border text-sm font-mono tracking-widest outline-none"
                style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
              />
            </div>
          </div>

          <button
            type="button"
            disabled={!captchaValid || loading}
            onClick={handleSubmit}
            className="w-full h-11 rounded-xl text-sm font-bold transition-all"
            style={{
              background: 'hsl(var(--foreground))',
              color: 'hsl(var(--background))',
              opacity: captchaValid && !loading ? 1 : 0.45,
              cursor: captchaValid && !loading ? 'pointer' : 'not-allowed',
            }}
          >
            {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Log In'}
          </button>
        </div>

        <p className="text-center text-sm mt-4" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {isSignup ? (
            <>
              Already have an account?{' '}
              <button
                onClick={() => switchView('login')}
                className="font-bold underline underline-offset-4 hover:opacity-70"
                style={{ color: 'hsl(var(--foreground))' }}
              >
                Login
              </button>
            </>
          ) : (
            <>
              Don&apos;t have an account?{' '}
              <button
                onClick={() => switchView('signup')}
                className="font-bold underline underline-offset-4 hover:opacity-70"
                style={{ color: 'hsl(var(--foreground))' }}
              >
                Sign up
              </button>
            </>
          )}
        </p>

        <div className="auth-divider mt-5">
          <div className="line" /><span>or continue with</span><div className="line" />
        </div>

        <button
          type="button"
          onClick={() => { if (typeof window !== 'undefined') window.handleGoogleOAuth?.(); }}
          className="btn-google mb-2"
        >
          <svg width="16" height="16" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          Continue with Google
        </button>

        <button
          type="button"
          onClick={() => { if (typeof window !== 'undefined') window.handleDiscordOAuth?.(); }}
          className="btn-discord"
        >
          <svg width="18" height="14" viewBox="0 0 71 55" fill="currentColor">
            <path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.3 37.3 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 4.9a.2.2 0 00-.1.1C1.5 18.7-.9 32.2.3 45.5v.1a58.7 58.7 0 0017.7 9 .2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.6 38.6 0 01-5.5-2.6.2.2 0 010-.4l1.1-.9a.2.2 0 01.2 0 41.9 41.9 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .3 36.3 36.3 0 01-5.5 2.7.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1A58.5 58.5 0 0070.3 45.6v-.1C71.7 30.1 67.8 16.7 60.2 5a.2.2 0 00-.1-.1zM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2zm23.7 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2z" />
          </svg>
          Continue with Discord
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProfileDropdown
// ---------------------------------------------------------------------------
function ProfileDropdown({ onClose }) {
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUsername(localStorage.getItem('authenticated_username') || '');
    }
  }, []);

  function handleLogout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bounty_token');
      localStorage.removeItem('authenticated_username');
      localStorage.removeItem('authenticated_email');
      localStorage.removeItem('auth_method');
      window.location.reload();
    }
  }

  const links = [
    { href: '/orders', label: 'Orders' },
    { href: '/dashboard', label: 'Seller Dashboard' },
    { href: '/deposit', label: 'Wallet' },
    { href: '/messages', label: 'Messages' },
    { href: '/become-a-seller', label: 'Become a Seller' },
    { href: '/account-settings', label: 'Account Settings' },
  ];

  return (
    <div
      className="absolute right-0 top-full mt-2 w-56 rounded-xl border shadow-2xl z-50 overflow-hidden"
      style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
        <div
          className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 border"
          style={{ background: 'hsl(var(--secondary))', borderColor: 'hsl(var(--border))' }}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'hsl(var(--foreground))' }}>{username}</p>
          <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>$0.00</p>
        </div>
      </div>
      <div className="flex gap-2 px-3 py-2 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
        <Link
          href="/deposit"
          onClick={onClose}
          className="flex-1 text-center text-xs font-semibold py-1.5 rounded-lg transition-opacity hover:opacity-80"
          style={{ background: 'hsl(var(--foreground))', color: 'hsl(var(--background))' }}
        >
          Deposit
        </Link>
        <button
          className="flex-1 text-xs font-semibold py-1.5 rounded-lg border transition-colors"
          style={{ borderColor: 'hsl(var(--border))' }}
        >
          Withdraw
        </button>
      </div>
      <div className="py-1">
        {links.map(({ href, label }) => (
          <Link key={href} href={href} onClick={onClose} className="dropdown-item block">
            {label}
          </Link>
        ))}
      </div>
      <div className="border-t py-1" style={{ borderColor: 'hsl(var(--border))' }}>
        <button onClick={handleLogout} className="dropdown-item w-full text-left" style={{ color: '#ef4444' }}>
          Log out
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LocalePanel
// ---------------------------------------------------------------------------
function LocalePanel({ onClose }) {
  const [lang, setLang] = useState('en');
  const [currency, setCurrency] = useState('USD');

  return (
    <div
      className="absolute right-0 top-full mt-2 w-52 rounded-xl border shadow-2xl z-50 p-4"
      style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
    >
      <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
        Language
      </label>
      <select
        value={lang}
        onChange={e => setLang(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 text-sm outline-none mb-3"
        style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
      >
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
        <option value="de">Deutsch</option>
        <option value="pt">Português</option>
        <option value="ja">Japanese</option>
      </select>
      <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
        Currency
      </label>
      <select
        value={currency}
        onChange={e => setCurrency(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 text-sm outline-none mb-3"
        style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
      >
        <option value="USD">USD - $</option>
        <option value="EUR">EUR - €</option>
        <option value="GBP">GBP - £</option>
        <option value="BRL">BRL - R$</option>
        <option value="JPY">JPY - ¥</option>
      </select>
      <button
        onClick={onClose}
        className="w-full rounded-lg py-1.5 text-sm font-semibold transition-opacity hover:opacity-80"
        style={{ background: 'hsl(var(--foreground))', color: 'hsl(var(--background))' }}
      >
        Save
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Layout
// ---------------------------------------------------------------------------
export default function Layout({ children }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalView, setModalView] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [openDd, setOpenDd] = useState(null);
  const [ddSearch, setDdSearch] = useState({});
  const [profileOpen, setProfileOpen] = useState(false);
  const [localeOpen, setLocaleOpen] = useState(false);
  const closeTimerRef = useRef(null);

  useEffect(() => {
    // OAuth token from query string
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
      window.history.replaceState({}, '', window.location.pathname);
      window.location.reload();
      return;
    }

    // Login state
    setIsLoggedIn(!!localStorage.getItem('bounty_token'));

    // Theme
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = saved === 'light' ? 'light' : (saved === 'dark' ? 'dark' : (prefersDark ? 'dark' : 'light'));
    setTheme(resolved);
    document.documentElement.classList.toggle('dark', resolved === 'dark');

    // Expose openModal globally for any legacy calls
    window.openModal = (view) => {
      setModalView(view || 'login');
      setModalOpen(true);
    };

    // Close panels on outside click
    const handleOutside = (e) => {
      if (!e.target.closest('[data-nav-panel]')) {
        setProfileOpen(false);
        setLocaleOpen(false);
      }
      if (!e.target.closest('[data-dd-area]')) {
        setOpenDd(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem('theme', next);
  }

  // Megadropdown hover
  function handleNavEnter(cat) {
    if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
    setOpenDd(cat);
  }
  function scheduleClose() {
    closeTimerRef.current = setTimeout(() => setOpenDd(null), 150);
  }
  function cancelClose() {
    if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
  }

  function openModal(view) {
    setModalView(view || 'login');
    setModalOpen(true);
  }

  return (
    <>
      {/* TOP BAR */}
      <div
        className="border-b text-xs"
        style={{ background: 'hsl(var(--topbar))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--topbar-foreground))' }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-1.5">
          <div className="flex items-center gap-1.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
            <span>24/7 Live Support</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Locale */}
            <div className="relative" data-nav-panel>
              <button
                onClick={() => setLocaleOpen(v => !v)}
                className="flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span>EN</span><span className="opacity-40 mx-0.5">|</span><span>USD - $</span>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {localeOpen && <LocalePanel onClose={() => setLocaleOpen(false)} />}
            </div>

            {/* Theme toggle */}
            <button onClick={toggleTheme} aria-label="Toggle theme" className="hover:opacity-80 transition-opacity cursor-pointer">
              {theme === 'dark' ? (
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              ) : (
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9" /><path d="M20 3v4M22 5h-4" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MAIN NAV */}
      <nav
        className="sticky top-0 z-40 border-b"
        style={{ background: 'hsl(var(--nav))', borderColor: 'hsl(var(--border))' }}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-0.5 px-6 py-3" data-dd-area>
          {/* Logo */}
          <Link
            href="/"
            className="shrink-0 font-black text-2xl mr-5 hover:opacity-80 transition-opacity"
            style={{ fontFamily: "'Doto', sans-serif", color: 'hsl(var(--foreground))' }}
          >
            Bounty
          </Link>

          <Link href="/browse" className="nav-link">Browse</Link>

          {/* Category nav with megadropdowns */}
          {CATEGORY_KEYS.map(cat => (
            <div
              key={cat}
              className="relative"
              onMouseEnter={() => handleNavEnter(cat)}
              onMouseLeave={scheduleClose}
            >
              <button className="nav-link flex items-center gap-1">
                {cat}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {openDd === cat && (
                <div
                  className="absolute left-0 top-full mt-1 z-50 rounded-2xl border shadow-2xl overflow-hidden"
                  style={{ width: 700, background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                  onMouseEnter={cancelClose}
                  onMouseLeave={scheduleClose}
                >
                  <MegaDropdown
                    cat={cat}
                    searchVal={ddSearch[cat] || ''}
                    onSearchChange={val => setDdSearch(prev => ({ ...prev, [cat]: val }))}
                  />
                </div>
              )}
            </div>
          ))}

          {/* Right side */}
          <div className="ml-auto flex items-center gap-2">
            {/* Search bar */}
            <div
              className="hidden lg:flex items-center rounded-lg border px-3 py-1.5 gap-2 w-44"
              style={{ background: 'hsl(var(--secondary))', borderColor: 'hsl(var(--border))' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'hsl(var(--muted-foreground))', flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none text-sm w-full"
                style={{ color: 'hsl(var(--foreground))' }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    window.location.href = '/browse?q=' + encodeURIComponent(e.currentTarget.value);
                  }
                }}
              />
            </div>

            {!isLoggedIn ? (
              <div className="flex items-center gap-2">
                {/* Log In — transparent, no border */}
                <button
                  onClick={() => openModal('login')}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  style={{ background: 'transparent', color: 'hsl(var(--foreground))' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'hsl(var(--secondary))'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  Log In
                </button>

                {/* Discord */}
                <a
                  href="https://discord.com/invite/jyrkFzG7Qs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-85"
                  style={{ background: '#5865F2', color: '#fff' }}
                >
                  <svg width="16" height="12" viewBox="0 0 71 55" fill="currentColor">
                    <path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.3 37.3 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 4.9a.2.2 0 00-.1.1C1.5 18.7-.9 32.2.3 45.5v.1a58.7 58.7 0 0017.7 9 .2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.6 38.6 0 01-5.5-2.6.2.2 0 010-.4l1.1-.9a.2.2 0 01.2 0 41.9 41.9 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .3 36.3 36.3 0 01-5.5 2.7.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1A58.5 58.5 0 0070.3 45.6v-.1C71.7 30.1 67.8 16.7 60.2 5a.2.2 0 00-.1-.1zM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2zm23.7 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2z" />
                  </svg>
                  Join Discord
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-1.5" data-nav-panel>
                <Link href="/messages" className="nav-icon-btn" title="Messages">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </Link>
                <button className="nav-icon-btn" title="Notifications">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                </button>
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(v => !v)}
                    className="h-8 w-8 rounded-full border overflow-hidden flex items-center justify-center transition-colors"
                    style={{ background: 'hsl(var(--secondary))', borderColor: 'hsl(var(--border))' }}
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  </button>
                  {profileOpen && <ProfileDropdown onClose={() => setProfileOpen(false)} />}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <main>{children}</main>

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={modalOpen}
        initialView={modalView}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}