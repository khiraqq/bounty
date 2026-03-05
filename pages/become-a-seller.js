import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { initApp, exposeToWindow } from '../utils/auth';

// ── SVG icons ─────────────────────────────────────────────────────────────────

function IcoSun() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function IcoMoon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9" /><path d="M20 3v4" /><path d="M22 5h-4" />
    </svg>
  );
}

function IcoCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IcoShield() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IcoDollar() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function IcoGlobe() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function IcoTrophy() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="8 21 12 17 16 21 8 21" /><line x1="12" y1="17" x2="12" y2="11" />
      <path d="M5 4H3a2 2 0 0 0 0 4h2" /><path d="M19 4h2a2 2 0 0 0 0 4h-2" />
      <rect x="5" y="2" width="14" height="12" rx="2" />
    </svg>
  );
}

function IcoArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

// ── constants ─────────────────────────────────────────────────────────────────

const GAMES = [
  'World of Warcraft', 'Final Fantasy XIV', 'Runescape', 'Path of Exile',
  'Diablo IV', 'Lost Ark', 'Elder Scrolls Online', 'New World',
  'Guild Wars 2', 'Black Desert Online', 'Albion Online', 'Destiny 2',
  'Fortnite', 'Apex Legends', 'Valorant', 'League of Legends',
  'Rocket League', 'FIFA / FC', 'NBA 2K', 'Other',
];

const CATEGORIES = [
  'Currency / Gold', 'Power Leveling', 'Accounts', 'Items & Equipment',
  'Boosting Services', 'Top Ups', 'Gift Cards', 'Other',
];

const DELIVERY_TIMES = ['Instant', '1-6 hours', '6-24 hours', '1-3 days', '3-7 days'];

const BENEFITS = [
  { icon: IcoShield, title: 'Secure Payments', desc: 'All transactions are protected by our escrow system. Get paid instantly after delivery is confirmed.' },
  { icon: IcoDollar, title: 'Low Fees', desc: 'We charge only a small fee per transaction. No monthly costs, no hidden charges.' },
  { icon: IcoGlobe, title: 'Global Reach', desc: 'Connect with buyers from all over the world. Our platform is available 24/7 in every timezone.' },
  { icon: IcoTrophy, title: 'Seller Levels', desc: 'Build your reputation and unlock better visibility, lower fees, and exclusive seller perks.' },
];

const STEPS = [
  { n: '1', title: 'Create your listing', desc: 'Tell buyers what you sell — game, category, price, and delivery time.' },
  { n: '2', title: 'Receive orders', desc: 'Buyers find you through search and listings. Accept orders you can fulfill.' },
  { n: '3', title: 'Deliver & get paid', desc: 'Complete the order, confirm delivery, and funds are released to your wallet instantly.' },
];

const PAGE_STYLES = `
  :root{--brand:#6c47ff;--brand-hover:#5835e0}
  .seller-input{width:100%;height:2.5rem;padding:0 .75rem;border-radius:.5rem;background:hsl(var(--background));border:1px solid hsl(var(--input));color:hsl(var(--foreground));font-size:.875rem;outline:none;transition:border-color .2s}
  .seller-input:focus{border-color:hsl(var(--ring))}
  .seller-select{width:100%;height:2.5rem;padding:0 2.5rem 0 .75rem;border-radius:.5rem;background:hsl(var(--background));border:1px solid hsl(var(--input));color:hsl(var(--foreground));font-size:.875rem;outline:none;appearance:none;background-image:url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");background-position:right .5rem center;background-repeat:no-repeat;background-size:1.5em 1.5em;cursor:pointer}
  .seller-select:focus{border-color:hsl(var(--ring))}
  .seller-textarea{width:100%;padding:.625rem .75rem;border-radius:.5rem;background:hsl(var(--background));border:1px solid hsl(var(--input));color:hsl(var(--foreground));font-size:.875rem;outline:none;resize:vertical;min-height:90px;font-family:inherit}
  .seller-textarea:focus{border-color:hsl(var(--ring))}
  .game-tag{display:inline-flex;align-items:center;gap:.375rem;padding:.25rem .75rem;border-radius:9999px;font-size:.8125rem;font-weight:500;border:1px solid hsl(var(--border));cursor:pointer;transition:all .15s;user-select:none;background:transparent;color:hsl(var(--foreground))}
  .game-tag.selected{background:#6c47ff;border-color:#6c47ff;color:#fff}
  .submit-btn{display:flex;align-items:center;justify-content:center;gap:.5rem;width:100%;height:2.75rem;border-radius:.5rem;font-size:1rem;font-weight:700;color:#fff;background:linear-gradient(135deg,#6c47ff,#5835e0);border:none;cursor:pointer;transition:opacity .15s,transform .1s;box-shadow:0 4px 15px rgba(108,71,255,.4)}
  .submit-btn:hover{opacity:.92}.submit-btn:active{transform:scale(.98)}.submit-btn:disabled{opacity:.6;cursor:not-allowed}
  .benefit-card{padding:1.5rem;border-radius:.875rem;border:1px solid hsl(var(--border));background:hsl(var(--card));transition:border-color .2s,box-shadow .2s}
  .benefit-card:hover{border-color:rgba(108,71,255,.4);box-shadow:0 4px 20px rgba(108,71,255,.1)}
  .step-circle{width:40px;height:40px;border-radius:9999px;background:linear-gradient(135deg,#6c47ff,#5835e0);color:#fff;font-size:1.125rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .hero-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:9999px;font-size:.8125rem;font-weight:600;background:rgba(108,71,255,.12);color:#a78bfa;border:1px solid rgba(108,71,255,.25)}
  .error-box{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#ef4444;padding:.75rem 1rem;border-radius:.5rem;font-size:.875rem}
  .success-box{background:rgba(22,163,74,.1);border:1px solid rgba(22,163,74,.3);color:#16a34a;padding:.75rem 1rem;border-radius:.5rem;font-size:.875rem;display:flex;align-items:center;gap:.5rem}
  .stat-card{text-align:center;padding:1.5rem 1rem;border-radius:.875rem;border:1px solid hsl(var(--border));background:hsl(var(--card))}
`;

export default function BecomeASeller() {
  const [step, setStep] = useState(1);
  const [selectedGames, setSelectedGames] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [formData, setFormData] = useState({ displayName: '', description: '', pricePerUnit: '', currency: 'Gold', minOrder: '1', maxOrder: '10000', deliveryTime: '1-6 hours' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(function () {
    exposeToWindow();
    initApp();
  }, []);

  function toggleGame(g) {
    setSelectedGames(function (prev) {
      return prev.includes(g) ? prev.filter(function (x) { return x !== g; }) : [...prev, g];
    });
  }

  function toggleCategory(c) {
    setSelectedCategories(function (prev) {
      return prev.includes(c) ? prev.filter(function (x) { return x !== c; }) : [...prev, c];
    });
  }

  function handleChange(e) {
    var name = e.target.name;
    var value = e.target.value;
    setFormData(function (prev) { return Object.assign({}, prev, { [name]: value }); });
  }

  async function handleSubmit() {
    setError('');
    if (!formData.displayName.trim()) { setError('Display name is required.'); return; }
    if (selectedGames.length === 0) { setError('Please select at least one game.'); return; }
    if (!formData.pricePerUnit || isNaN(Number(formData.pricePerUnit)) || Number(formData.pricePerUnit) <= 0) {
      setError('Please enter a valid price per unit.'); return;
    }
    setLoading(true);
    try {
      var token = '';
      try { token = localStorage.getItem('bounty_token') || ''; } catch (_) {}
      var res = await fetch('/api/seller/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({
          displayName: formData.displayName.trim(),
          description: formData.description.trim(),
          games: selectedGames,
          categories: selectedCategories,
          pricePerUnit: Number(formData.pricePerUnit),
          currency: formData.currency,
          minOrder: Number(formData.minOrder) || 1,
          maxOrder: Number(formData.maxOrder) || 10000,
          deliveryTime: formData.deliveryTime,
        }),
      });
      var data = await res.json();
      if (!res.ok) { setError(data.message || 'Something went wrong. Please try again.'); return; }
      setSuccess(true);
    } catch (_) {
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <>
        <Head>
          <title>Become a Seller - Bounty</title>
          <link rel="stylesheet" href="/css/styles.css" />
          <style dangerouslySetInnerHTML={{ __html: PAGE_STYLES }} />
        </Head>
        <nav className="bg-nav border-b border-border/40">
          <div className="mx-auto flex max-w-7xl items-center px-4 py-3">
            <Link href="/" className="font-bold text-xl text-nav-foreground" style={{ fontFamily: "'Doto',sans-serif" }}>Bounty</Link>
          </div>
        </nav>
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(22,163,74,.15)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Doto',monospace" }}>You're a Seller!</h1>
          <p className="text-muted-foreground mb-6 text-sm">Your seller profile has been created. You can now create listings and start receiving orders.</p>
          <div className="flex flex-col gap-3">
            <Link href="/" className="submit-btn">Go to Marketplace</Link>
            <Link href="/account-settings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Manage your profile</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Become a Seller - Bounty</title>
        <link rel="stylesheet" href="/css/styles.css" />
        <style dangerouslySetInnerHTML={{ __html: PAGE_STYLES }} />
      </Head>

      {/* NAV */}
      <nav className="bg-nav border-b border-border/40">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3 gap-4">
          <Link href="/" className="font-bold text-xl text-nav-foreground" style={{ fontFamily: "'Doto',sans-serif" }}>Bounty</Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">Become a Seller</span>
          <div className="ml-auto">
            <button id="theme-toggle" onClick={function () { window.toggleTheme && window.toggleTheme(); }} className="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-accent transition-colors" aria-label="Toggle theme">
              <span className="dark:hidden"><IcoSun /></span>
              <span className="hidden dark:inline"><IcoMoon /></span>
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div className="border-b border-border" style={{ background: 'linear-gradient(135deg, rgba(108,71,255,.08) 0%, transparent 60%)' }}>
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="text-center mb-12">
            <div className="hero-badge mb-4">
              <IcoCheck /> Trusted by 50,000+ sellers worldwide
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ fontFamily: "'Doto',monospace" }}>
              Sell on Bounty
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Join thousands of gamers making real money selling in-game currency, accounts, items and services.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[['$2M+', 'Paid out monthly'], ['50K+', 'Active sellers'], ['200+', 'Games supported'], ['24/7', 'Live support']].map(function (s) {
              return (
                <div key={s[0]} className="stat-card">
                  <p className="text-2xl font-extrabold" style={{ color: '#6c47ff' }}>{s[0]}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{s[1]}</p>
                </div>
              );
            })}
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {BENEFITS.map(function (b) {
              var IconComp = b.icon;
              return (
                <div key={b.title} className="benefit-card">
                  <div className="mb-3" style={{ color: '#6c47ff' }}><IconComp /></div>
                  <h3 className="font-bold mb-1.5 text-sm">{b.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>

          {/* How it works */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-center mb-6">How it works</h2>
            <div className="flex flex-col md:flex-row gap-4">
              {STEPS.map(function (s, i) {
                return (
                  <div key={s.n} className="flex items-start gap-4 flex-1">
                    <div className="step-circle">{s.n}</div>
                    <div className="pt-1">
                      <p className="font-bold text-sm mb-1">{s.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="hidden md:flex items-center self-center opacity-30"><IcoArrowRight /></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* FORM */}
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-2" style={{ fontFamily: "'Doto',monospace" }}>Create your seller profile</h2>
        <p className="text-sm text-muted-foreground text-center mb-8">Fill in the details below and start selling within minutes.</p>

        {error && <div className="error-box mb-4">{error}</div>}

        <div className="flex flex-col gap-5">

          {/* Display name */}
          <div>
            <label className="text-sm font-semibold block mb-1.5">Display Name <span className="text-red-400">*</span></label>
            <input name="displayName" type="text" value={formData.displayName} onChange={handleChange} placeholder="e.g. FastGoldKing" className="seller-input" />
            <p className="text-xs text-muted-foreground mt-1">This is the name buyers will see on your listings.</p>
          </div>

          {/* About */}
          <div>
            <label className="text-sm font-semibold block mb-1.5">About your shop</label>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Tell buyers about yourself — your experience, the games you play, how fast you deliver..." className="seller-textarea" />
          </div>

          {/* Games */}
          <div>
            <label className="text-sm font-semibold block mb-2">Games you sell for <span className="text-red-400">*</span></label>
            <div className="flex flex-wrap gap-2">
              {GAMES.map(function (g) {
                return (
                  <button key={g} type="button" className={'game-tag' + (selectedGames.includes(g) ? ' selected' : '')} onClick={function () { toggleGame(g); }}>
                    {selectedGames.includes(g) && <IcoCheck />}
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="text-sm font-semibold block mb-2">Service categories</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(function (c) {
                return (
                  <button key={c} type="button" className={'game-tag' + (selectedCategories.includes(c) ? ' selected' : '')} onClick={function () { toggleCategory(c); }}>
                    {selectedCategories.includes(c) && <IcoCheck />}
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold block mb-1.5">Price per unit (USD) <span className="text-red-400">*</span></label>
              <input name="pricePerUnit" type="number" min="0.001" step="0.001" value={formData.pricePerUnit} onChange={handleChange} placeholder="e.g. 0.0025" className="seller-input" />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1.5">Currency unit name</label>
              <input name="currency" type="text" value={formData.currency} onChange={handleChange} placeholder="e.g. Gold, Coins, Credits" className="seller-input" />
            </div>
          </div>

          {/* Order limits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold block mb-1.5">Minimum order</label>
              <input name="minOrder" type="number" min="1" value={formData.minOrder} onChange={handleChange} className="seller-input" />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1.5">Maximum order</label>
              <input name="maxOrder" type="number" min="1" value={formData.maxOrder} onChange={handleChange} className="seller-input" />
            </div>
          </div>

          {/* Delivery time */}
          <div>
            <label className="text-sm font-semibold block mb-1.5">Typical delivery time</label>
            <select name="deliveryTime" value={formData.deliveryTime} onChange={handleChange} className="seller-select">
              {DELIVERY_TIMES.map(function (d) {
                return <option key={d} value={d}>{d}</option>;
              })}
            </select>
          </div>

          {/* Terms */}
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground leading-relaxed">
            By creating a seller account you agree to Bounty's{' '}
            <a href="#" className="underline text-foreground">Seller Terms</a>,{' '}
            <a href="#" className="underline text-foreground">Acceptable Use Policy</a>, and{' '}
            <a href="#" className="underline text-foreground">Privacy Policy</a>. Bounty charges a 5% fee on all completed transactions.
          </div>

          <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <span style={{ display: 'inline-block', width: 18, height: 18, border: '2.5px solid rgba(255,255,255,.35)', borderTopColor: '#fff', borderRadius: '9999px', animation: 'spin .7s linear infinite' }} />
            ) : (
              <>Start Selling on Bounty <IcoArrowRight /></>
            )}
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: '@keyframes spin{to{transform:rotate(360deg)}}' }} />
    </>
  );
}
