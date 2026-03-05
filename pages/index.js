import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { exposeToWindow, initApp } from '../utils/auth';

export default function Home() {
  useEffect(() => {
    exposeToWindow();
    initApp();
    // Handle OAuth callback token in URL params
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

      {/* ── TOP BAR ─────────────────────────────────────────────────────────── */}
      <div className="bg-topbar text-topbar-foreground text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5">
          <div />
          <div className="flex items-center gap-1">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
            <span>24/7 Live Support</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Locale dropdown */}
            <div className="relative" id="locale-dropdown">
              <button onClick={() => window.toggleLocaleDropdown?.()} className="flex items-center gap-1 hover:text-nav-foreground transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                <span id="current-language">English</span><span className="mx-0.5">|</span><span id="current-currency">USD - $</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <div id="locale-panel" className="hidden absolute right-0 top-full mt-2 w-72 rounded-lg border border-zinc-700 bg-zinc-800 p-4 shadow-xl z-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-zinc-200">Language &amp; Currency</span>
                  <button onClick={() => window.toggleLocaleDropdown?.()} className="text-zinc-400 hover:text-zinc-200"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                </div>
                <label className="mb-1 block text-xs font-medium text-zinc-300">Language</label>
                <select id="language-select" className="w-full rounded-md border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-zinc-200 outline-none mb-3">
                  <option value="en">English (EN)</option><option value="es">Español (ES)</option><option value="fr">Français (FR)</option><option value="de">Deutsch (DE)</option><option value="pt">Português (PT)</option><option value="ja">日本語 (JA)</option><option value="ru">Русский (RU)</option>
                </select>
                <label className="mb-1 block text-xs font-medium text-zinc-300">Currency</label>
                <select id="currency-select" className="w-full rounded-md border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-zinc-200 outline-none mb-4">
                  <option value="USD">USD - $</option><option value="EUR">EUR - €</option><option value="GBP">GBP - £</option><option value="BRL">BRL - R$</option><option value="JPY">JPY - ¥</option>
                </select>
                <button onClick={() => window.saveLocaleSettings?.()} className="w-full rounded-md py-2 text-sm font-semibold text-white zinc-btn">Save</button>
                <button onClick={() => window.toggleLocaleDropdown?.()} className="mt-2 w-full text-center text-xs text-zinc-400 hover:text-zinc-200 transition-colors">Cancel</button>
              </div>
            </div>
            {/* Theme toggle */}
            <button id="theme-toggle" onClick={() => window.toggleTheme?.()} aria-label="Toggle theme">
              <svg className="h-4 w-4 dark:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
              <svg className="h-4 w-4 hidden dark:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9"/><path d="M20 3v4"/><path d="M22 5h-4"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN NAV ────────────────────────────────────────────────────────── */}
      <nav className="bg-nav">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-2">
          <Link href="/" className="flex shrink-0 items-center text-nav-foreground font-bold text-2xl" style={{ fontFamily: "'Doto',sans-serif" }}>Bounty</Link>
          <div className="ml-auto hidden md:flex items-center gap-6">
            <Link href="/browse?category=Currency" className="text-sm font-medium text-nav-foreground/80 hover:text-nav-foreground transition-colors">Currency</Link>
            <Link href="/browse?category=Accounts" className="text-sm font-medium text-nav-foreground/80 hover:text-nav-foreground transition-colors">Accounts</Link>
            <Link href="/browse?category=Top Ups" className="text-sm font-medium text-nav-foreground/80 hover:text-nav-foreground transition-colors">Top Ups</Link>
            <Link href="/browse?category=Items" className="text-sm font-medium text-nav-foreground/80 hover:text-nav-foreground transition-colors">Items</Link>
            <Link href="/browse?category=Boosting" className="text-sm font-medium text-nav-foreground/80 hover:text-nav-foreground transition-colors">Boosting</Link>
            <Link href="/browse?category=Gift Cards" className="text-sm font-medium text-nav-foreground/80 hover:text-nav-foreground transition-colors">Gift Cards</Link>
            <Link href="/become-a-seller" className="text-sm font-semibold px-3 py-1.5 rounded-md" style={{ background: 'rgba(108,71,255,0.1)', color: '#a78bfa', border: '1px solid rgba(108,71,255,0.2)' }}>Sell on Bounty</Link>
          </div>
          <div className="ml-8 hidden md:flex items-center gap-3">
            <div className="flex items-center rounded-md bg-nav-foreground/10 px-3 py-1.5 text-sm text-nav-foreground/60 gap-2 w-48">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <span>Search Bounty</span>
            </div>
            {/* Login button — hidden when logged in */}
            <button id="login-button" onClick={() => window.openModal?.('login')} className="rounded-md border border-nav-foreground/20 bg-transparent px-4 py-1.5 text-sm font-medium text-nav-foreground/60 hover:text-nav-foreground hover:border-nav-foreground/40 transition">Log in</button>
            {/* Profile area — hidden when logged out */}
            <div id="profile-area" className="hidden items-center gap-2">
              <button className="nav-icon-btn" title="Switch account">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/></svg>
              </button>
              <Link href="/messages" className="nav-icon-btn" title="Messages">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </Link>
              <button className="nav-icon-btn relative" title="Notifications">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                <span id="notification-badge" className="hidden absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold leading-none rounded-full min-w-[14px] h-3.5 px-1 flex items-center justify-center pointer-events-none" />
              </button>
              <div className="relative">
                <button id="profile-button" type="button" aria-label="Open profile" onClick={() => window.toggleProfileDropdown?.()} className="h-8 w-8 rounded-full flex items-center justify-center overflow-hidden transition-colors duration-200">
                  <div id="profile-avatar" className="w-full h-full rounded-full flex items-center justify-center" style={{ backgroundColor: '#0a0a0a', color: '#fff', border: '1px solid #27272a' }}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                </button>
                {/* Profile dropdown */}
                <div id="profile-dropdown" className="hidden absolute right-0 top-full mt-2 w-56 rounded-lg border border-border bg-card shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                    <div id="dropdown-avatar" className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200" style={{ backgroundColor: '#0a0a0a', color: '#fff', border: '1px solid #27272a' }}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div className="min-w-0">
                      <p id="dropdown-username" className="text-sm font-semibold text-foreground truncate" />
                      <p className="text-xs text-muted-foreground">$0.00</p>
                      <p className="text-xs font-medium" style={{ color: '#f59e0b' }}>⬡ Bronze Rank</p>
                    </div>
                  </div>
                  <div className="flex gap-2 px-3 py-2 border-b border-border">
                    <Link href="/deposit" className="flex-1 text-center text-xs font-semibold py-1.5 rounded-md" style={{ background: '#16a34a', color: 'white' }}>Deposit</Link>
                    <button className="flex-1 text-xs font-semibold py-1.5 rounded-md border border-border hover:bg-accent transition-colors">Withdraw</button>
                  </div>
                  <div className="py-1">
                    <Link href="/orders" className="dropdown-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>Orders</Link>
                    <Link href="/dashboard" className="dropdown-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>Seller Dashboard</Link>
                    <a href="#" className="dropdown-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>Boosting</a>
                    <a href="#" className="dropdown-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>Loyalty <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: '#10b981', color: 'white' }}>BETA</span></a>
                    <Link href="/deposit" className="dropdown-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>Wallet</Link>
                    <Link href="/messages" className="dropdown-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Messages</Link>
                    <Link href="/become-a-seller" className="dropdown-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Become a Seller</Link>
                    <a href="#" className="dropdown-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>Notifications</a>
                    <a href="#" className="dropdown-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Feedback</a>
                    <Link href="/account-settings" className="dropdown-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 0 0 4.93 19.07"/><path d="M4.93 4.93A10 10 0 0 1 19.07 19.07"/></svg>Account settings</Link>
                  </div>
                  <div className="border-t border-border py-1">
                    <button onClick={() => { window.logout?.(); window.closeProfileDropdown?.(); }} className="dropdown-item w-full text-left" style={{ color: '#ef4444' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Log out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ── BANNER AD ───────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-2">
        <video src="https://res.cloudinary.com/dncnkyqne/video/upload/v1771817469/AdBanner.gif_o6cd6a.mp4" autoPlay loop muted playsInline className="w-full h-[35px] sm:h-[42px] object-cover rounded-sm" />
      </div>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="hero-glow relative py-20 px-4 text-center overflow-hidden">
        <div className="mx-auto max-w-3xl relative z-10">
          <span className="trust-badge mb-6 inline-flex">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Trusted by 50,000+ traders worldwide
          </span>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4" style={{ lineHeight: 1.08 }}>
            The #1 Gaming<br />
            <span style={{ background: 'linear-gradient(135deg,#6c47ff,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Marketplace</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">Buy and sell gaming currency, accounts, items and services. Secure escrow, instant delivery, 24/7 support.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button onClick={() => document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' })} className="btn-primary">Browse Listings</button>
            <Link href="/become-a-seller"><button className="btn-outline">Start Selling</button></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14">
            {[['$2M+','Paid to Sellers'],['50K+','Active Sellers'],['200+','Games Supported'],['4.9★','Avg Rating']].map(function(s) { return (
              <div key={s[0]} className="stat-box">
                <div className="text-2xl font-black" style={{ color: 'var(--brand)' }}>{s[0]}</div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">{s[1]}</div>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────────── */}
      <section className="py-14 px-4 border-t" style={{ borderColor: 'hsl(var(--border)/0.5)' }}>
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black mb-2">Why choose Bounty?</h2>
            <p className="text-muted-foreground">The safest and most reliable platform for gaming transactions.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: 'Secure Escrow', desc: 'Funds held safely until delivery confirmed. 100% buyer protection on every trade.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
              { title: 'Low Fees', desc: 'Competitive rates, no hidden costs. Keep more of what you earn as a seller.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> },
              { title: 'Global Reach', desc: 'Available 24/7 worldwide. Connect with buyers and sellers across the globe.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
              { title: '24/7 Support', desc: 'Our team is always here to help resolve any issues quickly and professionally.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg> },
            ].map(function(f) { return (
              <div key={f.title} className="feature-box">
                <div className="icon-box mb-4">{f.icon}</div>
                <h3 className="font-bold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* ── MARKETPLACE LISTINGS ────────────────────────────────────────────── */}
      <section id="marketplace" className="py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black">Browse Listings</h2>
            <select className="sort-select" onChange={function(e) { sortListings(e.target.value); }}>
              <option value="">Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
          {/* Game tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5" id="game-tabs" style={{ scrollbarWidth: 'none' }}>
            {['All Games','World of Warcraft','OSRS','Path of Exile','Final Fantasy XIV','Diablo IV','Lost Ark','Fortnite','Valorant','Rocket League','FIFA','NBA 2K','Apex Legends'].map(function(g, i) { return (
              <button key={g} className={'game-tab' + (i === 0 ? ' active' : '')} onClick={function(e) { filterGame(e.target, g === 'All Games' ? '' : g); }}>{g}</button>
            ); })}
          </div>
          {/* Category pills */}
          <div className="flex flex-wrap items-center gap-2 mb-6" id="cat-filters">
            {['All','Currency','Accounts','Power Leveling','Items','Boosting','Top Ups'].map(function(c, i) { return (
              <button key={c} className={'filter-pill' + (i === 0 ? ' active' : '')} onClick={function(e) { filterCategory(e.target, c === 'All' ? '' : c); }}>{c}</button>
            ); })}
          </div>
          {/* Listings grid */}
          <div id="listings-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="col-span-full text-center py-16 text-muted-foreground">
              <div className="auth-spinner mx-auto mb-3" style={{ borderTopColor: 'var(--brand)' }} />
              <p>Loading listings…</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── AUTH MODAL ──────────────────────────────────────────────────────── */}
      <div id="modal-overlay" className="hidden fixed inset-0 z-50 flex items-center justify-center" onClick={function(e) { window.handleOverlayClick?.(e); }}>
        <div id="modal-backdrop" className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative z-10 w-full max-w-md mx-4 bg-card text-card-foreground rounded-xl p-8 shadow-2xl border border-border" onClick={function(e) { e.stopPropagation(); }}>
          <button type="button" onClick={() => window.closeModal?.()} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          {/* LOGIN */}
          <div id="login-modal">
            <h2 className="text-2xl font-bold text-center mb-1" style={{ fontFamily: "'Doto',monospace" }}>Welcome back</h2>
            <p className="text-sm text-muted-foreground text-center mb-6" style={{ fontFamily: "'Doto',monospace" }}>Sign in to your Bounty account</p>
            <p id="login-error" className="hidden text-sm text-red-500 mb-4 text-center rounded-md bg-red-500/10 px-3 py-2" />
            <form id="login-form" className="space-y-3" onSubmit={function(e) { window.handleLoginSubmit?.(e); }}>
              <div><label htmlFor="login-username" className="text-sm font-medium select-none block mb-1.5">Username</label><input id="login-username" type="text" placeholder="Your username" autoComplete="username" className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" /></div>
              <div><label htmlFor="login-password" className="text-sm font-medium select-none block mb-1.5">Password</label><input id="login-password" type="password" placeholder="Your password" autoComplete="current-password" className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" /></div>
              <button id="login-submit-btn" type="submit" className="btn-brand mt-1">Login</button>
            </form>
            <div className="auth-divider"><div className="line" /><span>or continue with</span><div className="line" /></div>
            <button type="button" onClick={() => window.handleGoogleOAuth?.()} className="btn-google mb-2">
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              Continue with Google
            </button>
            <button type="button" onClick={() => window.handleDiscordOAuth?.()} className="btn-discord">
              <svg width="18" height="14" viewBox="0 0 71 55" fill="currentColor"><path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.3 37.3 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 4.9a.2.2 0 00-.1.1C1.5 18.7-.9 32.2.3 45.5v.1a58.7 58.7 0 0017.7 9 .2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.6 38.6 0 01-5.5-2.6.2.2 0 010-.4l1.1-.9a.2.2 0 01.2 0 41.9 41.9 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .3 36.3 36.3 0 01-5.5 2.7.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1A58.5 58.5 0 0070.3 45.6v-.1C71.7 30.1 67.8 16.7 60.2 5a.2.2 0 00-.1-.1zM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2zm23.7 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2z"/></svg>
              Register with Discord
            </button>
            <p className="text-center text-sm mt-5 text-muted-foreground">Don&apos;t have an account? <button type="button" onClick={() => window.switchView?.('signup')} className="text-foreground underline font-medium hover:text-foreground/80">Sign up</button></p>
          </div>
          {/* SIGNUP */}
          <div id="signup-modal" className="hidden">
            <h2 className="text-2xl font-bold text-center mb-1" style={{ fontFamily: "'Doto',monospace" }}>Create an account</h2>
            <p className="text-sm text-muted-foreground text-center mb-6" style={{ fontFamily: "'Doto',monospace" }}>Enter your details to create a new account</p>
            <p id="signup-error" className="hidden text-sm text-red-500 mb-4 text-center rounded-md bg-red-500/10 px-3 py-2" />
            <form id="signup-form" className="space-y-3" onSubmit={function(e) { window.handleSignupSubmit?.(e); }}>
              <div><label htmlFor="signup-username" className="text-sm font-medium select-none block mb-1.5">Username</label><input id="signup-username" type="text" placeholder="Your username" autoComplete="username" className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" /></div>
              <div><label htmlFor="signup-email" className="text-sm font-medium select-none block mb-1.5">Email address</label><input id="signup-email" type="email" placeholder="you@example.com" autoComplete="email" className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" /></div>
              <div><label htmlFor="signup-password" className="text-sm font-medium select-none block mb-1.5">Password</label><input id="signup-password" type="password" placeholder="Your password" autoComplete="new-password" className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" /></div>
              <div><label htmlFor="signup-confirm-password" className="text-sm font-medium select-none block mb-1.5">Confirm Password</label><input id="signup-confirm-password" type="password" placeholder="Confirm your password" autoComplete="new-password" className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" /></div>
              <button id="signup-submit-btn" type="submit" className="btn-brand mt-1">Sign Up</button>
            </form>
            <div className="auth-divider"><div className="line" /><span>or register with</span><div className="line" /></div>
            <button type="button" onClick={() => window.handleGoogleOAuth?.()} className="btn-google mb-2">
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              Continue with Google
            </button>
            <button type="button" onClick={() => window.handleDiscordOAuth?.()} className="btn-discord">
              <svg width="18" height="14" viewBox="0 0 71 55" fill="currentColor"><path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.3 37.3 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 4.9a.2.2 0 00-.1.1C1.5 18.7-.9 32.2.3 45.5v.1a58.7 58.7 0 0017.7 9 .2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.6 38.6 0 01-5.5-2.6.2.2 0 010-.4l1.1-.9a.2.2 0 01.2 0 41.9 41.9 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .3 36.3 36.3 0 01-5.5 2.7.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1A58.5 58.5 0 0070.3 45.6v-.1C71.7 30.1 67.8 16.7 60.2 5a.2.2 0 00-.1-.1zM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2zm23.7 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2z"/></svg>
              Continue with Discord
            </button>
            <p className="text-center text-sm mt-5 text-muted-foreground">Already have an account? <button type="button" onClick={() => window.switchView?.('login')} className="text-foreground underline font-medium hover:text-foreground/80">Login</button></p>
          </div>
        </div>
      </div>

      {/* ── POPULAR GAMES ─────────────────────────────────────────────────── */}
      <section className="py-14 px-4 border-t" style={{ borderColor: 'hsl(var(--border)/0.5)' }}>
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black mb-2">Popular Games</h2>
            <p className="text-muted-foreground">Thousands of listings across the most popular titles</p>
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
            ].map(function(g) { return (
              <a key={g.name} href={'/browse?game=' + encodeURIComponent(g.name)} className="game-tile">
                <div className="text-2xl mb-2">{g.emoji}</div>
                <div className="text-xs font-bold leading-tight text-center">{g.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{g.listings} offers</div>
              </a>
            ); })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="py-14 px-4 border-t" style={{ borderColor: 'hsl(var(--border)/0.5)', background: 'hsl(var(--card)/0.4)' }}>
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-black mb-2">How Bounty Works</h2>
          <p className="text-muted-foreground mb-10">Buy and sell gaming goods safely in 3 simple steps</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Find a Listing', desc: 'Browse thousands of verified listings by game, category, price, and seller rating.', icon: '🔍' },
              { step: '2', title: 'Place an Order', desc: 'Buy securely with escrow protection. Your funds are held until delivery is confirmed.', icon: '🛒' },
              { step: '3', title: 'Receive & Review', desc: 'Get your items, confirm delivery, and leave a review to help the community.', icon: '✅' },
            ].map(function(s) { return (
              <div key={s.step} className="flex flex-col items-center">
                <div className="text-4xl mb-4">{s.icon}</div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm text-white mb-3" style={{ background: 'var(--brand)' }}>{s.step}</div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-10 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="font-bold text-xl mb-3" style={{ fontFamily: "'Doto',sans-serif" }}>Bounty</div>
              <p className="text-sm text-muted-foreground leading-relaxed">The premier gaming marketplace for currency, accounts, items and services.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Marketplace</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/browse?category=Currency" className="block hover:text-foreground transition-colors">Currency</Link>
                <Link href="/browse?category=Accounts" className="block hover:text-foreground transition-colors">Accounts</Link>
                <Link href="/browse?category=Items" className="block hover:text-foreground transition-colors">Items</Link>
                <Link href="/browse?category=Boosting" className="block hover:text-foreground transition-colors">Boosting</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Sellers</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/become-a-seller" className="block hover:text-foreground transition-colors">Become a Seller</Link>
                <Link href="/dashboard" className="block hover:text-foreground transition-colors">Seller Dashboard</Link>
                <a href="#" className="block hover:text-foreground transition-colors">Fees & Payouts</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Support</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="#" className="block hover:text-foreground transition-colors">Help Center</a>
                <a href="#" className="block hover:text-foreground transition-colors">Dispute Policy</a>
                <a href="#" className="block hover:text-foreground transition-colors">Terms of Service</a>
                <a href="#" className="block hover:text-foreground transition-colors">Privacy Policy</a>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">© 2025 Bounty Gaming Marketplace. All rights reserved.</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Secured by escrow protection on every transaction
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

// ── CLIENT-SIDE LISTING LOGIC (no JSX, runs in browser) ─────────────────────
var _game = '', _cat = '', _sort = '';

function filterGame(btn, game) {
  _game = game;
  document.querySelectorAll('#game-tabs .game-tab').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  loadListings(_game, _cat, _sort);
}

function filterCategory(btn, cat) {
  _cat = cat;
  document.querySelectorAll('#cat-filters .filter-pill').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  loadListings(_game, _cat, _sort);
}

function sortListings(sort) { _sort = sort; loadListings(_game, _cat, _sort); }

async function loadListings(game, cat, sort) {
  var grid = document.getElementById('listings-grid');
  if (!grid) return;
  grid.innerHTML = '<div class="col-span-full text-center py-16 text-muted-foreground"><div class="auth-spinner mx-auto mb-3" style="border-top-color:var(--brand)"></div><p>Loading…</p></div>';
  var params = new URLSearchParams({ limit: '16' });
  if (game) params.set('game', game);
  if (cat) params.set('category', cat);
  if (sort) params.set('sort', sort);
  try {
    var res = await fetch('/api/listings?' + params);
    var data = await res.json();
    if (!data.listings || !data.listings.length) {
      grid.innerHTML = '<div class="col-span-full text-center py-16 text-muted-foreground"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-3 opacity-30"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg><p class="font-medium">No listings yet</p><p class="text-sm mt-1 opacity-60">Be the first to <a href="/become-a-seller" style="color:var(--brand)">sell something</a></p></div>';
      return;
    }
    grid.innerHTML = data.listings.map(function(l) { return renderCard(l); }).join('');
  } catch (e) {
    grid.innerHTML = '<div class="col-span-full text-center py-16 text-muted-foreground">Failed to load listings.</div>';
  }
}

function renderCard(l) {
  var stars = Math.round(l.sellerRating || 5);
  var starStr = '★'.repeat(stars) + '☆'.repeat(5 - stars);
  var dot = l.isSellerOnline ? '<span class="online-dot"></span>' : '<span class="offline-dot"></span>';
  var verified = l.isSellerVerified ? '<span class="verified-badge"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Verified</span>' : '';
  var gameLabel = l.game ? '<span class="text-xs px-2 py-0.5 rounded-full font-medium" style="background:rgba(108,71,255,0.1);color:#a78bfa">' + esc(l.game) + '</span>' : '';
  return '<div class="listing-card">' +
    '<div class="flex items-center gap-2">' +
      '<div class="seller-avatar"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>' +
      '<div class="flex-1 min-w-0">' +
        '<div class="flex items-center gap-1.5">' + dot + '<span class="text-sm font-semibold truncate">' + esc(l.sellerUsername) + '</span>' + verified + '</div>' +
        '<div class="text-xs text-muted-foreground"><span style="color:#f59e0b">' + starStr + '</span> <span>(' + (l.sellerReviews || 0) + ')</span></div>' +
      '</div>' + gameLabel +
    '</div>' +
    '<div class="flex-1">' +
      '<p class="text-sm font-semibold leading-snug mb-1" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + esc(l.title) + '</p>' +
      '<div class="flex items-center gap-3 text-xs text-muted-foreground"><span>⚡ ' + esc(l.deliveryTime || '1-24 hours') + '</span><span>✓ ' + (l.completionRate || 100) + '% done</span></div>' +
    '</div>' +
    '<div class="flex items-end justify-between pt-2 border-t" style="border-color:hsl(var(--border)/0.5)">' +
      '<div><div class="text-xs text-muted-foreground mb-0.5">' + esc(l.priceUnit || 'per unit') + '</div><div class="text-lg font-black" style="color:var(--brand)">$' + Number(l.price).toFixed(2) + '</div></div>' +
      '<button class="buy-btn" onclick="window.openModal && window.openModal(\'login\')">Buy Now</button>' +
    '</div>' +
  '</div>';
}

function esc(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
