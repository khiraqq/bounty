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
        <title>Browse Listings â€” Bounty Gaming Marketplace</title>
        <meta name="description" content="Browse thousands of verified gaming listings. Buy gold, accounts, items and services." />
      </Head>
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
              <p id="results-count" className="text-sm text-muted-foreground">Loadingâ€¦</p>
              <div className="flex items-center gap-2">
                <select id="sort-select" className="sort-select" onChange={e => sortListings(e.target.value)}>
                  <option value="">Featured</option>
                  <option value="price_asc">Price: Low â†’ High</option>
                  <option value="price_desc">Price: High â†’ Low</option>
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
                <p>Loading listingsâ€¦</p>
              </div>
            </div>
            {/* Pagination */}
            <div id="pagination" className="flex items-center justify-center gap-2 mt-8 hidden" />
          </div>
        </div>
      </div>
      <Footer />
    </>
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
          <p className="text-xs text-muted-foreground">Â© 2025 Bounty Gaming Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Secured by escrow protection on every transaction
          </div>
        </div>
      </div>
    </footer>
  );
}

// â”€â”€ CLIENT-SIDE LOGIC â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
  grid.innerHTML = '<div class="col-span-full text-center py-16 text-muted-foreground"><div class="auth-spinner mx-auto mb-3" style="border-top-color:var(--brand)"></div><p>Loadingâ€¦</p></div>';
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
  if (page > 1) html += '<button onclick="loadListings(\''+_game+'\',\''+_cat+'\',\''+_sort+'\','+(page-1)+')" class="pagination-btn">â† Prev</button>';
  for (var i = Math.max(1, page-2); i <= Math.min(pages, page+2); i++) {
    html += '<button onclick="loadListings(\''+_game+'\',\''+_cat+'\',\''+_sort+'\','+i+')" class="pagination-btn'+(i===page?' active':'')+'">' + i + '</button>';
  }
  if (page < pages) html += '<button onclick="loadListings(\''+_game+'\',\''+_cat+'\',\''+_sort+'\','+(page+1)+')" class="pagination-btn">Next â†’</button>';
  pag.innerHTML = html;
}

function renderCard(l) {
  var stars = Math.round(l.sellerRating || 5);
  var starStr = 'â˜…'.repeat(stars) + 'â˜†'.repeat(5 - stars);
  var dot = l.isSellerOnline ? '<span class="online-dot"></span>' : '<span class="offline-dot"></span>';
  var verified = l.isSellerVerified ? '<span class="verified-badge"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Verified</span>' : '';
  return '<a href="/listing/'+l._id+'" class="listing-card block">' +
    '<div class="flex items-center gap-2">' +
      '<div class="seller-avatar"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>' +
      '<div class="flex-1 min-w-0">' +
        '<div class="flex items-center gap-1.5">' + dot + '<span class="text-sm font-semibold truncate">' + esc(l.sellerUsername) + '</span>' + verified + '</div>' +
        '<div class="text-xs text-muted-foreground"><span style="color:#f59e0b">' + starStr + '</span> <span>(' + (l.sellerReviews || 0) + ')</span></div>' +
      '</div>' +
      (l.game ? '<span class="text-xs px-2 py-0.5 rounded-full font-medium" style="background:rgba(107,114,128,0.1);color:#d1d5db">' + esc(l.game) + '</span>' : '') +
    '</div>' +
    '<div class="flex-1">' +
      '<p class="text-sm font-semibold leading-snug mb-1 line-clamp-2">' + esc(l.title) + '</p>' +
      '<div class="flex items-center gap-3 text-xs text-muted-foreground"><span>âš¡ ' + esc(l.deliveryTime || '1-24 hours') + '</span><span>âœ“ ' + (l.completionRate || 100) + '%</span></div>' +
    '</div>' +
    '<div class="flex items-end justify-between pt-2 border-t" style="border-color:hsl(var(--border)/0.5)">' +
      '<div><div class="text-xs text-muted-foreground mb-0.5">' + esc(l.priceUnit || 'per unit') + '</div><div class="text-lg font-black" style="color:var(--brand)">$' + Number(l.price).toFixed(2) + '</div></div>' +
      '<button class="buy-btn" onclick="event.preventDefault();window.openModal&&window.openModal(\'login\')">Buy Now</button>' +
    '</div>' +
  '</a>';
}

function esc(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

