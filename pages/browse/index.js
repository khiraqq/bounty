import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { exposeToWindow, initApp } from '../../utils/auth';

const GAMES = ['All Games','World of Warcraft','Old School RuneScape','Path of Exile','Final Fantasy XIV','Diablo IV','Lost Ark','Fortnite','Valorant','Rocket League','FIFA','NBA 2K','Apex Legends','CS2','Genshin Impact','League of Legends'];
const CATS = ['All','Currency','Accounts','Power Leveling','Items','Boosting','Top Ups','Gift Cards'];

export default function Browse() {
  useEffect(() => {
    exposeToWindow();
    initApp();
    const p = new URLSearchParams(window.location.search);
    const game = p.get('game') || '';
    const cat = p.get('category') || '';
    if (game) {
      const tab = document.querySelector('#game-tabs .game-tab[data-game="'+game+'"]');
      if (tab) { document.querySelectorAll('#game-tabs .game-tab').forEach(b => b.classList.remove('active')); tab.classList.add('active'); }
    }
    if (cat) {
      const pill = document.querySelector('#cat-filters .filter-pill[data-cat="'+cat+'"]');
      if (pill) { document.querySelectorAll('#cat-filters .filter-pill').forEach(b => b.classList.remove('active')); pill.classList.add('active'); }
    }
    loadListings(game, cat, '', 1);
  }, []);

  return (
    <>
      <Head>
        <title>Browse Listings — Bounty Gaming Marketplace</title>
        <meta name="description" content="Browse thousands of verified gaming listings. Buy gold, accounts, items and services." />
      </Head>
      <NavBar />
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Browse</span>
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-56 flex-shrink-0">
            <div className="bg-card border border-border rounded-xl p-4 sticky top-4">
              <h3 className="font-bold text-sm mb-3">Category</h3>
              <div className="space-y-1" id="cat-filters">
                {CATS.map((c, i) => (
                  <button key={c} data-cat={c === 'All' ? '' : c} className={'filter-pill-side' + (i === 0 ? ' active' : '')} onClick={e => filterCategory(e.currentTarget, c === 'All' ? '' : c)}>{c}</button>
                ))}
              </div>
              <div className="border-t border-border my-4" />
              <h3 className="font-bold text-sm mb-3">Price Range</h3>
              <div className="flex gap-2">
                <input id="price-min" type="number" placeholder="Min" className="w-full h-8 px-2 text-sm rounded-md border border-border bg-background text-foreground outline-none focus:border-brand" />
                <input id="price-max" type="number" placeholder="Max" className="w-full h-8 px-2 text-sm rounded-md border border-border bg-background text-foreground outline-none focus:border-brand" />
              </div>
              <button onClick={() => applyPriceFilter()} className="mt-2 w-full h-8 text-sm font-semibold rounded-md" style={{ background: 'var(--brand)', color: 'white' }}>Apply</button>
              <div className="border-t border-border my-4" />
              <h3 className="font-bold text-sm mb-3">Seller</h3>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input id="filter-online" type="checkbox" className="rounded" onChange={() => reloadWithFilters()} />
                Online only
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer mt-2">
                <input id="filter-verified" type="checkbox" className="rounded" onChange={() => reloadWithFilters()} />
                Verified sellers
              </label>
            </div>
          </aside>
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Game tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-5" id="game-tabs" style={{ scrollbarWidth: 'none' }}>
              {GAMES.map((g, i) => (
                <button key={g} data-game={g === 'All Games' ? '' : g} className={'game-tab' + (i === 0 ? ' active' : '')} onClick={e => filterGame(e.currentTarget, g === 'All Games' ? '' : g)}>{g}</button>
              ))}
            </div>
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-4">
              <p id="results-count" className="text-sm text-muted-foreground">Loading…</p>
              <div className="flex items-center gap-2">
                <select id="sort-select" className="sort-select" onChange={e => sortListings(e.target.value)}>
                  <option value="">Featured</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="newest">Newest</option>
                </select>
                <button id="view-grid-btn" onClick={() => setView('grid')} className="nav-icon-btn active-view">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                </button>
                <button id="view-list-btn" onClick={() => setView('list')} className="nav-icon-btn">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                </button>
              </div>
            </div>
            {/* Listings */}
            <div id="listings-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="col-span-full text-center py-16 text-muted-foreground">
                <div className="auth-spinner mx-auto mb-3" style={{ borderTopColor: 'var(--brand)' }} />
                <p>Loading listings…</p>
              </div>
            </div>
            {/* Pagination */}
            <div id="pagination" className="flex items-center justify-center gap-2 mt-8 hidden" />
          </div>
        </div>
      </div>
      <AuthModal />
      <Footer />
    </>
  );
}

function NavBar() {
  return (
    <>
      <div className="bg-topbar text-topbar-foreground text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5">
          <div />
          <div className="flex items-center gap-1">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
            <span>24/7 Live Support</span>
          </div>
          <div className="flex items-center gap-4">
            <button id="theme-toggle" onClick={() => window.toggleTheme?.()} aria-label="Toggle theme">
              <svg className="h-4 w-4 dark:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
              <svg className="h-4 w-4 hidden dark:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9"/><path d="M20 3v4"/><path d="M22 5h-4"/></svg>
            </button>
          </div>
        </div>
      </div>
      <nav className="bg-nav border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-2">
          <Link href="/" className="flex shrink-0 items-center text-nav-foreground font-bold text-2xl" style={{ fontFamily: "'Doto',sans-serif" }}>Bounty</Link>
          <div className="ml-auto hidden md:flex items-center gap-6">
            <Link href="/browse" className="text-sm font-medium text-nav-foreground/80 hover:text-nav-foreground transition-colors">Browse</Link>
            <Link href="/browse?category=Accounts" className="text-sm font-medium text-nav-foreground/80 hover:text-nav-foreground transition-colors">Accounts</Link>
            <Link href="/browse?category=Currency" className="text-sm font-medium text-nav-foreground/80 hover:text-nav-foreground transition-colors">Currency</Link>
            <Link href="/browse?category=Items" className="text-sm font-medium text-nav-foreground/80 hover:text-nav-foreground transition-colors">Items</Link>
            <Link href="/browse?category=Boosting" className="text-sm font-medium text-nav-foreground/80 hover:text-nav-foreground transition-colors">Boosting</Link>
            <Link href="/browse?category=Top Ups" className="text-sm font-medium text-nav-foreground/80 hover:text-nav-foreground transition-colors">Top Ups</Link>
            <Link href="/become-a-seller" className="text-sm font-semibold px-3 py-1.5 rounded-md" style={{ background: 'rgba(108,71,255,0.1)', color: '#a78bfa', border: '1px solid rgba(108,71,255,0.2)' }}>Sell on Bounty</Link>
          </div>
          <div className="ml-8 hidden md:flex items-center gap-3">
            <div className="flex items-center rounded-md bg-nav-foreground/10 px-3 py-1.5 text-sm text-nav-foreground/60 gap-2 w-48">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input id="search-input" type="text" placeholder="Search listings…" className="bg-transparent outline-none text-sm w-full" onKeyDown={e => { if (e.key === 'Enter') doSearch(e.target.value); }} />
            </div>
            <button id="login-button" onClick={() => window.openModal?.('login')} className="rounded-md border border-nav-foreground/20 bg-transparent px-4 py-1.5 text-sm font-medium text-nav-foreground/60 hover:text-nav-foreground hover:border-nav-foreground/40 transition">Log in</button>
            <div id="profile-area" className="hidden items-center gap-2">
              <Link href="/messages" className="nav-icon-btn" title="Messages"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></Link>
              <button className="nav-icon-btn relative" title="Notifications"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg></button>
              <div className="relative">
                <button id="profile-button" type="button" onClick={() => window.toggleProfileDropdown?.()} className="h-8 w-8 rounded-full flex items-center justify-center overflow-hidden">
                  <div id="profile-avatar" className="w-full h-full rounded-full flex items-center justify-center" style={{ backgroundColor: '#0a0a0a', color: '#fff', border: '1px solid #27272a' }}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                </button>
                <div id="profile-dropdown" className="hidden absolute right-0 top-full mt-2 w-56 rounded-lg border border-border bg-card shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                    <div id="dropdown-avatar" className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#0a0a0a', color: '#fff', border: '1px solid #27272a' }}>
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div className="min-w-0"><p id="dropdown-username" className="text-sm font-semibold text-foreground truncate" /><p className="text-xs text-muted-foreground">$0.00</p></div>
                  </div>
                  <div className="flex gap-2 px-3 py-2 border-b border-border">
                    <Link href="/deposit" className="flex-1 text-center text-xs font-semibold py-1.5 rounded-md" style={{ background: '#16a34a', color: 'white' }}>Deposit</Link>
                    <button className="flex-1 text-xs font-semibold py-1.5 rounded-md border border-border hover:bg-accent transition-colors">Withdraw</button>
                  </div>
                  <div className="py-1">
                    <Link href="/orders" className="dropdown-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>Orders</Link>
                    <Link href="/messages" className="dropdown-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Messages</Link>
                    <Link href="/account-settings" className="dropdown-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 0 0 4.93 19.07"/></svg>Settings</Link>
                  </div>
                  <div className="border-t border-border py-1">
                    <button onClick={() => { window.logout?.(); window.closeProfileDropdown?.(); }} className="dropdown-item w-full text-left" style={{ color: '#ef4444' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Log out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

function AuthModal() {
  return (
    <div id="modal-overlay" className="hidden fixed inset-0 z-50 flex items-center justify-center" onClick={e => window.handleOverlayClick?.(e)}>
      <div id="modal-backdrop" className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md mx-4 bg-card text-card-foreground rounded-xl p-8 shadow-2xl border border-border" onClick={e => e.stopPropagation()}>
        <button type="button" onClick={() => window.closeModal?.()} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        <div id="login-modal">
          <h2 className="text-2xl font-bold text-center mb-1" style={{ fontFamily: "'Doto',monospace" }}>Welcome back</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">Sign in to your Bounty account</p>
          <p id="login-error" className="hidden text-sm text-red-500 mb-4 text-center rounded-md bg-red-500/10 px-3 py-2" />
          <form id="login-form" className="space-y-3" onSubmit={e => window.handleLoginSubmit?.(e)}>
            <div><label className="text-sm font-medium block mb-1.5">Username</label><input id="login-username" type="text" placeholder="Your username" className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" /></div>
            <div><label className="text-sm font-medium block mb-1.5">Password</label><input id="login-password" type="password" placeholder="Your password" className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" /></div>
            <button id="login-submit-btn" type="submit" className="btn-brand mt-1">Login</button>
          </form>
          <div className="auth-divider"><div className="line" /><span>or</span><div className="line" /></div>
          <button type="button" onClick={() => window.handleDiscordOAuth?.()} className="btn-discord">
            <svg width="18" height="14" viewBox="0 0 71 55" fill="currentColor"><path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.3 37.3 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 4.9a.2.2 0 00-.1.1C1.5 18.7-.9 32.2.3 45.5v.1a58.7 58.7 0 0017.7 9 .2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.6 38.6 0 01-5.5-2.6.2.2 0 010-.4l1.1-.9a.2.2 0 01.2 0 41.9 41.9 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .3 36.3 36.3 0 01-5.5 2.7.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1A58.5 58.5 0 0070.3 45.6v-.1C71.7 30.1 67.8 16.7 60.2 5a.2.2 0 00-.1-.1zM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2zm23.7 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2z"/></svg>
            Continue with Discord
          </button>
          <p className="text-center text-sm mt-5 text-muted-foreground">No account? <button type="button" onClick={() => window.switchView?.('signup')} className="text-foreground underline font-medium">Sign up</button></p>
        </div>
        <div id="signup-modal" className="hidden">
          <h2 className="text-2xl font-bold text-center mb-1" style={{ fontFamily: "'Doto',monospace" }}>Create account</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">Join thousands of traders on Bounty</p>
          <p id="signup-error" className="hidden text-sm text-red-500 mb-4 text-center rounded-md bg-red-500/10 px-3 py-2" />
          <form id="signup-form" className="space-y-3" onSubmit={e => window.handleSignupSubmit?.(e)}>
            <div><label className="text-sm font-medium block mb-1.5">Username</label><input id="signup-username" type="text" placeholder="Your username" className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" /></div>
            <div><label className="text-sm font-medium block mb-1.5">Email</label><input id="signup-email" type="email" placeholder="you@example.com" className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" /></div>
            <div><label className="text-sm font-medium block mb-1.5">Password</label><input id="signup-password" type="password" placeholder="Your password" className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" /></div>
            <div><label className="text-sm font-medium block mb-1.5">Confirm Password</label><input id="signup-confirm-password" type="password" placeholder="Confirm password" className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" /></div>
            <button id="signup-submit-btn" type="submit" className="btn-brand mt-1">Sign Up</button>
          </form>
          <p className="text-center text-sm mt-5 text-muted-foreground">Have an account? <button type="button" onClick={() => window.switchView?.('login')} className="text-foreground underline font-medium">Login</button></p>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border mt-16 py-10 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="font-bold text-xl mb-3" style={{ fontFamily: "'Doto',sans-serif" }}>Bounty</div>
            <p className="text-sm text-muted-foreground">The premier gaming marketplace for currency, accounts, items and services.</p>
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
              <a href="#" className="block hover:text-foreground transition-colors">Seller Guide</a>
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
  );
}

// ── CLIENT-SIDE LOGIC ──────────────────────────────────────────────────────────
var _game = '', _cat = '', _sort = '', _page = 1, _view = 'grid';

function filterGame(btn, game) {
  _game = game; _page = 1;
  document.querySelectorAll('#game-tabs .game-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  loadListings(_game, _cat, _sort, 1);
}
function filterCategory(btn, cat) {
  _cat = cat; _page = 1;
  document.querySelectorAll('#cat-filters .filter-pill-side').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  loadListings(_game, _cat, _sort, 1);
}
function sortListings(sort) { _sort = sort; _page = 1; loadListings(_game, _cat, _sort, 1); }
function setView(v) {
  _view = v;
  var grid = document.getElementById('listings-grid');
  if (!grid) return;
  if (v === 'list') {
    grid.className = 'space-y-3';
    document.getElementById('view-grid-btn')?.classList.remove('active-view');
    document.getElementById('view-list-btn')?.classList.add('active-view');
  } else {
    grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4';
    document.getElementById('view-grid-btn')?.classList.add('active-view');
    document.getElementById('view-list-btn')?.classList.remove('active-view');
  }
}
function applyPriceFilter() { loadListings(_game, _cat, _sort, 1); }
function reloadWithFilters() { loadListings(_game, _cat, _sort, 1); }
function doSearch(q) {
  var params = new URLSearchParams({ q: q, limit: '24' });
  if (_game) params.set('game', _game);
  if (_cat) params.set('category', _cat);
  fetchListings(params);
}

async function loadListings(game, cat, sort, page) {
  _page = page || 1;
  var grid = document.getElementById('listings-grid');
  if (!grid) return;
  grid.innerHTML = '<div class="col-span-full text-center py-16 text-muted-foreground"><div class="auth-spinner mx-auto mb-3" style="border-top-color:var(--brand)"></div><p>Loading…</p></div>';
  var params = new URLSearchParams({ limit: '24', page: String(_page) });
  if (game) params.set('game', game);
  if (cat) params.set('category', cat);
  if (sort) params.set('sort', sort);
  var minP = document.getElementById('price-min')?.value;
  var maxP = document.getElementById('price-max')?.value;
  if (minP) params.set('minPrice', minP);
  if (maxP) params.set('maxPrice', maxP);
  if (document.getElementById('filter-online')?.checked) params.set('online', '1');
  if (document.getElementById('filter-verified')?.checked) params.set('verified', '1');
  fetchListings(params);
}

async function fetchListings(params) {
  var grid = document.getElementById('listings-grid');
  try {
    var res = await fetch('/api/listings?' + params);
    var data = await res.json();
    var count = document.getElementById('results-count');
    if (count) count.textContent = (data.total || 0) + ' listings found';
    if (!data.listings || !data.listings.length) {
      grid.innerHTML = '<div class="col-span-full text-center py-16 text-muted-foreground"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto mb-3 opacity-30" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg><p class="font-medium">No listings found</p><p class="text-sm mt-1 opacity-60">Try adjusting your filters</p></div>';
      document.getElementById('pagination').classList.add('hidden');
      return;
    }
    grid.innerHTML = data.listings.map(l => renderCard(l)).join('');
    renderPagination(data.page, data.pages);
  } catch (e) {
    grid.innerHTML = '<div class="col-span-full text-center py-16 text-muted-foreground">Failed to load listings.</div>';
  }
}

function renderPagination(page, pages) {
  var pag = document.getElementById('pagination');
  if (!pag || pages <= 1) { pag?.classList.add('hidden'); return; }
  pag.classList.remove('hidden');
  var html = '';
  if (page > 1) html += '<button onclick="loadListings(\''+_game+'\',\''+_cat+'\',\''+_sort+'\','+(page-1)+')" class="pagination-btn">← Prev</button>';
  for (var i = Math.max(1, page-2); i <= Math.min(pages, page+2); i++) {
    html += '<button onclick="loadListings(\''+_game+'\',\''+_cat+'\',\''+_sort+'\','+i+')" class="pagination-btn'+(i===page?' active':'')+'">' + i + '</button>';
  }
  if (page < pages) html += '<button onclick="loadListings(\''+_game+'\',\''+_cat+'\',\''+_sort+'\','+(page+1)+')" class="pagination-btn">Next →</button>';
  pag.innerHTML = html;
}

function renderCard(l) {
  var stars = Math.round(l.sellerRating || 5);
  var starStr = '★'.repeat(stars) + '☆'.repeat(5 - stars);
  var dot = l.isSellerOnline ? '<span class="online-dot"></span>' : '<span class="offline-dot"></span>';
  var verified = l.isSellerVerified ? '<span class="verified-badge"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Verified</span>' : '';
  return '<a href="/listing/'+l._id+'" class="listing-card block">' +
    '<div class="flex items-center gap-2">' +
      '<div class="seller-avatar"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>' +
      '<div class="flex-1 min-w-0">' +
        '<div class="flex items-center gap-1.5">' + dot + '<span class="text-sm font-semibold truncate">' + esc(l.sellerUsername) + '</span>' + verified + '</div>' +
        '<div class="text-xs text-muted-foreground"><span style="color:#f59e0b">' + starStr + '</span> <span>(' + (l.sellerReviews || 0) + ')</span></div>' +
      '</div>' +
      (l.game ? '<span class="text-xs px-2 py-0.5 rounded-full font-medium" style="background:rgba(108,71,255,0.1);color:#a78bfa">' + esc(l.game) + '</span>' : '') +
    '</div>' +
    '<div class="flex-1">' +
      '<p class="text-sm font-semibold leading-snug mb-1 line-clamp-2">' + esc(l.title) + '</p>' +
      '<div class="flex items-center gap-3 text-xs text-muted-foreground"><span>⚡ ' + esc(l.deliveryTime || '1-24 hours') + '</span><span>✓ ' + (l.completionRate || 100) + '%</span></div>' +
    '</div>' +
    '<div class="flex items-end justify-between pt-2 border-t" style="border-color:hsl(var(--border)/0.5)">' +
      '<div><div class="text-xs text-muted-foreground mb-0.5">' + esc(l.priceUnit || 'per unit') + '</div><div class="text-lg font-black" style="color:var(--brand)">$' + Number(l.price).toFixed(2) + '</div></div>' +
      '<button class="buy-btn" onclick="event.preventDefault();window.openModal&&window.openModal(\'login\')">Buy Now</button>' +
    '</div>' +
  '</a>';
}

function esc(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
