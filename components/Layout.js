
// FILE: components/Layout.js
// Global layout — sticky nav, single "Log In" button, auth modal, theme toggle

import Link from 'next/link';
import { useEffect } from 'react';
import { exposeToWindow, initApp } from '../utils/auth';

// -- Captcha helpers ------------------------------------------------------------
function seededVal(code) {
  return code.split('').reduce((acc, ch, i) => acc + ch.charCodeAt(0) + i * 11, 0);
}
function jitter(seed, offset) {
  const v = Math.sin((seed + offset) * 0.37);
  return (v + 1) / 2;
}
function rng(min, max, t) { return min + (max - min) * t; }

function renderCaptchaSVG(code) {
  const W = 150, H = 50;
  const seed = seededVal(code);
  const hLines = Array.from({ length: 3 }, (_, i) => {
    const y = rng(8, H - 8, jitter(seed, 10 + i));
    return `<line x1="6" x2="${W - 6}" y1="${y}" y2="${y}" stroke="#fff" stroke-width="0.35" stroke-opacity="0.12"/>`;
  });
  const vLines = Array.from({ length: 3 }, (_, i) => {
    const x = rng(8, W - 8, jitter(seed, 20 + i));
    return `<line x1="${x}" x2="${x}" y1="6" y2="${H - 6}" stroke="#fff" stroke-width="0.35" stroke-opacity="0.12"/>`;
  });
  const chars = code.split('').map((ch, i) => {
    const x = 28 + i * 30 + rng(-4, 4, jitter(seed, 80 + i)) - i * 2;
    const y = 32 + rng(-4, 4, jitter(seed, 90 + i));
    const rot = rng(-14, 14, jitter(seed, 70 + i));
    return `<text x="${x}" y="${y}" fill="#f5f5f5" font-size="24" font-family="'Doto',sans-serif" font-weight="700" transform="rotate(${rot} ${x} ${y})">${ch}</text>`;
  });
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10" fill="#101010" stroke="rgba(255,255,255,0.08)"/>
    ${hLines.join('')}${vLines.join('')}${chars.join('')}
    <g opacity="0.6" transform="translate(${W - 20},${H - 20})">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
        <path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>
      </svg>
    </g>
  </svg>`;
}

function genCaptchaCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
export default function Layout({ children }) {
  useEffect(() => {
    exposeToWindow();
    initApp();

    // OAuth callback
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

    // -- Theme ---------------------------------------------------------------
    window.toggleTheme = () => {
      document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    };
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }

    // -- Locale --------------------------------------------------------------
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

    // -- Profile dropdown ----------------------------------------------------
    window.toggleProfileDropdown = () => document.getElementById('profile-dropdown')?.classList.toggle('hidden');
    window.closeProfileDropdown = () => document.getElementById('profile-dropdown')?.classList.add('hidden');

    // -- Auth modal ----------------------------------------------------------
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

    window.handleOverlayClick = (e) => {
      if (e.target === document.getElementById('modal-overlay') || e.target === document.getElementById('modal-backdrop')) {
        window.closeModal();
      }
    };

    window.switchView = (view) => {
      const isSignup = view === 'signup';
      document.getElementById('modal-login-fields')?.classList.toggle('hidden', isSignup);
      document.getElementById('modal-signup-fields')?.classList.toggle('hidden', !isSignup);
      const heading = document.getElementById('modal-heading');
      const subtitle = document.getElementById('modal-subtitle');
      const submitBtn = document.getElementById('modal-submit-btn');
      const footerText = document.getElementById('modal-footer');
      if (heading) heading.textContent = isSignup ? 'Create an account' : 'Welcome back';
      if (subtitle) subtitle.textContent = isSignup ? 'Enter your details to create a new account' : 'Enter your username and password to access your account';
      if (submitBtn) submitBtn.textContent = isSignup ? 'Sign Up' : 'Log In';
      if (footerText) footerText.innerHTML = isSignup
        ? `Already have an account? <button onclick="window.switchView('login')" class="font-bold underline underline-offset-4" style="color:hsl(var(--foreground))">Login</button>`
        : `Don't have an account? <button onclick="window.switchView('signup')" class="font-bold underline underline-offset-4" style="color:hsl(var(--foreground))">Sign up</button>`;
      updateCaptcha();
    };

    document.addEventListener('input', e => {
      if (e.target?.id === 'auth-captcha') updateSubmitState();
    });

    document.addEventListener('click', e => {
      if (e.target?.closest('#captcha-refresh')) updateCaptcha();
      const profileBtn = document.getElementById('profile-button');
      const profileDD = document.getElementById('profile-dropdown');
      if (profileDD && profileBtn && !profileBtn.contains(e.target) && !profileDD.contains(e.target)) {
        profileDD.classList.add('hidden');
      }
      const localePanel = document.getElementById('locale-panel');
      const localeBtn = document.getElementById('locale-trigger');
      if (localePanel && localeBtn && !localeBtn.contains(e.target) && !localePanel.contains(e.target)) {
        localePanel.classList.add('hidden');
      }
    });

    const box = document.getElementById('captcha-box');
    if (box) box.innerHTML = renderCaptchaSVG(captchaCode);

  }, []);

  return (
    <>
      {/* -- TOP BAR ----------------------------------------------------------- */}
      <div className="border-b text-xs" style={{ background: 'hsl(var(--topbar))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--topbar-foreground))' }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-1.5">
          <div className="flex items-center gap-1.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
            <span>24/7 Live Support</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Locale */}
            <div className="relative" id="locale-trigger">
              <button onClick={() => window.toggleLocaleDropdown?.()} className="flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                <span id="current-language">EN</span>
                <span className="opacity-40 mx-0.5">|</span>
                <span id="current-currency">USD - $</span>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              <div id="locale-panel" className="hidden absolute right-0 top-full mt-2 w-52 rounded-xl border shadow-2xl z-50 p-4" style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Language</label>
                <select id="language-select" className="w-full rounded-lg border px-3 py-2 text-sm outline-none mb-3" style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}>
                  <option value="en">English</option><option value="es">Español</option><option value="fr">Français</option><option value="de">Deutsch</option><option value="pt">Português</option><option value="ja">???</option>
                </select>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Currency</label>
                <select id="currency-select" className="w-full rounded-lg border px-3 py-2 text-sm outline-none mb-3" style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}>
                  <option value="USD">USD - $</option><option value="EUR">EUR - €</option><option value="GBP">GBP - £</option><option value="BRL">BRL - R$</option><option value="JPY">JPY - ¥</option>
                </select>
                <button onClick={() => window.saveLocaleSettings?.()} className="w-full rounded-lg py-1.5 text-sm font-semibold transition-opacity hover:opacity-80" style={{ background: 'hsl(var(--foreground))', color: 'hsl(var(--background))' }}>Save</button>
              </div>
            </div>
            {/* Theme toggle */}
            <button onClick={() => window.toggleTheme?.()} aria-label="Toggle theme" className="hover:opacity-80 transition-opacity cursor-pointer">
              <svg className="h-3.5 w-3.5 dark:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></svg>
              <svg className="h-3.5 w-3.5 hidden dark:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9" /><path d="M20 3v4M22 5h-4" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* -- MAIN NAV ----------------------------------------------------------- */}
      <nav className="sticky top-0 z-40 border-b" style={{ background: 'hsl(var(--nav))', borderColor: 'hsl(var(--border))' }}>
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-6 py-3">
          {/* Logo */}
          <Link href="/" className="shrink-0 font-black text-2xl mr-6 hover:opacity-80 transition-opacity" style={{ fontFamily: "'Doto', sans-serif", color: 'hsl(var(--foreground))' }}>
            Bounty
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center">
            <Link href="/browse" className="nav-link">Browse</Link>
            <Link href="/browse?category=Currency" className="nav-link">Currency</Link>
            <Link href="/browse?category=Accounts" className="nav-link">Accounts</Link>
            <Link href="/browse?category=Items" className="nav-link">Items</Link>
            <Link href="/browse?category=Boosting" className="nav-link">Boosting</Link>
            <Link href="/browse?category=Top+Ups" className="nav-link">Top Ups</Link>
          </div>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-2">
            {/* Search */}
            <div className="hidden lg:flex items-center rounded-lg border px-3 py-1.5 gap-2 w-48 transition-colors focus-within:border-foreground/30" style={{ background: 'hsl(var(--secondary))', borderColor: 'hsl(var(--border))' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'hsl(var(--muted-foreground))', flexShrink: 0 }}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
              <input
                type="text"
                placeholder="Search listings…"
                className="bg-transparent outline-none text-sm w-full"
                style={{ color: 'hsl(var(--foreground))' }}
                onKeyDown={e => { if (e.key === 'Enter' && e.target.value) window.location.href = '/browse?q=' + encodeURIComponent(e.target.value); }}
              />
            </div>

            {/* Logged-out: single Log In button */}
            <div id="auth-buttons" className="flex items-center gap-2">
              <button
                onClick={() => window.openModal?.('login')}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all border"
                style={{ background: 'hsl(var(--foreground))', color: 'hsl(var(--background))', borderColor: 'hsl(var(--foreground))' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                Log In
              </button>
              <a
                href="https://discord.com/invite/jyrkFzG7Qs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border"
                style={{ background: '#5865F2', color: '#fff', borderColor: '#5865F2' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                <svg width="16" height="12" viewBox="0 0 71 55" fill="currentColor">
                  <path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.3 37.3 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 4.9a.2.2 0 00-.1.1C1.5 18.7-.9 32.2.3 45.5v.1a58.7 58.7 0 0017.7 9 .2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.6 38.6 0 01-5.5-2.6.2.2 0 010-.4l1.1-.9a.2.2 0 01.2 0 41.9 41.9 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .3 36.3 36.3 0 01-5.5 2.7.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1A58.5 58.5 0 0070.3 45.6v-.1C71.7 30.1 67.8 16.7 60.2 5a.2.2 0 00-.1-.1zM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2zm23.7 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2z" />
                </svg>
                Join Discord
              </a>
            </div>

            {/* Logged-in profile area */}
            <div id="profile-area" className="hidden items-center gap-1.5">
              <Link href="/messages" className="nav-icon-btn" title="Messages">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              </Link>
              <button id="notifications-button" className="nav-icon-btn relative" title="Notifications">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
              </button>
              <div className="relative">
                <button id="profile-button" onClick={() => window.toggleProfileDropdown?.()}
                  className="h-8 w-8 rounded-full border overflow-hidden flex items-center justify-center transition-colors hover:border-foreground/40"
                  style={{ background: 'hsl(var(--secondary))', borderColor: 'hsl(var(--border))' }}>
                  <div id="profile-avatar" className="w-full h-full flex items-center justify-center" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  </div>
                </button>
                <div id="profile-dropdown" className="hidden absolute right-0 top-full mt-2 w-56 rounded-xl border shadow-2xl z-50 overflow-hidden" style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}>
                  <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
                    <div id="dropdown-avatar" className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 border" style={{ background: 'hsl(var(--secondary))', borderColor: 'hsl(var(--border))' }}>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    </div>
                    <div className="min-w-0">
                      <p id="dropdown-username" className="text-sm font-semibold truncate" style={{ color: 'hsl(var(--foreground))' }} />
                      <p id="dropdown-balance" className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>$0.00</p>
                    </div>
                  </div>
                  <div className="flex gap-2 px-3 py-2 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
                    <Link href="/deposit" className="flex-1 text-center text-xs font-semibold py-1.5 rounded-lg transition-opacity hover:opacity-80" style={{ background: 'hsl(var(--foreground))', color: 'hsl(var(--background))' }}>Deposit</Link>
                    <button className="flex-1 text-xs font-semibold py-1.5 rounded-lg border transition-colors hover:bg-secondary" style={{ borderColor: 'hsl(var(--border))' }}>Withdraw</button>
                  </div>
                  <div className="py-1">
                    {[
                      { href: '/orders', label: 'Orders', d: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0' },
                      { href: '/dashboard', label: 'Seller Dashboard', d: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z' },
                      { href: '/deposit', label: 'Wallet', d: 'M2 5h20a2 2 0 0 1 0 14H2z M2 10h20' },
                      { href: '/messages', label: 'Messages', d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
                      { href: '/become-a-seller', label: 'Become a Seller', d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75' },
                      { href: '/account-settings', label: 'Account Settings', d: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' },
                    ].map(({ href, label, d }) => (
                      <Link key={href} href={href} className="dropdown-item" onClick={() => window.closeProfileDropdown?.()}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          {d.split(' M').map((seg, i) => <path key={i} d={(i === 0 ? '' : 'M') + seg} />)}
                        </svg>
                        {label}
                      </Link>
                    ))}
                  </div>
                  <div className="border-t py-1" style={{ borderColor: 'hsl(var(--border))' }}>
                    <button onClick={() => { window.logout?.(); window.closeProfileDropdown?.(); }} className="dropdown-item w-full text-left" style={{ color: '#ef4444' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                      Log out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* -- PAGE CONTENT ------------------------------------------------------- */}
      <main>{children}</main>

      {/* -- AUTH MODAL --------------------------------------------------------- */}
      <div
        id="modal-overlay"
        className="hidden fixed inset-0 z-50 items-center justify-center"
        onClick={e => window.handleOverlayClick?.(e)}
        style={{ backdropFilter: 'blur(2px)' }}
      >
        <div id="modal-backdrop" className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.65)' }} />
        <div
          className="relative z-10 w-full max-w-md mx-4 rounded-2xl p-8 shadow-2xl border"
          style={{
            background: 'hsl(var(--card))',
            borderColor: 'hsl(var(--border))',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Close */}
          <button onClick={() => window.closeModal?.()} className="absolute right-4 top-4 transition-colors hover:opacity-70" style={{ color: 'hsl(var(--muted-foreground))' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>

          {/* Heading */}
          <h2 id="modal-heading" className="text-3xl font-black text-center mb-1" style={{ fontFamily: "'Doto', sans-serif", color: 'hsl(var(--foreground))' }}>Welcome back</h2>
          <p id="modal-subtitle" className="text-center text-sm mb-6" style={{ color: 'hsl(var(--muted-foreground))' }}>Enter your username and password to access your account</p>

          {/* Error banners */}
          <p id="login-error" className="hidden text-sm text-red-500 mb-4 text-center rounded-lg px-3 py-2" style={{ background: 'rgba(239,68,68,0.1)' }} />
          <p id="signup-error" className="hidden text-sm text-red-500 mb-4 text-center rounded-lg px-3 py-2" style={{ background: 'rgba(239,68,68,0.1)' }} />

          {/* Shared form */}
          <div className="space-y-4">
            {/* Username */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide block" style={{ color: 'hsl(var(--muted-foreground))' }}>Username</label>
              <input
                id="login-username"
                type="text"
                placeholder="Your username"
                autoComplete="username"
                className="w-full h-10 px-3 rounded-lg border text-sm outline-none transition-all focus:ring-1"
                style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide block" style={{ color: 'hsl(var(--muted-foreground))' }}>Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="Your password"
                autoComplete="current-password"
                className="w-full h-10 px-3 rounded-lg border text-sm outline-none transition-all focus:ring-1"
                style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
              />
            </div>

            {/* Signup-only fields */}
            <div id="modal-signup-fields" className="hidden space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide block" style={{ color: 'hsl(var(--muted-foreground))' }}>Email</label>
                <input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full h-10 px-3 rounded-lg border text-sm outline-none transition-all focus:ring-1"
                  style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide block" style={{ color: 'hsl(var(--muted-foreground))' }}>Confirm Password</label>
                <input
                  id="signup-confirm-password"
                  type="password"
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  className="w-full h-10 px-3 rounded-lg border text-sm outline-none transition-all focus:ring-1"
                  style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                />
              </div>
            </div>

            {/* Captcha */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>Verify you're human</p>
              <div className="flex gap-3 items-center">
                <button
                  id="captcha-refresh"
                  type="button"
                  title="Click to refresh"
                  className="rounded-xl border overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ width: 150, height: 50, borderColor: 'hsl(var(--border))' }}
                >
                  <div id="captcha-box" style={{ width: 150, height: 50 }} />
                </button>
                <input
                  id="auth-captcha"
                  type="text"
                  placeholder="Enter code"
                  maxLength={4}
                  className="flex-1 h-[50px] px-3 rounded-xl border text-sm font-mono tracking-widest outline-none"
                  style={{ background: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              id="modal-submit-btn"
              type="button"
              disabled
              onClick={() => {
                const isSignup = document.getElementById('modal-signup-fields')?.classList.contains('hidden') === false;
                if (isSignup) window.handleSignupSubmit?.({ preventDefault: () => {} });
                else window.handleLoginSubmit?.({ preventDefault: () => {} });
              }}
              className="w-full h-11 rounded-xl text-sm font-bold transition-all"
              style={{ background: 'hsl(var(--foreground))', color: 'hsl(var(--background))', opacity: 0.45 }}
            >
              Log In
            </button>
          </div>

          {/* Footer toggle */}
          <p id="modal-footer" className="text-center text-sm mt-4" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Don't have an account? <button onClick={() => window.switchView?.('signup')} className="font-bold underline underline-offset-4 hover:opacity-70" style={{ color: 'hsl(var(--foreground))' }}>Sign up</button>
          </p>

          {/* Divider */}
          <div className="auth-divider mt-5"><div className="line" /><span>or continue with</span><div className="line" /></div>

          {/* OAuth */}
          <button type="button" onClick={() => window.handleGoogleOAuth?.()} className="btn-google mb-2">
            <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" /><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /></svg>
            Continue with Google
          </button>
          <button type="button" onClick={() => window.handleDiscordOAuth?.()} className="btn-discord">
            <svg width="18" height="14" viewBox="0 0 71 55" fill="currentColor"><path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.3 37.3 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 4.9a.2.2 0 00-.1.1C1.5 18.7-.9 32.2.3 45.5v.1a58.7 58.7 0 0017.7 9 .2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.6 38.6 0 01-5.5-2.6.2.2 0 010-.4l1.1-.9a.2.2 0 01.2 0 41.9 41.9 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .3 36.3 36.3 0 01-5.5 2.7.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1A58.5 58.5 0 0070.3 45.6v-.1C71.7 30.1 67.8 16.7 60.2 5a.2.2 0 00-.1-.1zM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2zm23.7 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2z" /></svg>
            Continue with Discord
          </button>
        </div>
      </div>
    </>
  );
}
