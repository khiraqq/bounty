import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { exposeToWindow, initApp } from '../../utils/auth';

export default function ListingPage() {
  const router = useRouter();
  const { id } = router.query;
  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1000);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderMsg, setOrderMsg] = useState('');

  useEffect(() => {
    exposeToWindow();
    initApp();
    if (id) {
      fetch('/api/listings/' + id).then(r => r.json()).then(d => {
        setListing(d.listing || null);
        setLoading(false);
        if (d.listing?.minOrder) setQuantity(d.listing.minOrder);
      }).catch(() => setLoading(false));
      fetch('/api/reviews?listingId=' + id).then(r => r.json()).then(d => setReviews(d.reviews || [])).catch(() => {});
    }
  }, [id]);

  const handleBuy = async () => {
    const tok = typeof window !== 'undefined' ? localStorage.getItem('bounty_token') : null;
    if (!tok) { window.openModal?.('login'); return; }
    setOrderLoading(true);
    setOrderMsg('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tok },
        body: JSON.stringify({ listingId: listing._id, sellerUsername: listing.sellerUsername, game: listing.game, category: listing.category, title: listing.title, quantity, price: listing.price }),
      });
      const data = await res.json();
      if (res.ok) { setOrderMsg('✅ Order placed! Check your orders page.'); }
      else setOrderMsg('❌ ' + (data.message || 'Failed to place order'));
    } catch { setOrderMsg('❌ Network error'); }
    setOrderLoading(false);
  };

  const total = listing ? (quantity / (listing.minOrder || 1) * listing.price).toFixed(2) : '0.00';
  const stars = listing ? Math.round(listing.sellerRating || 5) : 5;

  if (loading) return (
    <>
      <PageShell title="Loading…">
        <div className="flex items-center justify-center py-32 text-muted-foreground">
          <div className="auth-spinner" style={{ borderTopColor: 'var(--brand)' }} />
        </div>
      </PageShell>
    </>
  );

  if (!listing) return (
    <PageShell title="Listing Not Found">
      <div className="text-center py-32">
        <p className="text-xl font-bold mb-4">Listing not found</p>
        <Link href="/browse" className="btn-primary inline-flex">Browse Listings</Link>
      </div>
    </PageShell>
  );

  return (
    <PageShell title={listing.title + ' — Bounty'}>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
          <Link href="/" className="hover:text-foreground">Home</Link><span>/</span>
          <Link href="/browse" className="hover:text-foreground">Browse</Link><span>/</span>
          {listing.game && <><Link href={'/browse?game=' + listing.game} className="hover:text-foreground">{listing.game}</Link><span>/</span></>}
          <span className="text-foreground truncate max-w-xs">{listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Listing header */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {listing.game && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(108,71,255,0.12)', color: '#a78bfa' }}>{listing.game}</span>}
                    {listing.category && <span className="text-xs px-2 py-0.5 rounded-full font-semibold border border-border">{listing.category}</span>}
                    {listing.isFeatured && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: '#f59e0b', color: 'white' }}>⭐ Featured</span>}
                  </div>
                  <h1 className="text-2xl font-black mb-3">{listing.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    <span>⚡ Delivery: <strong className="text-foreground">{listing.deliveryTime || '1-24 hours'}</strong></span>
                    <span>✓ Completion: <strong className="text-foreground">{listing.completionRate || 100}%</strong></span>
                    {listing.stock && <span>📦 Stock: <strong className="text-foreground">{listing.stock.toLocaleString()}</strong></span>}
                  </div>
                </div>
              </div>
              {listing.description && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h3 className="font-bold text-sm mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{listing.description}</p>
                </div>
              )}
            </div>

            {/* Seller info */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold mb-4">About the Seller</h3>
              <div className="flex items-start gap-4">
                <div className="seller-avatar h-14 w-14 flex-shrink-0">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-lg">{listing.sellerUsername}</span>
                    {listing.isSellerVerified && <span className="verified-badge text-xs"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Verified</span>}
                    <span className={listing.isSellerOnline ? 'online-badge' : 'offline-badge'}>{listing.isSellerOnline ? '● Online' : '○ Offline'}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm flex-wrap">
                    <span style={{ color: '#f59e0b' }}>{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
                    <span className="text-muted-foreground">{listing.sellerRating?.toFixed(1) || '5.0'} ({listing.sellerReviews || 0} reviews)</span>
                    <span className="text-muted-foreground">{listing.sellerOrders || 0} orders completed</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Link href={'/seller/' + listing.sellerUsername} className="btn-outline text-sm px-4 py-1.5 h-auto inline-flex">View Profile</Link>
                    <button onClick={() => { const tok = localStorage.getItem('bounty_token'); if (!tok) { window.openModal?.('login'); return; } window.location.href = '/messages?to=' + listing.sellerUsername; }} className="btn-outline text-sm px-4 py-1.5 h-auto inline-flex">Message</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold mb-4">Reviews ({reviews.length})</h3>
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r._id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{r.reviewerUsername}</span>
                          <span style={{ color: '#f59e0b', fontSize: '0.8rem' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Buy box */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-4">
              <div className="text-3xl font-black mb-1" style={{ color: 'var(--brand)' }}>${listing.price.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground mb-4">{listing.priceUnit || 'per unit'}</p>

              <div className="mb-4">
                <label className="text-sm font-semibold block mb-2">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  min={listing.minOrder || 1}
                  max={listing.maxOrder || 999999999}
                  step={listing.minOrder || 1}
                  onChange={e => setQuantity(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-md bg-background border border-border text-foreground text-sm outline-none focus:border-brand"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Min: {(listing.minOrder || 1).toLocaleString()}</span>
                  <span>Max: {(listing.maxOrder || 999999999).toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-background rounded-lg p-3 mb-4 text-sm">
                <div className="flex justify-between mb-1"><span className="text-muted-foreground">Subtotal</span><span>${total}</span></div>
                <div className="flex justify-between mb-1"><span className="text-muted-foreground">Platform fee</span><span className="text-green-500">Free</span></div>
                <div className="flex justify-between font-bold border-t border-border pt-2 mt-2"><span>Total</span><span style={{ color: 'var(--brand)' }}>${total}</span></div>
              </div>

              {orderMsg && (
                <div className={'text-sm px-3 py-2 rounded-md mb-3 ' + (orderMsg.startsWith('✅') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400')}>
                  {orderMsg}
                </div>
              )}

              <button onClick={handleBuy} disabled={orderLoading} className="btn-primary w-full mb-2" style={{ height: '2.75rem' }}>
                {orderLoading ? 'Placing Order…' : 'Buy Now — $' + total}
              </button>
              <button onClick={() => { const tok = localStorage.getItem('bounty_token'); if (!tok) { window.openModal?.('login'); return; } window.location.href = '/messages?to=' + listing.sellerUsername; }} className="btn-outline w-full" style={{ height: '2.5rem' }}>
                Contact Seller
              </button>

              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Secure escrow protection</div>
                <div className="flex items-center gap-2"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg> 24/7 dispute support</div>
                <div className="flex items-center gap-2"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> Verified seller</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function PageShell({ title, children }) {
  useEffect(() => {
    exposeToWindow();
    initApp();
  }, []);
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      {/* Top Bar */}
      <div className="bg-topbar text-topbar-foreground text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5">
          <div /><div className="flex items-center gap-1"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg><span>24/7 Live Support</span></div>
          <button id="theme-toggle" onClick={() => window.toggleTheme?.()} aria-label="Toggle theme"><svg className="h-4 w-4 dark:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg><svg className="h-4 w-4 hidden dark:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9"/><path d="M20 3v4"/><path d="M22 5h-4"/></svg></button>
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
            <Link href="/become-a-seller" className="text-sm font-semibold px-3 py-1.5 rounded-md" style={{ background: 'rgba(108,71,255,0.1)', color: '#a78bfa', border: '1px solid rgba(108,71,255,0.2)' }}>Sell on Bounty</Link>
          </div>
          <div className="ml-8 hidden md:flex items-center gap-3">
            <button id="login-button" onClick={() => window.openModal?.('login')} className="rounded-md border border-nav-foreground/20 bg-transparent px-4 py-1.5 text-sm font-medium text-nav-foreground/60 hover:text-nav-foreground hover:border-nav-foreground/40 transition">Log in</button>
            <div id="profile-area" className="hidden items-center gap-2">
              <Link href="/messages" className="nav-icon-btn" title="Messages"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></Link>
              <div className="relative">
                <button id="profile-button" onClick={() => window.toggleProfileDropdown?.()} className="h-8 w-8 rounded-full flex items-center justify-center overflow-hidden">
                  <div id="profile-avatar" className="w-full h-full rounded-full flex items-center justify-center" style={{ backgroundColor: '#0a0a0a', color: '#fff', border: '1px solid #27272a' }}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                </button>
                <div id="profile-dropdown" className="hidden absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-card shadow-xl z-50 overflow-hidden py-1">
                  <div id="dropdown-username" className="px-4 py-2 text-sm font-semibold border-b border-border" />
                  <Link href="/orders" className="dropdown-item">Orders</Link>
                  <Link href="/messages" className="dropdown-item">Messages</Link>
                  <Link href="/account-settings" className="dropdown-item">Settings</Link>
                  <button onClick={() => { window.logout?.(); window.closeProfileDropdown?.(); }} className="dropdown-item w-full text-left" style={{ color: '#ef4444' }}>Log out</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      {children}
      <div id="modal-overlay" className="hidden fixed inset-0 z-50 flex items-center justify-center" onClick={e => window.handleOverlayClick?.(e)}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative z-10 w-full max-w-md mx-4 bg-card text-card-foreground rounded-xl p-8 shadow-2xl border border-border" onClick={e => e.stopPropagation()}>
          <button onClick={() => window.closeModal?.()} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          <div id="login-modal">
            <h2 className="text-2xl font-bold text-center mb-4" style={{ fontFamily: "'Doto',monospace" }}>Sign In to Buy</h2>
            <p id="login-error" className="hidden text-sm text-red-500 mb-4 text-center rounded-md bg-red-500/10 px-3 py-2" />
            <form id="login-form" className="space-y-3" onSubmit={e => window.handleLoginSubmit?.(e)}>
              <input id="login-username" type="text" placeholder="Username" className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm outline-none focus:ring-1 focus:ring-ring" />
              <input id="login-password" type="password" placeholder="Password" className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm outline-none focus:ring-1 focus:ring-ring" />
              <button id="login-submit-btn" type="submit" className="btn-brand">Login</button>
            </form>
            <p className="text-center text-sm mt-4 text-muted-foreground">No account? <button onClick={() => window.switchView?.('signup')} className="text-foreground underline">Sign up</button></p>
          </div>
          <div id="signup-modal" className="hidden">
            <h2 className="text-2xl font-bold text-center mb-4" style={{ fontFamily: "'Doto',monospace" }}>Create Account</h2>
            <p id="signup-error" className="hidden text-sm text-red-500 mb-4 text-center rounded-md bg-red-500/10 px-3 py-2" />
            <form id="signup-form" className="space-y-3" onSubmit={e => window.handleSignupSubmit?.(e)}>
              <input id="signup-username" type="text" placeholder="Username" className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm outline-none focus:ring-1 focus:ring-ring" />
              <input id="signup-email" type="email" placeholder="Email" className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm outline-none focus:ring-1 focus:ring-ring" />
              <input id="signup-password" type="password" placeholder="Password" className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm outline-none focus:ring-1 focus:ring-ring" />
              <input id="signup-confirm-password" type="password" placeholder="Confirm Password" className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm outline-none focus:ring-1 focus:ring-ring" />
              <button id="signup-submit-btn" type="submit" className="btn-brand">Sign Up</button>
            </form>
            <p className="text-center text-sm mt-4 text-muted-foreground">Have account? <button onClick={() => window.switchView?.('login')} className="text-foreground underline">Login</button></p>
          </div>
        </div>
      </div>
    </>
  );
}
