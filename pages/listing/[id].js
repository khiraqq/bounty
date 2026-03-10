// FILE: pages/listing/[id].js
// Route: /listing/:id
// Full listing detail page — matches site CSS variables exactly.
// No emojis. No external images. All icons are inline SVG.

import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

// ─── Shared style tokens ──────────────────────────────────────────────────────
const DOTO  = { fontFamily: "'Doto', sans-serif" };
const FG    = { color: 'hsl(var(--foreground))' };
const MUTED = { color: 'hsl(var(--muted-foreground))' };
const CARD  = { background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' };
const SEP   = { borderColor: 'hsl(var(--border))' };

// ─── Tiny spinner ─────────────────────────────────────────────────────────────
function Spinner({ size = 20 }) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size,
      borderRadius: '50%', border: '2px solid transparent',
      borderTopColor: 'hsl(var(--foreground))',
      animation: 'ld-spin .65s linear infinite',
    }} />
  );
}

// ─── Skeleton pulse bar ───────────────────────────────────────────────────────
function Skel({ w = 'w-24', h = 'h-4', cls = '' }) {
  return (
    <div
      className={`${w} ${h} rounded-lg ${cls}`}
      style={{ background: 'hsl(var(--secondary))', animation: 'ld-pulse 1.5s ease-in-out infinite' }}
    />
  );
}

// ─── Verified checkmark badge ─────────────────────────────────────────────────
function VerifiedBadge() {
  return (
    <span
      className="inline-flex items-center justify-center w-4 h-4 rounded-full shrink-0"
      style={{ background: '#22c55e' }}
      title="Verified seller"
    >
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}

// ─── Thumbs-up SVG (white fill) ───────────────────────────────────────────────
function ThumbsUp({ size = 14, color = 'hsl(var(--foreground))' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

// ─── Solana icon (inline SVG) ─────────────────────────────────────────────────
function SolanaIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 397.7 311.7" fill="none">
      <defs>
        <linearGradient id="sol-a" x1="360.8" y1="351.4" x2="141.2" y2="-69.6" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#9945FF"/>
          <stop offset=".14" stopColor="#8752F3"/>
          <stop offset=".42" stopColor="#5497D5"/>
          <stop offset=".68" stopColor="#43B4CA"/>
          <stop offset=".88" stopColor="#28E0B9"/>
          <stop offset="1" stopColor="#19FB9B"/>
        </linearGradient>
      </defs>
      <path d="M64.6 237.9a12.6 12.6 0 0 1 8.9-3.7h317.8a6.3 6.3 0 0 1 4.4 10.7l-56.1 56.1a12.6 12.6 0 0 1-8.9 3.7H12.9a6.3 6.3 0 0 1-4.4-10.7l56.1-56.1z" fill="url(#sol-a)"/>
      <path d="M64.6 3.7A12.9 12.9 0 0 1 73.5 0h317.8a6.3 6.3 0 0 1 4.4 10.7l-56.1 56.1a12.6 12.6 0 0 1-8.9 3.7H12.9a6.3 6.3 0 0 1-4.4-10.7L64.6 3.7z" fill="url(#sol-a)"/>
      <path d="M333.1 120.1a12.6 12.6 0 0 0-8.9-3.7H6.3a6.3 6.3 0 0 0-4.4 10.7l56.1 56.1a12.6 12.6 0 0 0 8.9 3.7h317.8a6.3 6.3 0 0 0 4.4-10.7l-56-56.1z" fill="url(#sol-a)"/>
    </svg>
  );
}

// ─── Litecoin icon ────────────────────────────────────────────────────────────
function LitecoinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 26 26" fill="none">
      <circle cx="13" cy="13" r="13" fill="#A5A9B3"/>
      <path d="M8.3 18.2h9.4v1.6H8.3v-1.6zm1.2-2.8l.8-3.6-1.2.4.4-1.6 1.2-.4 1.6-6.4h3.4L14.1 10l1.2-.4-.4 1.6-1.2.4-.8 3.6H9.5z" fill="white"/>
    </svg>
  );
}

// ─── Relative time helper ─────────────────────────────────────────────────────
function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `about ${mins} minute${mins > 1 ? 's' : ''} ago`;
  if (hours < 24) return `about ${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 30)  return `about ${days} day${days > 1 ? 's' : ''} ago`;
  return new Date(dateStr).toLocaleDateString();
}

// ─── Mask username — show first 3 chars + *** ─────────────────────────────────
function maskUsername(name = '') {
  if (name.length <= 3) return name + '***';
  return name.slice(0, 3) + '***';
}

// ─── "More like this" mini card ───────────────────────────────────────────────
function SimilarCard({ listing }) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/listing/${listing._id}`)}
      className="rounded-xl border flex flex-col cursor-pointer transition-all shrink-0"
      style={{
        ...CARD,
        width: 200,
        minWidth: 200,
        padding: '14px',
        transition: 'border-color .15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'hsl(var(--foreground)/0.35)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'hsl(var(--border))'; }}
    >
      {/* Thumbnail */}
      <div
        className="w-full rounded-lg overflow-hidden mb-3 flex items-center justify-center"
        style={{ height: 90, background: 'hsl(var(--secondary))' }}
      >
        {listing.thumbnail ? (
          <img src={listing.thumbnail} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={MUTED}>
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        )}
      </div>
      {/* Title */}
      <p
        className="text-xs font-semibold leading-snug mb-2"
        style={{ ...FG, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
      >
        {listing.title}
      </p>
      {/* Seller row */}
      <div className="flex items-center gap-1 mb-2">
        <span className="text-xs truncate" style={MUTED}>{listing.sellerUsername}</span>
        {listing.isSellerVerified && <VerifiedBadge />}
        {listing.sellerPositiveRate != null && (
          <span className="text-xs ml-auto shrink-0" style={MUTED}>{listing.sellerPositiveRate}%</span>
        )}
      </div>
      {/* Price + delivery */}
      <div className="flex items-center justify-between mt-auto">
        <span className="text-sm font-black" style={FG}>${Number(listing.price).toFixed(2)}</span>
        <span className="text-xs flex items-center gap-1" style={MUTED}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          {listing.deliveryTime || 'Instant'}
        </span>
      </div>
    </div>
  );
}

// ─── "More like this" GRID card (Image 2 style) ───────────────────────────────
function GridCard({ listing }) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/listing/${listing._id}`)}
      className="rounded-xl border p-4 flex flex-col gap-2 cursor-pointer transition-all"
      style={CARD}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'hsl(var(--foreground)/0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'hsl(var(--border))'; }}
    >
      {/* Top row: category badge + thumbnail */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {listing.category && (
            <span
              className="inline-flex items-center gap-1.5 text-xs font-medium mb-1.5"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              {listing.category}
            </span>
          )}
          <p
            className="text-sm font-semibold leading-snug"
            style={{ ...FG, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {listing.title}
          </p>
        </div>
        <div
          className="w-14 h-14 rounded-lg shrink-0 overflow-hidden flex items-center justify-center"
          style={{ background: 'hsl(var(--secondary))' }}
        >
          {listing.thumbnail ? (
            <img src={listing.thumbnail} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={MUTED}>
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          )}
        </div>
      </div>

      {/* Seller row */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold truncate" style={FG}>{listing.sellerUsername}</span>
        {listing.isSellerVerified && <VerifiedBadge />}
        {listing.sellerPositiveRate != null && (
          <span className="text-xs ml-auto shrink-0" style={MUTED}>
            {listing.sellerPositiveRate}% ({listing.sellerReviewCount?.toLocaleString()})
          </span>
        )}
      </div>

      {/* Price + delivery */}
      <div className="flex items-center justify-between pt-1 border-t" style={SEP}>
        <span className="text-base font-black" style={FG}>${Number(listing.price).toFixed(2)}</span>
        <span className="text-xs flex items-center gap-1" style={MUTED}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          {listing.deliveryTime || 'Instant'}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function ListingDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  // ── Listing data ─────────────────────────────────────────────────────────────
  const [listing,     setListing]     = useState(null);
  const [lstLoading,  setLstLoading]  = useState(true);
  const [lstError,    setLstError]    = useState(false);

  // ── Similar listings (horizontal scroll) ────────────────────────────────────
  const [similar,       setSimilar]       = useState([]);
  const [simPage,       setSimPage]       = useState(1);
  const [simTotalPages, setSimTotalPages] = useState(1);
  const simScrollRef = useRef(null);

  // ── More like this (grid) ────────────────────────────────────────────────────
  const [moreLike,       setMoreLike]       = useState([]);
  const [moreLikeLoading, setMoreLikeLoading] = useState(false);

  // ── Seller reviews ───────────────────────────────────────────────────────────
  const [reviews,       setReviews]       = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [seller,        setSeller]        = useState(null);

  // ── Load main listing ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!router.isReady || !id) return;
    setLstLoading(true);
    setLstError(false);
    fetch(`/api/listings/${id}`)
      .then(r => r.json())
      .then(d => {
        const l = d.listing || d;
        setListing(l);
        // Load seller info, similar, reviews in parallel
        if (l.sellerId || l.sellerUsername) {
          loadSellerData(l.sellerId || l.sellerUsername, l._id, l.game, l.category);
        }
      })
      .catch(() => setLstError(true))
      .finally(() => setLstLoading(false));
  }, [router.isReady, id]);

  async function loadSellerData(sellerId, listingId, game, category) {
    // Seller profile
    try {
      const s = await fetch(`/api/seller/${sellerId}`).then(r => r.json());
      setSeller(s.seller || s);
    } catch {}

    // Reviews
    setReviewsLoading(true);
    try {
      const rv = await fetch(`/api/reviews?sellerId=${sellerId}&limit=5`).then(r => r.json());
      setReviews(rv.reviews || []);
    } catch {}
    setReviewsLoading(false);

    // Similar listings (horizontal strip)
    try {
      const q = new URLSearchParams({ limit: '12', exclude: listingId });
      if (game) q.set('game', game);
      if (category) q.set('category', category);
      const sd = await fetch(`/api/listings?${q}`).then(r => r.json());
      setSimilar(sd.listings || []);
      setSimTotalPages(Math.ceil((sd.total || 12) / 4));
    } catch {}

    // More like this grid
    setMoreLikeLoading(true);
    try {
      const q2 = new URLSearchParams({ limit: '9', exclude: listingId });
      if (game) q2.set('game', game);
      const md = await fetch(`/api/listings?${q2}`).then(r => r.json());
      setMoreLike(md.listings || []);
    } catch {}
    setMoreLikeLoading(false);
  }

  // ── Horizontal scroll ─────────────────────────────────────────────────────
  function scrollSimilar(dir) {
    simScrollRef.current?.scrollBy({ left: dir * 220, behavior: 'smooth' });
    setSimPage(p => Math.max(1, Math.min(simTotalPages, p + dir)));
  }

  // ── Buy Now handler ──────────────────────────────────────────────────────────
  function handleBuyNow() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('bounty_token') : '';
    if (!token) {
      if (typeof window !== 'undefined') window.openModal?.('login');
      return;
    }
    router.push(`/checkout?listingId=${listing._id}`);
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  const isLoading = lstLoading;

  return (
    <>
      <Head>
        <title>{listing ? `${listing.title} — Bounty` : 'Listing — Bounty'}</title>
      </Head>

      <div className="min-h-screen" style={{ background: 'hsl(var(--background))' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 md:py-10">

          {/* ── Back link ── */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70"
              style={MUTED}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Back to all offers
            </button>
          </div>

          {/* ── Main two-column grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">

            {/* ════════════════════════════
                LEFT COLUMN
                ════════════════════════════ */}
            <div>

              {/* ── Listing title ── */}
              <div className="mb-4">
                {isLoading ? (
                  <Skel w="w-72" h="h-7" />
                ) : lstError ? (
                  <p className="text-sm" style={{ color: '#ef4444' }}>Failed to load listing.</p>
                ) : (
                  <h1 className="text-xl font-black leading-tight" style={FG}>
                    {listing?.title}
                  </h1>
                )}
              </div>

              {/* ── Divider ── */}
              <div className="border-t mb-5" style={SEP} />

              {/* ── Seller image / listing image ── */}
              <div
                className="w-full rounded-2xl overflow-hidden border mb-8 flex items-center justify-center"
                style={{ ...CARD, minHeight: 220, maxHeight: 420 }}
              >
                {isLoading ? (
                  <div className="w-full h-64 animate-pulse" style={{ background: 'hsl(var(--secondary))' }} />
                ) : listing?.thumbnail ? (
                  <img
                    src={listing.thumbnail}
                    alt={listing.title}
                    className="w-full object-cover"
                    style={{ maxHeight: 420 }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 py-16" style={MUTED}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span className="text-sm">No image provided</span>
                  </div>
                )}
              </div>

              {/* ── Horizontal "More like this" strip ── */}
              {!isLoading && similar.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold" style={FG}>More like this</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-xs" style={MUTED}>
                        Page {simPage} of {simTotalPages}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => scrollSimilar(-1)}
                          className="w-7 h-7 rounded-lg border flex items-center justify-center transition-colors"
                          style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--secondary))', color: 'hsl(var(--foreground))' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'hsl(var(--foreground)/0.4)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'hsl(var(--border))'; }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => scrollSimilar(1)}
                          className="w-7 h-7 rounded-lg border flex items-center justify-center transition-colors"
                          style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--secondary))', color: 'hsl(var(--foreground))' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'hsl(var(--foreground)/0.4)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'hsl(var(--border))'; }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div
                    ref={simScrollRef}
                    className="flex gap-3 overflow-x-auto pb-2"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {similar.map(s => <SimilarCard key={s._id} listing={s} />)}
                  </div>
                </div>
              )}

              {/* ── Offer Description ── */}
              <div className="mb-8">
                <h2 className="text-base font-bold mb-3" style={FG}>Offer description</h2>
                <div
                  className="rounded-xl border p-5 text-sm leading-relaxed"
                  style={{ ...CARD, whiteSpace: 'pre-wrap', color: 'hsl(var(--muted-foreground))' }}
                >
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skel w="w-full" h="h-3" />
                      <Skel w="w-5/6" h="h-3" />
                      <Skel w="w-4/6" h="h-3" />
                    </div>
                  ) : (
                    listing?.description || 'No description provided.'
                  )}
                </div>
              </div>

              {/* ── "More like this" GRID section ── */}
              {moreLike.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold" style={FG}>More like this</h2>
                    <Link
                      href={`/browse?game=${encodeURIComponent(listing?.game || '')}&category=${encodeURIComponent(listing?.category || '')}`}
                      className="text-sm font-semibold transition-opacity hover:opacity-70"
                      style={{ color: 'hsl(var(--foreground))', textDecoration: 'underline', textUnderlineOffset: 4 }}
                    >
                      All offers
                    </Link>
                  </div>

                  {moreLikeLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="rounded-xl border p-4 space-y-3" style={CARD}>
                          <Skel w="w-full" h="h-16" />
                          <Skel w="w-3/4" h="h-3" />
                          <Skel w="w-1/2" h="h-3" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {moreLike.map(l => <GridCard key={l._id} listing={l} />)}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ════════════════════════════
                RIGHT COLUMN
                ════════════════════════════ */}
            <div className="lg:sticky lg:top-24 flex flex-col gap-4">

              {/* ── Price + Details card ── */}
              <div className="rounded-2xl border overflow-hidden" style={CARD}>
                <div className="px-6 py-5">

                  {/* Price */}
                  {isLoading ? (
                    <Skel w="w-28" h="h-8" cls="mb-5" />
                  ) : (
                    <div className="text-3xl font-black mb-5" style={{ ...DOTO, ...FG }}>
                      ${Number(listing?.price || 0).toFixed(2)}
                    </div>
                  )}

                  {/* ── Divider ── */}
                  <div className="border-t mb-4" style={SEP} />

                  {/* Delivery time row */}
                  <div className="flex items-center justify-between py-3 border-b" style={SEP}>
                    <div className="flex items-center gap-1.5 text-sm" style={MUTED}>
                      Delivery time
                      {/* Question mark circle — non-interactive */}
                      <span
                        className="inline-flex items-center justify-center w-4 h-4 rounded-full border text-xs"
                        style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                      >?</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold" style={FG}>
                      {/* Lightning bolt for "Instant" */}
                      {(listing?.deliveryTime === 'Instant' || !listing?.deliveryTime) && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="hsl(var(--foreground))" stroke="none">
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                        </svg>
                      )}
                      {isLoading ? <Skel w="w-14" h="h-4" /> : (listing?.deliveryTime || 'Instant')}
                    </div>
                  </div>

                  {/* Warranty row */}
                  <div className="flex items-center justify-between py-3 border-b mb-5" style={SEP}>
                    <div className="flex items-center gap-1.5 text-sm" style={MUTED}>
                      Warranty
                      <span
                        className="inline-flex items-center justify-center w-4 h-4 rounded-full border text-xs"
                        style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                      >?</span>
                    </div>
                    <span className="text-sm font-semibold" style={FG}>14 Days Free</span>
                  </div>

                  {/* Buy Now button */}
                  <button
                    onClick={handleBuyNow}
                    disabled={isLoading}
                    className="w-full py-4 rounded-xl text-base font-black tracking-wide transition-opacity"
                    style={{
                      background:  'hsl(var(--foreground))',
                      color:       'hsl(var(--background))',
                      opacity:     isLoading ? 0.5 : 1,
                      cursor:      isLoading ? 'not-allowed' : 'pointer',
                    }}
                    onMouseEnter={e => { if (!isLoading) e.currentTarget.style.opacity = '0.85'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = isLoading ? '0.5' : '1'; }}
                  >
                    Buy now
                  </button>
                </div>

                {/* ── Trust badges ── */}
                <div
                  className="border-t px-6 py-4 space-y-3"
                  style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--secondary))' }}
                >

                  {/* Money-back Guarantee */}
                  <div className="flex items-center gap-2.5 text-xs">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--foreground))" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      <polyline points="9 12 11 14 15 10"/>
                    </svg>
                    <span className="font-bold" style={FG}>Money-back Guarantee</span>
                    <span style={MUTED}>Protected by Bounty Protection</span>
                  </div>

                  {/* Fast Checkout Options */}
                  <div className="flex items-center gap-2.5 text-xs">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="hsl(var(--foreground))" stroke="none">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                    <span className="font-bold" style={FG}>Fast Checkout Options</span>
                    <div className="flex items-center gap-1.5 ml-1">
                      <SolanaIcon />
                      <LitecoinIcon />
                    </div>
                  </div>

                  {/* 24/7 Live Support */}
                  <div className="flex items-center gap-2.5 text-xs">
                    {/* Headset icon */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--foreground))" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
                      <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
                    </svg>
                    <span className="font-bold" style={FG}>24/7 Live Support</span>
                    <span style={MUTED}>We're always here to help</span>
                  </div>

                </div>
              </div>

              {/* ── Seller card ── */}
              <div className="rounded-2xl border overflow-hidden" style={CARD}>
                <div className="px-6 py-5">

                  {/* Seller header */}
                  <div className="flex items-center gap-3 mb-5">
                    {/* Round avatar */}
                    <div
                      className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center overflow-hidden border"
                      style={{ background: 'hsl(var(--secondary))', borderColor: 'hsl(var(--border))' }}
                    >
                      {seller?.avatar ? (
                        <img src={seller.avatar} alt={seller.username} className="w-full h-full object-cover" />
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={MUTED}>
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Username + verified badge */}
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm truncate" style={FG}>
                          {listing?.sellerUsername || seller?.username || '—'}
                        </span>
                        {(seller?.isVerified || listing?.isSellerVerified) && <VerifiedBadge />}
                      </div>

                      {/* Rating + reviews */}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <ThumbsUp size={13} color="hsl(var(--foreground))" />
                        <span className="text-xs font-semibold" style={FG}>
                          {seller?.positiveRate ?? listing?.sellerPositiveRate ?? 100}%
                        </span>
                        {(seller?.reviewCount || listing?.sellerReviews) ? (
                          <Link
                            href={`/seller/${listing?.sellerUsername || seller?.username}#reviews`}
                            className="text-xs underline underline-offset-2 transition-opacity hover:opacity-70"
                            style={{ color: 'hsl(var(--foreground))' }}
                          >
                            {(seller?.reviewCount || listing?.sellerReviews || 0).toLocaleString()} Reviews
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Recent Feedback */}
                  <h3 className="text-sm font-bold mb-3" style={FG}>Recent feedback</h3>
                  <div className="border-t mb-3" style={SEP} />

                  {reviewsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3">
                          <Skel w="w-4" h="h-4" />
                          <Skel w="w-24" h="h-3" />
                          <div className="ml-auto"><Skel w="w-20" h="h-3" /></div>
                        </div>
                      ))}
                    </div>
                  ) : reviews.length === 0 ? (
                    <p className="text-xs" style={MUTED}>No reviews yet.</p>
                  ) : (
                    <div className="space-y-0">
                      {reviews.map((rv, idx) => (
                        <div key={rv._id || idx}>
                          <div className="py-3 flex items-start justify-between gap-3">
                            {/* Left: thumbs-up + category + | + masked username */}
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                              <ThumbsUp size={14} color="hsl(var(--foreground))" />
                              <span className="text-xs font-semibold" style={FG}>
                                {rv.category || listing?.category || 'Accounts'}
                              </span>
                              {/* Vertical bar separator */}
                              <span className="text-xs select-none" style={{ color: 'hsl(var(--border))', fontWeight: 700 }}>|</span>
                              <span className="text-xs truncate" style={MUTED}>
                                {maskUsername(rv.buyerUsername || rv.username || 'user')}
                              </span>
                            </div>
                            {/* Right: relative time */}
                            <span className="text-xs shrink-0 whitespace-nowrap" style={MUTED}>
                              {rv.createdAt ? relativeTime(rv.createdAt) : 'recently'}
                            </span>
                          </div>
                          {/* Optional review text */}
                          {rv.comment && (
                            <p className="text-xs pb-2 leading-relaxed" style={MUTED}>{rv.comment}</p>
                          )}
                          {idx < reviews.length - 1 && (
                            <div className="border-t" style={SEP} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* All feedback button */}
                  <div className="mt-4">
                    <Link
                      href={`/seller/${listing?.sellerUsername || seller?.username}#reviews`}
                      className="inline-flex items-center px-4 py-2 rounded-xl border text-sm font-semibold transition-colors"
                      style={{
                        borderColor: 'hsl(var(--border))',
                        background:  'hsl(var(--secondary))',
                        color:       'hsl(var(--foreground))',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'hsl(var(--accent))'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'hsl(var(--secondary))'; }}
                    >
                      All feedback
                    </Link>
                  </div>

                </div>
              </div>

            </div>
            {/* end right column */}
          </div>
        </div>
      </div>

      {/* Global keyframes */}
      <style>{`
        @keyframes ld-spin  { to { transform: rotate(360deg); } }
        @keyframes ld-pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
      `}</style>
    </>
  );
}
      {false && (
        <>
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
                      <Link href="/become-a-seller" className="text-sm font-semibold px-3 py-1.5 rounded-md" style={{ background: 'rgba(107,114,128,0.1)', color: '#d1d5db', border: '1px solid rgba(107,114,128,0.2)' }}>Sell on Bounty</Link>
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

        </>
      )}
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

