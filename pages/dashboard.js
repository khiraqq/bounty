import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { exposeToWindow, initApp } from '../utils/auth';

const GAMES = ['World of Warcraft','Old School RuneScape','Path of Exile','Final Fantasy XIV','Diablo IV','Lost Ark','Fortnite','Valorant','Rocket League','FIFA','NBA 2K','Apex Legends','CS2','Genshin Impact','League of Legends'];
const CATS = ['Roblox','Accounts','Currency','Items','Top Ups','Boosting','Giftcards'];
const ACCOUNT_SUBCATS = ['Roblox','Fortnite','Valorant','League of Legends'];
const DOTO = { fontFamily: "'Doto', sans-serif" };

function ListingPreview({ form }) {
  const price = Number(form.price) ? Number(form.price).toFixed(2) : '0.00';
  const lines = (form.description || '').split('\\n').filter(Boolean).slice(0, 3);
  const badgeLabel = form.category === 'Accounts' && form.accountSubcategory
    ? `${form.category} · ${form.accountSubcategory}`
    : form.category;

  return (
    <div className="border border-border rounded-2xl bg-card/80 p-5 space-y-4 text-sm">
      <div className="text-sm uppercase tracking-widest text-muted-foreground">{badgeLabel}</div>
      <h3 className="text-2xl font-black leading-tight" style={DOTO}>
        {form.title || 'Listing title preview'}
      </h3>
      <div className="w-full h-48 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900 border border-border relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle at top,rgba(249,169,38,0.25),transparent 60%)]" />
        <div className="relative z-10 h-full flex items-center justify-center text-xs uppercase tracking-[0.3em] text-white/60">
          Hero Image
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Offer Description</p>
        {lines.length > 0 ? (
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            {lines.map((line, index) => <li key={index}>{line}</li>)}
          </ul>
        ) : (
          <p className="text-muted-foreground">Describe the magic of your listing here.</p>
        )}
      </div>
      <div className="flex items-center justify-between text-2xl font-black">
        <span style={{ color: '#f59e0b' }}>${price}</span>
        <span className="text-xs text-muted-foreground">Instant Delivery</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="px-3 py-1 rounded-full bg-white/10 text-xs">Warranty</span>
        <span className="px-3 py-1 rounded-full bg-white/10 text-xs">24/7 Support</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [tab, setTab] = useState('listings');
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [previewMode, setPreviewMode] = useState(true);
  const [form, setForm] = useState({ game: 'World of Warcraft', category: 'Roblox', accountSubcategory: 'Roblox', title: '', description: '', price: '', priceUnit: 'per 1000 gold', minOrder: '100', maxOrder: '10000000', deliveryTime: '1-24 hours', stock: '99999' });
  const [createMsg, setCreateMsg] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    exposeToWindow();
    initApp();
    loadData();
  }, []);

  const loadData = async () => {
    const tok = localStorage.getItem('bounty_token');
    const user = localStorage.getItem('authenticated_username');
    if (!tok || !user) { setLoading(false); return; }
    setLoading(true);
    try {
      const [lr, or] = await Promise.all([
        fetch('/api/listings?sellerUsername=' + user + '&limit=50', { headers: { Authorization: 'Bearer ' + tok } }).then(r => r.json()),
        fetch('/api/orders?role=seller', { headers: { Authorization: 'Bearer ' + tok } }).then(r => r.json()),
      ]);
      setListings(lr.listings || []);
      setOrders(or.orders || []);
    } catch {}
    setLoading(false);
  };

  const handleCreate = async e => {
    e.preventDefault();
    const tok = localStorage.getItem('bounty_token');
    if (!tok) { window.openModal?.('login'); return; }
    if (!form.title || !form.price) { setCreateMsg('Title and price are required'); return; }
    setCreating(true); setCreateMsg('');
    try {
      const res = await fetch('/api/listings', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tok }, body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok) { setCreateMsg('âœ… Listing created!'); setShowCreate(false); loadData(); setForm(f => ({ ...f, title: '', description: '', price: '' })); }
      else setCreateMsg('âŒ ' + (data.message || 'Failed'));
    } catch { setCreateMsg('âŒ Network error'); }
    setCreating(false);
  };

  const deleteListing = async id => {
    if (!confirm('Delete this listing?')) return;
    const tok = localStorage.getItem('bounty_token');
    await fetch('/api/listings/' + id, { method: 'DELETE', headers: { Authorization: 'Bearer ' + tok } });
    loadData();
  };

  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.total || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'active').length;

  return (
    <>
      <Head><title>Seller Dashboard â€” Bounty</title></Head>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black">Seller Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your listings and track your sales</p>
          </div>
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary px-5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Listing
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: 'Active Listings',
              value: listings.filter((l) => l.isActive).length,
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                </svg>
              ),
            },
            {
              label: 'Pending Orders',
              value: pendingOrders,
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              ),
            },
            {
              label: 'Total Orders',
              value: orders.length,
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 11 12 14 22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              ),
            },
            {
              label: 'Revenue',
              value: '$' + totalRevenue.toFixed(2),
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              ),
            },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-slate-800/70 text-white shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                  {s.icon}
                </div>
              </div>
              <div
                className="text-2xl font-black text-white"
                style={{ textShadow: '0 12px 25px rgba(255,255,255,0.2)' }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Create listing form */}
        {showCreate && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="font-bold mb-4">Create New Listing</h2>
            {createMsg && <p className={'text-sm mb-3 px-3 py-2 rounded-md ' + (createMsg.startsWith('âœ…') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400')}>{createMsg}</p>}
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium block mb-1">Listing Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. WoW Gold - Fast Delivery - Shadowlands" className="seller-form-input" required />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Game *</label>
                <select value={form.game} onChange={e => setForm(f => ({ ...f, game: e.target.value }))} className="seller-form-input">
                  {GAMES.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Category *</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({
                    ...f,
                    category: e.target.value,
                    accountSubcategory: e.target.value === 'Accounts' ? (f.accountSubcategory || ACCOUNT_SUBCATS[0]) : '',
                  }))}
                  className="seller-form-input"
                >
                  {CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              {form.category === 'Accounts' && (
                <div>
                  <label className="text-sm font-medium block mb-1">Account Focus</label>
                  <select
                    value={form.accountSubcategory}
                    onChange={e => setForm(f => ({ ...f, accountSubcategory: e.target.value }))}
                    className="seller-form-input"
                  >
                    {ACCOUNT_SUBCATS.map(ac => <option key={ac}>{ac}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="text-sm font-medium block mb-1">Price ($) *</label>
                <input type="number" step="0.01" min="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="e.g. 2.50" className="seller-form-input" required />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Price Unit</label>
                <input value={form.priceUnit} onChange={e => setForm(f => ({ ...f, priceUnit: e.target.value }))} placeholder="e.g. per 1000 gold" className="seller-form-input" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Min Order</label>
                <input type="number" value={form.minOrder} onChange={e => setForm(f => ({ ...f, minOrder: e.target.value }))} className="seller-form-input" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Delivery Time</label>
                <select value={form.deliveryTime} onChange={e => setForm(f => ({ ...f, deliveryTime: e.target.value }))} className="seller-form-input">
                  <option>5-30 minutes</option><option>30 min - 2 hours</option><option>1-6 hours</option><option>1-24 hours</option><option>1-3 days</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium block mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe your listing, delivery method, requirements..." className="seller-form-textarea" rows={3} />
              </div>
              <div className="md:col-span-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Preview Mode</span>
                <button
                  type="button"
                  onClick={() => setPreviewMode(p => !p)}
                  className={'text-sm font-semibold transition-colors ' + (previewMode ? 'text-foreground' : 'text-muted-foreground')}
                >
                  {previewMode ? 'Live' : 'Paused'}
                </button>
              </div>
              {previewMode && (
                <div className="md:col-span-2">
                  <ListingPreview form={form} />
                </div>
              )}
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" disabled={creating} className="btn-primary px-6">{creating ? 'Creatingâ€¦' : 'Create Listing'}</button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-outline px-6">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-lg bg-muted mb-5 w-fit">
          {[['listings','My Listings'],['orders','Orders']].map(([v,l]) => (
            <button key={v} onClick={() => setTab(v)} className={'px-5 py-1.5 rounded-md text-sm font-semibold transition-colors ' + (tab === v ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
              {l} {v === 'orders' && pendingOrders > 0 && <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: '#ef4444', color: 'white' }}>{pendingOrders}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="auth-spinner" style={{ borderTopColor: 'var(--brand)' }} /></div>
        ) : tab === 'listings' ? (
          <div className="space-y-3">
            {listings.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground border border-border rounded-xl">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 opacity-30"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
                <p className="font-medium">No listings yet</p>
                <button onClick={() => setShowCreate(true)} className="mt-3 btn-primary px-5 text-sm">Create your first listing</button>
              </div>
            ) : listings.map(l => (
              <div key={l._id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold">{l.title}</span>
                    <span className={'text-xs px-2 py-0.5 rounded-full font-bold ' + (l.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-400')}>{l.isActive ? 'Active' : 'Inactive'}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full border border-border">{l.category}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{l.game} Â· {l.priceUnit} Â· ${l.price?.toFixed(2)}</div>
                </div>
                <div className="flex gap-2">
                  <Link href={'/listing/' + l._id} className="edit-btn">View</Link>
                  <button onClick={() => deleteListing(l._id)} className="edit-btn" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground border border-border rounded-xl">No orders yet</div>
            ) : orders.map(o => (
              <div key={o._id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold">{o.title || o.game}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: { pending: 'rgba(234,179,8,0.12)', active: 'rgba(59,130,246,0.12)', completed: 'rgba(22,163,74,0.12)' }[o.status] || 'rgba(107,114,128,0.1)', color: { pending: '#ca8a04', active: '#3b82f6', completed: '#16a34a' }[o.status] || '#6b7280' }}>{o.status?.toUpperCase()}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Buyer: <strong className="text-foreground">{o.buyerUsername}</strong> Â· Qty: {(o.quantity || 1).toLocaleString()} Â· {new Date(o.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black" style={{ color: 'var(--brand)' }}>${(o.total || 0).toFixed(2)}</div>
                  <button onClick={() => window.location.href = '/messages?to=' + o.buyerUsername} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Message buyer â†’</button>
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
          <div id="signup-modal" className="hidden"><h2 className="text-2xl font-bold text-center mb-4">Create Account</h2><p id="signup-error" className="hidden text-sm text-red-500 mb-3 text-center" /><form id="signup-form" className="space-y-3" onSubmit={e => window.handleSignupSubmit?.(e)}><input id="signup-username" type="text" placeholder="Username" className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm outline-none" /><input id="signup-password" type="password" placeholder="Password" className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm outline-none" /><input id="signup-confirm-password" type="password" placeholder="Confirm Password" className="w-full h-10 px-3 rounded-md bg-background border border-input text-foreground text-sm outline-none" /><button id="signup-submit-btn" type="submit" className="btn-brand">Sign Up</button></form><p className="text-center text-sm mt-4 text-muted-foreground">Have account? <button onClick={() => window.switchView?.('login')} className="text-foreground underline">Login</button></p></div>
        </div>
      </div>
    </>
  );
}

