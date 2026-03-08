import Link from 'next/link';
import { useEffect } from 'react';
import { exposeToWindow, initApp } from '../utils/auth';

// ── Captcha helpers ────────────────────────────────────────────────────────────
function seededVal(code) {
  return code.split('').reduce((acc, ch, i) => acc + ch.charCodeAt(0) + i * 11, 0);
}
function jitter(seed, offset) {
  return ((Math.sin((seed + offset) * 0.37)) + 1) / 2;
}
function rng(min, max, t) {
  return min + (max - min) * t;
}

function renderCaptchaSVG(code) {
  const W = 150;
  const H = 50;
  const seed = seededVal(code);
  const hL = Array.from({ length: 3 }, (_, i) => {
    const y = rng(8, H - 8, jitter(seed, 10 + i));
    return `<line x1="6" x2="${W - 6}" y1="${y}" y2="${y}" stroke="#fff" stroke-width="0.35" stroke-opacity="0.12"/>`;
  });
  const vL = Array.from({ length: 3 }, (_, i) => {
    const x = rng(8, W - 8, jitter(seed, 20 + i));
    return `<line x1="${x}" x2="${x}" y1="6" y2="${H - 6}" stroke="#fff" stroke-width="0.35" stroke-opacity="0.12"/>`;
  });
  const ch = code.split('').map((c, i) => {
    const x = 28 + i * 30 + rng(-4, 4, jitter(seed, 80 + i)) - i * 2;
    const y = 32 + rng(-4, 4, jitter(seed, 90 + i));
    const r = rng(-14, 14, jitter(seed, 70 + i));
    return `<text x="${x}" y="${y}" fill="#f5f5f5" font-size="24" font-family="'Doto',sans-serif" font-weight="700" transform="rotate(${r} ${x} ${y})">${c}</text>`;
  });
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10" fill="#101010" stroke="rgba(255,255,255,0.08)"/>${hL.join('')}${vL.join('')}${ch.join('')}<g opacity="0.6" transform="translate(${W - 20},${H - 20})"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg></g></svg>`;
}

function genCaptchaCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ── Dropdown data ──────────────────────────────────────────────────────────────
const NAV_CATEGORIES = {
  Currency: {
    popular: [
      'WoW Classic Era Gold', 'Old School RuneScape Gold', 'Growtopia Locks', 'Roblox Robux',
      'DonutSMP Money', 'Blade Ball Tokens', 'Arc Raiders Coins', 'RuneScape 3 Gold',
      'EA Sports FC Coins', 'World of Warcraft Gold', 'Warframe Platinum', 'Delta Force Tekniq Alloy',
    ],
    all: ['8 Ball Pool Coins', 'Aion 2 Kinah', 'Albion Online Silver', 'Arc Raiders Coins', 'Black Desert Online Silver', 'Blade & Soul NEO Divine Gems', 'CS2 Coins', 'Diablo IV Gold', 'Final Fantasy XIV Gil', 'Guild Wars 2 Gold', 'Lost Ark Gold', 'Path of Exile Currency'],
  },
  Accounts: {
    popular: [
      'Grand Theft Auto 5', 'Fortnite', 'Valorant', 'Rainbow Six Siege X',
      'Roblox', 'Adopt Me', 'Call of Duty', 'Rocket League',
      'Old School RuneScape', 'League of Legends', 'Overwatch', 'Minecraft',
    ],
    all: ['8 Ball Pool', '99 Nights in the Forest', 'Adopt Me', 'Aion 2', 'Albion Online', 'All Star Tower Defense X', 'Animal Crossing: New Horizons', 'Anime Defenders', 'Apex Legends', 'Arc Raiders', 'Arena Breakout', 'Battlefield'],
  },
  Items: {
    popular: [
      'Steal a Brainrot', 'Roblox', 'Adopt Me', 'Arc Raiders',
      'Escape Tsunami For Brainrots', 'DonutSMP', 'Murder Mystery 2', 'Roblox Rivals',
      'Pokemon Go', 'Old School RuneScape', 'Blox Fruits', 'Anime Vanguards',
    ],
    all: ['Abyss', 'Adopt Me', 'Albion Online', 'All Star Tower Defense X', 'Animal Crossing: New Horizons', 'Anime Defenders', 'Apex Legends', 'Arc Raiders', 'Arena Breakout', 'Arena Breakout: Infinite', 'Battlefield', 'Blox Fruits'],
  },
  Boosting: {
    popular: [
      'Valorant', 'Rocket League', 'Rainbow Six Siege X', 'EA Sports FC',
      'Brawl Stars', 'Arc Raiders', 'League of Legends', 'Call of Duty',
      'Marvel Rivals', 'Overwatch', 'WoW Classic', 'Old School RuneScape',
    ],
    all: ['Anime Vanguards', 'Apex Legends', 'Arc Raiders', 'Arena Breakout', 'Arena Breakout: Infinite', 'Battlefield', 'Brawl Stars', 'Call of Duty', 'CS2', 'Destiny 2', 'Diablo IV', 'EA Sports FC'],
  },
  'Top Ups': {
    popular: [
      'Pokemon Go Top Ups', 'Genshin Impact Top Ups', 'Apex Legends Top Ups', 'Valorant Points',
      'Fortnite V-Bucks', 'Mobile Legends Diamonds', 'EA Sports FC Points', 'Call of Duty Points',
      'Spotify Subscription', 'Xbox Game Pass', 'PUBG Mobile UC', 'Honkai: Star Rail Oneiric Shards',
    ],
    all: ['8 Ball Pool Cash', 'Amazon Subscription', 'Apex Legends Top Ups', 'Arena Breakout Top Ups', 'Arknights: Endfield Origeometry', 'Brawl Stars Gems', 'Call of Duty Points', 'Clash of Clans Gems', 'EA Sports FC Points', 'Fortnite V-Bucks', 'Free Fire Diamonds', 'Genshin Impact Top Ups'],
  },
  Giftcards: {
    popular: [
      'Roblox Gift Cards', 'Valorant Gift Cards', 'Steam Gift Cards', 'Razer Gold',
      'Apple Gift Cards', 'PlayStation Gift Card', 'Discord Nitro', 'Steam Game Accounts',
      'Amazon Gift Cards', 'Xbox Gift Cards', 'PUBG Mobile Gift Cards', 'CD Keys',
    ],
    all: ['Amazon Gift Cards', 'Apple Gift Cards', 'Blizzard Gift Cards', 'CD Keys', 'Discord Nitro', 'EA Gift Cards', 'Epic Games Gift Cards', 'Google Play Gift Cards', 'iTunes Gift Cards', 'Nintendo eShop', 'PlayStation Gift Card', 'Razer Gold'],
  },
};

export default function Layout({ children }) {
  useEffect(() => {
    exposeToWindow();
    initApp();

    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const tok = p.get('token'), usr = p.get('username'), em = p.get('email'), meth = p.get('method');
      if (tok && usr) {
        localStorage.setItem('bounty_token', tok);
        localStorage.setItem('authenticated_username', usr);
        if (em) localStorage.setItem('authenticated_email', em);
        if (meth) localStorage.setItem('auth_method', meth);
        window.history.replaceState({}, '', window.location.pathname);
        window.location.reload();
      }
    }

    window.toggleTheme = () => {
      document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    };
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }

    window.toggleLocaleDropdown = () => document.getElementById('locale-panel')?.classList.toggle('hidden');
    window.saveLocaleSettings = () => {
      const lang = document.getElementById('language-select')?.value;
      const curr = document.getElementById('currency-select')?.value;
      const langMap = { en: 'EN', es: 'ES', fr: 'FR', de: 'DE', pt: 'PT', ja: 'JA' };
      const currMap = { USD: 'USD - $', EUR: 'EUR - €', GBP: 'GBP - £', BRL: 'BRL - R$', JPY: 'JPY - ¥' };
      if (lang) document.getElementById('current-language').textContent = langMap[lang] || lang.toUpperCase();
      if (curr) document.getElementById('current-currency').textContent = currMap[curr] || curr;
      document.getElementById('locale-panel')?.classList.add('hidden');
    };

    window.toggleProfileDropdown = () => document.getElementById('profile-dropdown')?.classList.toggle('hidden');
    window.closeProfileDropdown = () => document.getElementById('profile-dropdown')?.classList.add('hidden');

    let activeDropdown = null;
    let closeTimer = null;

    const openDropdown = (name) => {
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
      if (activeDropdown === name) return;
      document.querySelectorAll('.mega-dd').forEach((el) => el.classList.add('hidden'));
      const dd = document.getElementById(`dd-${name}`);
      if (dd) { dd.classList.remove('hidden'); activeDropdown = name; }
    };

    const scheduleClose = () => {
      closeTimer = setTimeout(() => {
        document.querySelectorAll('.mega-dd').forEach((el) => el.classList.add('hidden'));
        activeDropdown = null;
      }, 150);
    };

    const cancelClose = () => {
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    };

    ['Currency', 'Accounts', 'Items', 'Boosting', 'Top Ups', 'Giftcards'].forEach((cat) => {
      const btn = document.getElementById(`nav-btn-${cat.replace(' ', '-')}`);
      const dd = document.getElementById(`dd-${cat.replace(' ', '-')}`);
      if (btn) {
        btn.addEventListener('mouseenter', () => openDropdown(cat.replace(' ', '-')));
        btn.addEventListener('mouseleave', scheduleClose);
      }
      if (dd) {
        dd.addEventListener('mouseenter', cancelClose);
        dd.addEventListener('mouseleave', scheduleClose);
      }
    });

    document.addEventListener('input', (e) => {
      if (e.target?.classList.contains('dd-search-input')) {
        const val = e.target.value.toLowerCase();
        const container = e.target.closest('.mega-dd');
        container?.querySelectorAll('.dd-all-item').forEach((item) => {
          item.style.display = item.textContent.toLowerCase().includes(val) ? '' : 'none';
        });
      }
      if (e.target?.id === 'auth-captcha') updateSubmitState();
    });

    document.addEventListener('click', (e) => {
      if (!e.target?.closest('.mega-dd') && !e.target?.closest('[id^="nav-btn-"]')) {
        document.querySelectorAll('.mega-dd').forEach((el) => el.classList.add('hidden'));
        activeDropdown = null;
      }
      if (e.target?.closest('#captcha-refresh')) updateCaptcha();
      const profileBtn = document.getElementById('profile-button');
      const profileDD = document.getElementById('profile-dropdown');
      if (profileDD && profileBtn && !profileBtn.contains(e.target) && !profileDD.contains(e.target)) {
        profileDD.classList.add('hidden');
      }
      const localePanel = document.getElementById('locale-panel');
      const localeTrig = document.getElementById('locale-trigger');
      if (localePanel && localeTrig && !localeTrig.contains(e.target) && !localePanel.contains(e.target)) {
        localePanel.classList.add('hidden');
      }
    });

    let captchaCode = genCaptchaCode();

    const updateCaptcha = () => {
      captchaCode = genCaptchaCode();
      const box = document.getElementById('captcha-box');
      if (box) box.innerHTML = renderCaptchaSVG(captchaCode);
      const inp = document.getElementById('auth-captcha');
      if (inp) inp.value = '';
      updateSubmitState();
    };

    const updateSubmitState = () => {
      const inp = document.getElementById('auth-captcha');
      const btn = document.getElementById('modal-submit-btn');
      if (!inp || !btn) return;
      const valid = inp.value.toUpperCase() === captchaCode;
      btn.disabled = !valid;
      btn.style.opacity = valid ? '1' : '0.45';
    };

    window.openModal = (view = 'login') => {
      const overlay = document.getElementById('modal-overlay');
      if (!overlay) return;
      overlay.classList.remove('hidden');
      overlay.classList.add('flex');
      document.body.style.overflow = 'hidden';
      window.switchView(view);
      updateCaptcha();
    };

    window.closeModal = () => {
      const overlay = document.getElementById('modal-overlay');
      if (!overlay) return;
      overlay.classList.add('hidden');
      overlay.classList.remove('flex');
      document.body.style.overflow = '';
    };

    window.handleOverlayClick = (event) => {
      if (event.target === document.getElementById('modal-overlay') || event.target === document.getElementById('modal-backdrop')) {
        window.closeModal();
      }
    };

    window.switchView = (view) => {
      const isSignup = view === 'signup';
      document.getElementById('modal-signup-fields')?.classList.toggle('hidden', !isSignup);
      const heading = document.getElementById('modal-heading');
      const subtitle = document.getElementById('modal-subtitle');
      const submitBtn = document.getElementById('modal-submit-btn');
      const footerText = document.getElementById('modal-footer');
      if (heading) heading.textContent = isSignup ? 'Create an account' : 'Welcome back';
      if (subtitle) subtitle.textContent = isSignup ? 'Enter your details to create a new account' : 'Enter your username and password to access your account';
      if (submitBtn) submitBtn.textContent = isSignup ? 'Sign Up' : 'Log In';
      if (footerText) {
        footerText.innerHTML = isSignup
          ? `Already have an account? <button onclick="window.switchView('login')" class="font-bold underline underline-offset-4" style="color:hsl(var(--foreground))">Login</button>`
          : `Don't have an account? <button onclick="window.switchView('signup')" class="font-bold underline underline-offset-4" style="color:hsl(var(--foreground))">Sign up</button>`;
      }
      updateCaptcha();
    };

    const box = document.getElementById('captcha-box');
    if (box) box.innerHTML = renderCaptchaSVG(captchaCode);
  }, []);

  const categories = ['Currency', 'Accounts', 'Items', 'Boosting', 'Top Ups', 'Giftcards'];

  return (
    <>
      {/* ── TOP BAR ─────────────────────────────────────────────────────────── */}
      <div className="border-b text-xs" style={{ background: 'hsl(var(--topbar))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--topbar-foreground))' }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-1.5">
          <div className="flex items-center gap-1.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
            <span>24/7 Live Support</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative" id="locale-trigger">
              <button onClick={() => window.toggleLocaleDropdown?.()} className="flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                <span id="current-language">EN</span><span className="opacity-40 mx-0.5">|</span><span id="current-currency">USD - $</span>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <div id="locale-panel" className="hidden absolute right-0 top-full mt-2 w-52 rounded-xl border shadow-2xl z-50 p-4" style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Language</label>
                <select id="language-select" className="w-full rounded-lg border px-3 py-2 text-sm outline-none mb-3" style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}>
                  <option value="en">English</option><option value="es">Español</option><option value="fr">Français</option><option value="de">Deutsch</option><option value="pt">Português</option><option value="ja">日本語</option>
                </select>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Currency</label>
                <select id="currency-select" className="w-full rounded-lg border px-3 py-2 text-sm outline-none mb-3" style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}>
                  <option value="USD">USD - $</option><option value="EUR">EUR - €</option><option value="GBP">GBP - £</option><option value="BRL">BRL - R$</option><option value="JPY">JPY - ¥</option>
                </select>
                <button onClick={() => window.saveLocaleSettings?.()} className="w-full rounded-lg py-1.5 text-sm font-semibold transition-opacity hover:opacity-80" style={{ background: 'hsl(var(--foreground))', color: 'hsl(var(--background))' }}>Save</button>
              </div>
            </div>
            <button onClick={() => window.toggleTheme?.()} aria-label="Toggle theme" className="hover:opacity-80 transition-opacity cursor-pointer">
              <svg className="h-3.5 w-3.5 dark:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
              <svg className="h-3.5 w-3.5 hidden dark:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9"/><path d="M20 3v4M22 5h-4"/></svg>
            </button>
          </div>
        </div>
      </div>

