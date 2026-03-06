import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { exposeToWindow, initApp } from '../../utils/auth';

export default function OrdersPage() {
  const [tab, setTab] = useState('buying');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    exposeToWindow();
    initApp();
  }, []);

  useEffect(() => {
    const tok = typeof window !== 'undefined' ? localStorage.getItem('bounty_token') : null;
    if (!tok) { setLoading(false); return; }
    setLoading(true);
    fetch('/api/orders?role=' + (tab === 'selling' ? 'seller' : 'buyer'), {
      headers: { Authorization: 'Bearer ' + tok }
    }).then(r => r.json()).then(d => { setOrders(d.orders || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [tab]);

  const statusColor = s => ({ pending: '#ca8a04', active: '#3b82f6', completed: '#16a34a', disputed: '#ef4444', cancelled: '#6b7280' }[s] || '#6b7280');
  const statusBg = s => ({ pending: 'rgba(234,179,8,0.12)', active: 'rgba(59,130,246,0.12)', completed: 'rgba(22,163,74,0.12)', disputed: 'rgba(239,68,68,0.1)', cancelled: 'rgba(107,114,128,0.1)' }[s] || 'rgba(107,114,128,0.1)');

  return (
    <>
      <Head><title>Orders — Bounty</title></Head>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Home</Link><span>/</span>
          <span className="text-foreground font-medium">Orders</span>
        </div>
        <h1 className="text-2xl font-black mb-6">My Orders</h1>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-lg bg-muted mb-6 w-fit">
          {[['buying','Buying'],['selling','Selling']].map(([v,l]) => (
            <button key={v} onClick={() => setTab(v)} className={'px-5 py-1.5 rounded-md text-sm font-semibold transition-colors ' + (tab === v ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
              {l}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <div className="auth-spinner" style={{ borderTopColor: 'var(--brand)' }} />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-4 opacity-30"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <p className="font-medium">No {tab} orders yet</p>
            {tab === 'buying' && <p className="text-sm mt-1 opacity-60"><Link href="/browse" className="underline">Browse listings</Link> to get started</p>}
            {tab === 'selling' && <p className="text-sm mt-1 opacity-60"><Link href="/become-a-seller" className="underline">Become a seller</Link> to start earning</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(o => (
              <div key={o._id} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold">{o.title || o.game}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: statusBg(o.status), color: statusColor(o.status) }}>
                        {o.status?.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {tab === 'buying' ? 'Seller: ' : 'Buyer: '}
                      <strong className="text-foreground">{tab === 'buying' ? o.sellerUsername : o.buyerUsername}</strong>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {o.game} · {o.category} · {new Date(o.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black" style={{ color: 'var(--brand)' }}>${(o.total || 0).toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">Qty: {(o.quantity || 1).toLocaleString()}</div>
                  </div>
                </div>
                {o.notes && <p className="text-sm text-muted-foreground mt-3 p-3 bg-background rounded-lg">{o.notes}</p>}
                <div className="flex gap-2 mt-4">
                  {o.status === 'active' && <button className="text-xs px-3 py-1.5 rounded-md font-semibold" style={{ background: '#16a34a', color: 'white' }}>Mark Complete</button>}
                  {(o.status === 'active' || o.status === 'pending') && <button className="text-xs px-3 py-1.5 rounded-md font-semibold border border-border hover:bg-accent">Open Dispute</button>}
                  <button onClick={() => window.location.href = '/messages?to=' + (tab === 'buying' ? o.sellerUsername : o.buyerUsername)} className="text-xs px-3 py-1.5 rounded-md font-semibold border border-border hover:bg-accent">Message</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div id="modal-overlay" className="hidden fixed inset-0 z-50 flex items-center justify-center" onClick={e => window.handleOverlayClick?.(e)}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative z-10 w-full max-w-md mx-4 bg-card rounded-xl p-8 shadow-2xl border border-border" onClick={e => e.stopPropagation()}>
          <button onClick={() => window.closeModal?.()} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          <div id="login-modal"><h2 className="text-2xl font-bold text-center mb-4">Sign In</h2><p id="login-error" className="hidden text-sm text-red-500 mb-3 text-center" /><form id="login-form" className="space-y-3" onSubmit={e => window.handleLoginSubmit?.(e)}><input id="login-username" type="text" placeholder="Username" className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm outline-none" /><input id="login-password" type="password" placeholder="Password" className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm outline-none" /><button id="login-submit-btn" type="submit" className="btn-brand">Login</button></form><p className="text-center text-sm mt-4 text-muted-foreground">No account? <button onClick={() => window.switchView?.('signup')} className="text-foreground underline">Sign up</button></p></div>
          <div id="signup-modal" className="hidden"><h2 className="text-2xl font-bold text-center mb-4">Create Account</h2><p id="signup-error" className="hidden text-sm text-red-500 mb-3 text-center" /><form id="signup-form" className="space-y-3" onSubmit={e => window.handleSignupSubmit?.(e)}><input id="signup-username" type="text" placeholder="Username" className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm outline-none" /><input id="signup-email" type="email" placeholder="Email" className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm outline-none" /><input id="signup-password" type="password" placeholder="Password" className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm outline-none" /><input id="signup-confirm-password" type="password" placeholder="Confirm Password" className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm outline-none" /><button id="signup-submit-btn" type="submit" className="btn-brand">Sign Up</button></form><p className="text-center text-sm mt-4 text-muted-foreground">Have account? <button onClick={() => window.switchView?.('login')} className="text-foreground underline">Login</button></p></div>
        </div>
      </div>
    </>
  );
}
