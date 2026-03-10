// FILE: pages/checkout.js
// Place at: pages/checkout.js
// Route: /checkout?listingId=xxx
// Triggered when user clicks "Buy Now" on a listing.
// Pure React — no document.getElementById, no innerHTML, all window/localStorage in useEffect.

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

// ── Shared style tokens (exact match to site) ─────────────────────────────────
const DOTO  = { fontFamily: "'Doto', sans-serif" };
const FG    = { color: 'hsl(var(--foreground))' };
const MUTED = { color: 'hsl(var(--muted-foreground))' };

const CARD = {
  background:  'hsl(var(--card))',
  borderColor: 'hsl(var(--border))',
};

const INPUT_CLS =
  'w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all';

const INPUT_STY = {
  background:  'hsl(var(--background))',
  borderColor: 'hsl(var(--border))',
  color:       'hsl(var(--foreground))',
};

// ── Inline crypto SVG icons ───────────────────────────────────────────────────
function BtcIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <circle cx="13" cy="13" r="13" fill="#F7931A"/>
      <path d="M17.1 11.35c.25-1.65-.99-2.54-2.68-3.13l.55-2.2-1.33-.33-.53 2.12-1.07-.27.54-2.14-1.34-.33-.55 2.2-2.14-.53-.32 1.4s.98.22.96.24c.54.13.63.5.62.78l-1.4 5.62c-.06.26-.28.5-.67.41 0 0-.98-.25-.98-.25l-.67 1.47 2.02.5 1.11.28-.56 2.28 1.34.33.55-2.2 1.07.27-.55 2.18 1.34.34.56-2.27c2.35.44 4.12.26 4.87-1.86.59-1.7-.03-2.68-1.29-3.32.92-.21 1.62-.82 1.8-2.07zm-3.22 4.51c-.42 1.66-3.23.76-4.14.54l.74-2.96c.91.23 3.82.68 3.4 2.42zm.42-4.52c-.38 1.52-2.73.75-3.49.56l.67-2.69c.76.19 3.2.55 2.82 2.13z" fill="#fff"/>
    </svg>
  );
}

function EthIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <circle cx="13" cy="13" r="13" fill="#627EEA"/>
      <path d="M13 5.2v6.11l5.17 2.31L13 5.2z" fill="white" fillOpacity=".6"/>
      <path d="M13 5.2L7.83 13.62 13 11.31V5.2z" fill="white"/>
      <path d="M13 17.46v3.34l5.17-7.15L13 17.46z" fill="white" fillOpacity=".6"/>
      <path d="M13 20.8v-3.34l-5.17-3.81L13 20.8z" fill="white"/>
      <path d="M13 16.47l5.17-3.05L13 11.31v5.16z" fill="white" fillOpacity=".2"/>
      <path d="M7.83 13.42L13 16.47V11.31l-5.17 2.11z" fill="white" fillOpacity=".6"/>
    </svg>
  );
}

function LtcIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <circle cx="13" cy="13" r="13" fill="#A5A9B3"/>
      <path d="M8.3 18.2h9.4v1.6H8.3v-1.6zm1.2-2.8l.8-3.6-1.2.4.4-1.6 1.2-.4 1.6-6.4h3.4L14.1 10l1.2-.4-.4 1.6-1.2.4-.8 3.6H9.5z" fill="white"/>
    </svg>
  );
}

function UsdtIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <circle cx="13" cy="13" r="13" fill="#26A17B"/>
      <path d="M14 14.1c-.08 0-.57.04-.97.04-.4 0-.88-.03-.96-.04V12.8c1.95.09 3.4.5 3.4.97 0 .47-1.45.87-3.4.97v-.67c-.08 0-.57.04-.97.04-.4 0-.88-.03-.96-.04v.67C8.6 14.65 7.15 14.25 7.15 13.77c0-.47 1.45-.88 3.4-.97V11.3H7.8V9.8h10.4v1.5h-2.75v1.5c1.96.1 3.4.5 3.4.97 0 .47-1.44.88-3.4.97v4.56H14v-4.7z" fill="white"/>
    </svg>
  );
}

function SolIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <circle cx="13" cy="13" r="13" fill="#9945FF"/>
      <path d="M8 17.5h10l-2 1.5H8l2-1.5zm0-4.5h10l-2 1.5H8L10 13zm2-4.5h10L18 10H8l2-1.5z" fill="white"/>
    </svg>
  );
}

const CRYPTOS = [
  { id: 'btc',  icon: <BtcIcon />,  label: 'Bitcoin',  symbol: 'BTC',  fee: 0.02  },
  { id: 'eth',  icon: <EthIcon />,  label: 'Ethereum', symbol: 'ETH',  fee: 0.015 },
  { id: 'ltc',  icon: <LtcIcon />,  label: 'Litecoin', symbol: 'LTC',  fee: 0.01  },
  { id: 'usdt', icon: <UsdtIcon />, label: 'USDT',     symbol: 'USDT', fee: 0.005 },
  { id: 'sol',  icon: <SolIcon />,  label: 'Solana',   symbol: 'SOL',  fee: 0.008 },
];

// ── Skeleton pulse bar ────────────────────────────────────────────────────────
function Skel({ w = 'w-24', h = 'h-4' }) {
  return (
    <div
      className={`${w} ${h} rounded-lg`}
      style={{ background: 'hsl(var(--secondary))', animation: 'pulse 1.5s ease-in-out infinite' }}
    />
  );
}

// ── Button spinner ────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <span style={{
      display: 'inline-block', width: 15, height: 15,
      borderRadius: '50%', border: '2px solid transparent',
      borderTopColor: 'currentColor',
      animation: 'co-spin .65s linear infinite',
    }} />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();
  const { listingId } = router.query;

  // ── Listing ─────────────────────────────────────────────────────────────────
  const [listing,    setListing]    = useState(null);
  const [lstLoading, setLstLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;
    if (!listingId) {
      // Preview fallback so the page is usable in dev without a real ID
      setListing({
        _id: 'preview', title: '1 Billion',
        platform: 'PlayStation 5', deliveryTime: 'Instant',
        price: 59.89, thumbnail: '',
      });
      setLstLoading(false);
      return;
    }
    fetch(`/api/listings/${listingId}`)
      .then(r => r.json())
      .then(d => setListing(d.listing || d))
      .catch(() => setListing(null))
      .finally(() => setLstLoading(false));
  }, [router.isReady, listingId]);

  // ── Selected coin ───────────────────────────────────────────────────────────
  const [selectedId, setSelectedId] = useState('btc');
  const crypto = CRYPTOS.find(c => c.id === selectedId) || CRYPTOS[0];

  // ── Pricing ─────────────────────────────────────────────────────────────────
  const orderPrice = listing ? Number(listing.price || 0) : 0;
  const paymentFee = parseFloat((orderPrice * crypto.fee).toFixed(2));
  const [discount, setDiscount] = useState(0);
  const total = parseFloat((orderPrice + paymentFee - discount).toFixed(2));

  // ── Discount ────────────────────────────────────────────────────────────────
  const [discOpen,    setDiscOpen]    = useState(false);
  const [discCode,    setDiscCode]    = useState('');
  const [discApplied, setDiscApplied] = useState(false);
  const [discError,   setDiscError]   = useState('');
  const [discLoading, setDiscLoading] = useState(false);

  async function applyDiscount() {
    if (!discCode.trim()) return;
    setDiscLoading(true);
    setDiscError('');
    try {
      const res  = await fetch('/api/discount/validate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ code: discCode.trim(), listingId }),
      });
      const data = await res.json();
      if (!res.ok) { setDiscError(data.message || 'Invalid code.'); return; }
      setDiscount(data.amount || 0);
      setDiscApplied(true);
    } catch {
      setDiscError('Could not validate code. Try again.');
    } finally {
      setDiscLoading(false);
    }
  }

  function removeDiscount() {
    setDiscApplied(false);
    setDiscount(0);
    setDiscCode('');
    setDiscError('');
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState('');

  async function handleContinue() {
    if (submitting || !listing) return;
    setSubmitError('');
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('bounty_token') : '';
    if (!token) {
      if (typeof window !== 'undefined') window.openModal?.('login');
      return;
    }
    setSubmitting(true);
    try {
      const res  = await fetch('/api/orders', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({
          listingId,
          paymentMethod: selectedId,
          discountCode:  discApplied ? discCode.trim() : '',
          warrantyPlan:  '14days',
        }),
      });
      const data = await res.json();
      if (!res.ok) { setSubmitError(data.message || 'Order failed. Please try again.'); return; }
      router.push(`/orders/${data.orderId || data._id}`);
    } catch {
      setSubmitError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>Secure Checkout — Bounty</title>
      </Head>

      {/* Dot-grid texture — same as site homepage */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0, opacity: 0.025,
          backgroundImage:
            'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),' +
            'linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative min-h-screen" style={{ background: 'hsl(var(--background))', zIndex: 1 }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 md:py-14">

          {/* ── Title row ──────────────────────────────────────────────────── */}
          <div className="relative flex items-center justify-center mb-10">
            <button
              onClick={() => router.back()}
              className="absolute left-0 w-9 h-9 rounded-xl border flex items-center justify-center transition-colors"
              style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--secondary))', color: 'hsl(var(--foreground))' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'hsl(var(--accent))'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'hsl(var(--secondary))'; }}
              aria-label="Go back"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h1 className="text-2xl font-black tracking-tight" style={{ ...DOTO, ...FG }}>
              Secure checkout
            </h1>
          </div>

          {/* ── Two-col grid ────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

            {/* ══════════════════════════════════
                LEFT
                ══════════════════════════════════ */}
            <div>

              {/* Listing strip */}
              <div className="flex items-center gap-4 pb-6 mb-7 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
                {/* Thumbnail */}
                <div
                  className="w-16 h-16 rounded-xl shrink-0 overflow-hidden border flex items-center justify-center"
                  style={{ background: 'hsl(var(--secondary))', borderColor: 'hsl(var(--border))' }}
                >
                  {lstLoading ? (
                    <div className="w-full h-full" style={{ background: 'hsl(var(--secondary))' }} />
                  ) : listing?.thumbnail ? (
                    <img src={listing.thumbnail} alt={listing.title} className="w-full h-full object-cover" />
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={MUTED}>
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  )}
                </div>

                {/* Title + meta */}
                <div>
                  {lstLoading ? (
                    <div className="space-y-2"><Skel w="w-36" h="h-4" /><Skel w="w-52" h="h-3" /></div>
                  ) : (
                    <>
                      <p className="font-bold text-[15px]" style={FG}>{listing?.title || '—'}</p>
                      <p className="text-sm mt-1 flex items-center gap-2 flex-wrap" style={MUTED}>
                        {listing?.platform && <span>{listing.platform}</span>}
                        {listing?.platform && listing?.deliveryTime && (
                          <span style={{ opacity: 0.35 }}>|</span>
                        )}
                        {listing?.deliveryTime && (
                          <span>Delivery time: <span className="font-semibold" style={FG}>{listing.deliveryTime}</span></span>
                        )}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Payment method */}
              <div>
                <h2 className="text-sm font-bold mb-4" style={FG}>Payment method</h2>

                {/* Cryptocurrency card — only option, always selected */}
                <div
                  className="rounded-xl border px-5 py-4"
                  style={{
                    background:  'hsl(var(--card))',
                    borderColor: 'hsl(var(--foreground))',
                  }}
                >
                  {/* Row: radio + label + coin icons */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {/* Filled radio dot */}
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                        style={{ borderColor: 'hsl(var(--foreground))' }}
                      >
                        <div className="w-[9px] h-[9px] rounded-full" style={{ background: 'hsl(var(--foreground))' }} />
                      </div>
                      <span className="text-sm font-semibold" style={FG}>Cryptocurrency</span>
                    </div>

                    {/* Clickable coin icons */}
                    <div className="flex items-center gap-[7px] shrink-0 flex-wrap">
                      {CRYPTOS.map(c => (
                        <button
                          key={c.id}
                          title={`${c.label} (${c.symbol})`}
                          onClick={() => setSelectedId(c.id)}
                          className="rounded-full transition-all duration-150"
                          style={{
                            opacity:       selectedId === c.id ? 1 : 0.45,
                            outline:       selectedId === c.id ? '2px solid hsl(var(--foreground))' : '2px solid transparent',
                            outlineOffset: '2px',
                          }}
                          onMouseEnter={e => { if (c.id !== selectedId) e.currentTarget.style.opacity = '0.85'; }}
                          onMouseLeave={e => { if (c.id !== selectedId) e.currentTarget.style.opacity = '0.45'; }}
                        >
                          {c.icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Selected coin detail */}
                  <div className="mt-3 pt-3 border-t flex items-center gap-2 text-xs" style={{ borderColor: 'hsl(var(--border))' }}>
                    <span style={MUTED}>Paying with</span>
                    <span className="font-bold" style={FG}>{crypto.label} ({crypto.symbol})</span>
                    <span style={{ opacity: 0.3, color: 'hsl(var(--foreground))' }}>·</span>
                    <span style={MUTED}>Network fee: {(crypto.fee * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

            </div>

            {/* ══════════════════════════════════
                RIGHT — Order Summary
                ══════════════════════════════════ */}
            <div className="lg:sticky lg:top-24">
              <div className="rounded-2xl border overflow-hidden" style={CARD}>

                {/* Summary body */}
                <div className="px-6 py-6">
                  <h2 className="text-[15px] font-bold mb-5" style={FG}>Order Summary</h2>

                  {/* Line items */}
                  <div className="space-y-[18px]">

                    {/* Order Price */}
                    <div className="flex items-center justify-between text-sm">
                      <span style={MUTED}>Order Price</span>
                      <span className="font-bold" style={FG}>
                        {lstLoading ? <Skel w="w-14" h="h-4" /> : `$${orderPrice.toFixed(2)}`}
                      </span>
                    </div>

                    {/* Account warranty — 14 Days, $0.00 */}
                    <div className="flex items-start justify-between text-sm gap-3">
                      <div>
                        <span style={MUTED}>Account warranty</span>
                        <div className="mt-[7px]">
                          <span
                            className="inline-flex items-center px-[10px] py-[5px] rounded-lg text-xs font-bold"
                            style={{ background: 'hsl(var(--foreground))', color: 'hsl(var(--background))' }}
                          >
                            14 Days
                          </span>
                        </div>
                      </div>
                      <span className="font-bold shrink-0 mt-0.5" style={FG}>$0.00</span>
                    </div>

                    {/* Payment fees */}
                    <div className="flex items-center justify-between text-sm">
                      <span style={MUTED}>Payment fees</span>
                      <span className="font-bold" style={FG}>
                        {lstLoading ? <Skel w="w-12" h="h-4" /> : `$${paymentFee.toFixed(2)}`}
                      </span>
                    </div>

                    {/* Discount — only when applied */}
                    {discApplied && discount > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span style={{ color: '#22c55e' }}>
                          Discount
                          <span className="ml-1 text-xs font-mono opacity-70">({discCode})</span>
                        </span>
                        <span className="font-bold" style={{ color: '#22c55e' }}>-${discount.toFixed(2)}</span>
                      </div>
                    )}

                  </div>

                  {/* Divider */}
                  <div className="my-5 border-t" style={{ borderColor: 'hsl(var(--border))' }} />

                  {/* Total */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-sm font-semibold" style={MUTED}>Total:</span>
                    <span className="text-[26px] font-black tracking-tight" style={{ ...DOTO, ...FG }}>
                      {lstLoading ? <Skel w="w-20" h="h-7" /> : `$${total.toFixed(2)}`}
                    </span>
                  </div>

                  {/* Submit error */}
                  {submitError && (
                    <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: '#ef444420', color: '#ef4444' }}>
                      {submitError}
                    </div>
                  )}

                  {/* Continue to payment */}
                  <button
                    onClick={handleContinue}
                    disabled={submitting || lstLoading || !listing}
                    className="w-full flex items-center justify-center gap-2 py-[15px] rounded-xl text-[15px] font-black tracking-wide transition-opacity"
                    style={{
                      background: 'hsl(var(--foreground))',
                      color:      'hsl(var(--background))',
                      opacity:    submitting || lstLoading || !listing ? 0.5 : 1,
                      cursor:     submitting || lstLoading || !listing ? 'not-allowed' : 'pointer',
                    }}
                    onMouseEnter={e => { if (!submitting && listing) e.currentTarget.style.opacity = '0.85'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = submitting || !listing ? '0.5' : '1'; }}
                  >
                    {submitting ? (
                      <><Spinner /><span style={{ marginLeft: 7 }}>Processing...</span></>
                    ) : (
                      <>
                        Continue to payment
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </>
                    )}
                  </button>

                  {/* Discount link */}
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => { setDiscOpen(v => !v); setDiscError(''); }}
                      className="text-sm underline underline-offset-4 transition-opacity hover:opacity-60"
                      style={MUTED}
                    >
                      Have a discount code?
                    </button>
                  </div>

                  {/* Discount panel */}
                  {discOpen && (
                    <div className="mt-3">
                      {discApplied ? (
                        <div
                          className="flex items-center justify-between px-4 py-3 rounded-xl border text-sm"
                          style={{ borderColor: '#22c55e55', background: '#22c55e10' }}
                        >
                          <span style={{ color: '#22c55e' }}>
                            Code applied: <strong className="font-mono">{discCode}</strong>
                          </span>
                          <button
                            onClick={removeDiscount}
                            className="text-xs ml-3 underline underline-offset-2 transition-opacity hover:opacity-60"
                            style={{ color: '#22c55e' }}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={discCode}
                              onChange={e => { setDiscCode(e.target.value.toUpperCase()); setDiscError(''); }}
                              onKeyDown={e => e.key === 'Enter' && applyDiscount()}
                              placeholder="ENTER CODE"
                              className={INPUT_CLS}
                              style={INPUT_STY}
                            />
                            <button
                              onClick={applyDiscount}
                              disabled={discLoading || !discCode.trim()}
                              className="px-4 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-80 disabled:opacity-40 shrink-0"
                              style={{ background: 'hsl(var(--foreground))', color: 'hsl(var(--background))' }}
                            >
                              {discLoading ? <Spinner /> : 'Apply'}
                            </button>
                          </div>
                          {discError && (
                            <p className="mt-1.5 text-xs" style={{ color: '#ef4444' }}>{discError}</p>
                          )}
                        </>
                      )}
                    </div>
                  )}

                </div>

                {/* Trust badges */}
                <div
                  className="border-t px-6 py-5 space-y-5"
                  style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--secondary))' }}
                >

                  {/* Safe & Secure Payment */}
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: '#22c55e18', border: '1px solid #22c55e40' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <polyline points="9 12 11 14 15 10" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={FG}>Safe &amp; Secure Payment</p>
                      <p className="text-xs mt-0.5 leading-[1.55]" style={MUTED}>
                        100% Secure payments guarantee by{' '}
                        <button
                          className="underline underline-offset-2 transition-opacity hover:opacity-70"
                          style={FG}
                        >
                          TradeShield
                        </button>
                        {' '}and our{' '}
                        <Link href="/refund-policy" className="underline underline-offset-2 transition-opacity hover:opacity-70" style={FG}>
                          Refund Policy
                        </Link>
                      </p>
                    </div>
                  </div>

                  {/* Account Warranty */}
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: '#3b82f618', border: '1px solid #3b82f640' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={FG}>Account Warranty</p>
                      <p className="text-xs mt-0.5 leading-[1.55]" style={MUTED}>
                        All account purchases are covered by a{' '}
                        <Link href="/warranty" className="underline underline-offset-2 transition-opacity hover:opacity-70" style={FG}>
                          14-day Account Warranty
                        </Link>
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes co-spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
      `}</style>
    </>
  );
}
