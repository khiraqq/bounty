import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { exposeToWindow, initApp } from '../../utils/auth';

export default function SellerProfile() {
  const router = useRouter();
  const { username } = router.query;
  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    exposeToWindow();
    initApp();
    if (username) {
      Promise.all([
        fetch('/api/seller/' + username).then(r => r.json()),
        fetch('/api/listings?sellerUsername=' + username + '&limit=12').then(r => r.json()),
        fetch('/api/reviews?sellerUsername=' + username + '&limit=10').then(r => r.json()),
      ]).then(([sd, ld, rd]) => {
        setSeller(sd.seller || null);
        setListings(ld.listings || []);
        setReviews(rd.reviews || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [username]);

  const stars = seller ? Math.round(seller.rating || 5) : 5;

  if (loading) return (
    <Shell title="Loading…">
      <div className="flex items-center justify-center py-32"><div className="auth-spinner" style={{ borderTopColor: 'var(--brand)' }} /></div>
    </Shell>
  );
  if (!seller) return (
    <Shell title="Seller Not Found">
      <div className="text-center py-32"><p className="text-xl font-bold mb-4">Seller not found</p><Link href="/browse" className="btn-primary inline-flex">Browse Listings</Link></div>
    </Shell>
  );

  return (
    <Shell title={seller.displayName + ' — Bounty Seller'}>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Home</Link><span>/</span>
          <Link href="/browse" className="hover:text-foreground">Browse</Link><span>/</span>
          <span className="text-foreground">{seller.displayName}</span>
        </div>

        {/* Profile header */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-start gap-5 flex-wrap">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center flex-shrink-0 border-2 border-border">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="text-2xl font-black">{seller.displayName}</h1>
                {seller.isVerified && <span className="verified-badge text-sm px-2 py-0.5 rounded-full border border-blue-500/30 bg-blue-500/10"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Verified Seller</span>}
                <span className="text-sm px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 font-semibold">● Online</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">@{seller.username}</p>
              <div className="flex items-center gap-6 flex-wrap text-sm">
                <div className="text-center"><div className="font-black text-xl" style={{ color: 'var(--brand)' }}>{seller.rating?.toFixed(1) || '5.0'}</div><div className="text-xs text-muted-foreground">Rating</div></div>
                <div className="text-center"><div className="font-black text-xl">{seller.reviewCount || 0}</div><div className="text-xs text-muted-foreground">Reviews</div></div>
                <div className="text-center"><div className="font-black text-xl">{seller.totalSales || 0}</div><div className="text-xs text-muted-foreground">Sales</div></div>
                <div className="text-center"><div className="font-black text-xl">⚡</div><div className="text-xs text-muted-foreground">{seller.responseTime || 'Fast'}</div></div>
              </div>
              {seller.description && <p className="text-sm text-muted-foreground mt-3 max-w-xl">{seller.description}</p>}
              {seller.games?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {seller.games.map(g => <span key={g} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(107,114,128,0.1)', color: '#d1d5db' }}>{g}</span>)}
                </div>
              )}
            </div>
            <button onClick={() => { const tok = localStorage.getItem('bounty_token'); if (!tok) { window.openModal?.('login'); return; } window.location.href = '/messages?to=' + seller.username; }} className="btn-primary px-5 flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Message
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Listings */}
            <div>
              <h2 className="text-lg font-bold mb-4">Active Listings ({listings.length})</h2>
              {listings.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border border-border rounded-xl">No active listings</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {listings.map(l => (
                    <Link href={'/listing/' + l._id} key={l._id} className="listing-card block">
                      <div className="flex items-center gap-2 mb-2">
                        {l.game && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(107,114,128,0.1)', color: '#d1d5db' }}>{l.game}</span>}
                        {l.category && <span className="text-xs px-2 py-0.5 rounded-full border border-border font-medium">{l.category}</span>}
                      </div>
                      <p className="text-sm font-bold mb-2 line-clamp-2">{l.title}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">⚡ {l.deliveryTime || '1-24h'}</span>
                        <span className="font-black" style={{ color: 'var(--brand)' }}>${l.price?.toFixed(2)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews */}
            <div>
              <h2 className="text-lg font-bold mb-4">Reviews ({reviews.length})</h2>
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border border-border rounded-xl">No reviews yet</div>
              ) : (
                <div className="space-y-3">
                  {reviews.map(r => (
                    <div key={r._id} className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{r.reviewerUsername}</span>
                          <span style={{ color: '#f59e0b' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
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

          {/* Sidebar */}
          <div>
            <div className="bg-card border border-border rounded-xl p-5 sticky top-4">
              <h3 className="font-bold mb-4">Seller Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Total Sales</span><span className="font-semibold">{seller.totalSales || 0}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Rating</span><span className="font-semibold" style={{ color: '#f59e0b' }}>{'★'.repeat(stars)} {seller.rating?.toFixed(1)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Reviews</span><span className="font-semibold">{seller.reviewCount || 0}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Response Time</span><span className="font-semibold">{seller.responseTime || 'Within 1 hour'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Member Since</span><span className="font-semibold">{new Date(seller.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span></div>
                {seller.isVerified && <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-semibold text-blue-400">✓ Verified</span></div>}
              </div>
              <button onClick={() => { const tok = localStorage.getItem('bounty_token'); if (!tok) { window.openModal?.('login'); return; } window.location.href = '/messages?to=' + seller.username; }} className="btn-primary w-full mt-4">Contact Seller</button>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function Shell({ title, children }) {
  useEffect(() => { exposeToWindow(); initApp(); }, []);
  return (
    <>
      <Head><title>{title}</title></Head>
      {children}
    </>
  );
}
