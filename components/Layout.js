import Link from 'next/link';
import { useEffect } from 'react';
import { exposeToWindow, initApp } from '../utils/auth';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const router = useRouter();
  const isSellerPage = router.pathname === '/become-a-seller';
  useEffect(() => {
    exposeToWindow();
    initApp();
    // OAuth callback
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const tok = p.get('token'),
        usr = p.get('username'),
        em = p.get('email'),
        meth = p.get('method');
      if (tok && usr) {
        localStorage.setItem('bounty_token', tok);
        localStorage.setItem('authenticated_username', usr);
        if (em) localStorage.setItem('authenticated_email', em);
        if (meth) localStorage.setItem('auth_method', meth);
        window.history.replaceState({}, '', window.location.pathname);
        window.location.reload();
      }
    }

    // Theme toggle
    window.toggleTheme = () => {
      const html = document.documentElement;
      html.classList.toggle('dark');
      localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
    };
    if (
      localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
    }

    // Locale dropdown helpers
    window.toggleLocaleDropdown = () => {
      document.getElementById('locale-panel')?.classList.toggle('hidden');
    };
    window.saveLocaleSettings = () => {
      const lang = document.getElementById('language-select')?.value;
      const curr = document.getElementById('currency-select')?.value;
      if (lang) document.getElementById('current-language').textContent = lang.toUpperCase();
      if (curr) {
        document.getElementById('current-currency').textContent =
          curr +
          (curr === 'USD' ? ' - $' : curr === 'EUR' ? ' - €' : curr === 'GBP' ? ' - £' : curr === 'BRL' ? ' - R$' : ' - ¥');
      }
      document.getElementById('locale-panel')?.classList.add('hidden');
    };

    // Profile dropdown helpers
    window.toggleProfileDropdown = () => {
      document.getElementById('profile-dropdown')?.classList.toggle('hidden');
    };
    window.closeProfileDropdown = () => {
      document.getElementById('profile-dropdown')?.classList.add('hidden');
    };
    document.addEventListener('click', (e) => {
      const btn = document.getElementById('profile-button');
      const dd = document.getElementById('profile-dropdown');
      if (dd && btn && !btn.contains(e.target) && !dd.contains(e.target)) {
        dd.classList.add('hidden');
      }
      const localeBtn = document.getElementById('locale-dropdown');
      const localePanel = document.getElementById('locale-panel');
      if (localePanel && localeBtn && !localeBtn.contains(e.target)) {
        localePanel.classList.add('hidden');
      }
    });

    // Auth modal helpers
    window.openModal = (view = 'login') => {
      const overlay = document.getElementById('modal-overlay');
      if (!overlay) return;
      overlay.classList.remove('hidden');
      overlay.classList.add('flex');
      window.switchView(view);
      document.body.style.overflow = 'hidden';
    };
    window.closeModal = () => {
      const overlay = document.getElementById('modal-overlay');
      if (!overlay) return;
      overlay.classList.add('hidden');
      overlay.classList.remove('flex');
      document.body.style.overflow = '';
    };
    window.handleOverlayClick = (e) => {
      if (
        e.target === document.getElementById('modal-overlay') ||
        e.target === document.getElementById('modal-backdrop')
      ) {
        window.closeModal();
      }
    };
    window.switchView = (view) => {
      document.getElementById('login-modal')?.classList.toggle('hidden', view !== 'login');
      document.getElementById('signup-modal')?.classList.toggle('hidden', view !== 'signup');
    };
  }, []);

  return (
    <>
      <div className="bg-topbar text-topbar-foreground text-xs border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5">
          <div />
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
            <span>24/7 Live Support</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative" id="locale-dropdown">
              <button
                onClick={() => window.toggleLocaleDropdown?.()}
                className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span id="current-language">EN</span>
                <span className="opacity-40 mx-0.5">|</span>
                <span id="current-currency">USD - $</span>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div id="locale-panel" className="hidden absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card p-4 shadow-2xl z-50">
                <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">Language</label>
                <select id="language-select" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none mb-3">
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="pt">Português</option>
                  <option value="ja">日本語</option>
                </select>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">Currency</label>
                <select id="currency-select" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none mb-3">
                  <option value="USD">USD - $</option>
                  <option value="EUR">EUR - €</option>
                  <option value="GBP">GBP - £</option>
                  <option value="BRL">BRL - R$</option>
                  <option value="JPY">JPY - ¥</option>
                </select>
                <button
                  onClick={() => window.saveLocaleSettings?.()}
                  className="w-full rounded-lg py-1.5 text-sm font-semibold bg-foreground text-background hover:opacity-80 transition-opacity"
                >
                  Save
                </button>
              </div>
            </div>
            <button
              onClick={() => window.toggleTheme?.()}
              aria-label="Toggle theme"
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              <svg className="h-3.5 w-3.5 dark:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
              <svg className="h-3.5 w-3.5 hidden dark:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9" />
                <path d="M20 3v4" />
                <path d="M22 5h-4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {!isSellerPage && (
        <nav className="bg-nav border-b border-border sticky top-0 z-40">
          <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 py-2.5">
            <Link
              href="/"
              className="shrink-0 font-black text-2xl text-foreground mr-6"
              style={{ fontFamily: "'Doto', sans-serif", letterSpacing: '-0.02em' }}
            >
              Bounty
            </Link>

            <div className="hidden md:flex items-center">
              <Link href="/browse" className="nav-link">
                Browse
              </Link>
              <Link href="/browse?category=Currency" className="nav-link">
                Currency
              </Link>
              <Link href="/browse?category=Accounts" className="nav-link">
                Accounts
              </Link>
              <Link href="/browse?category=Items" className="nav-link">
                Items
              </Link>
              <Link href="/browse?category=Boosting" className="nav-link">
                Boosting
              </Link>
              <Link href="/browse?category=Top+Ups" className="nav-link">
                Top Ups
              </Link>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <div className="hidden lg:flex items-center rounded-lg border border-border bg-secondary px-3 py-1.5 gap-2 w-48 focus-within:border-foreground/30 transition-colors">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground shrink-0"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search listings…"
                  className="bg-transparent outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      window.location.href = '/browse?q=' + encodeURIComponent(e.currentTarget.value);
                    }
                  }}
                />
              </div>
              <div id="auth-buttons" className="flex items-center gap-2">
                <button
                  onClick={() => window.openModal?.('login')}
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={() => window.openModal?.('signup')}
                  className="px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-foreground text-background hover:opacity-80 transition-opacity"
                >
                  Sign up
                </button>
              </div>
              <div id="profile-area" className="hidden items-center gap-1">
                <Link href="/messages" className="nav-icon-btn" title="Messages">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </Link>
                <button id="notifications-button" className="nav-icon-btn relative" title="Notifications">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                </button>
                <div className="relative">
                  <button
                    id="profile-button"
                    onClick={() => window.toggleProfileDropdown?.()}
                    className="h-8 w-8 rounded-full border border-border overflow-hidden hover:border-foreground/40 transition-colors flex items-center justify-center bg-secondary"
                  >
                    <div id="profile-avatar" className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  </button>
                  <div id="profile-dropdown" className="hidden absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-2xl z-50 overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                      <div id="dropdown-avatar" className="h-9 w-9 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p id="dropdown-username" className="text-sm font-semibold truncate" />
                        <p id="dropdown-balance" className="text-xs text-muted-foreground">$0.00</p>
                      </div>
                    </div>
                    <div className="flex gap-2 px-3 py-2 border-b border-border">
                      <Link href="/deposit" className="flex-1 text-center text-xs font-semibold py-1.5 rounded-lg bg-foreground text-background hover:opacity-80 transition-opacity">
                        Deposit
                      </Link>
                      <button className="flex-1 text-xs font-semibold py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors">
                        Withdraw
                      </button>
                    </div>
                    <div className="py-1">
                      {[
                        { href: '/orders', icon: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0', label: 'Orders' },
                        { href: '/dashboard', icon: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z', label: 'Seller Dashboard' },
                        { href: '/become-a-seller', icon: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M16 3.13a4 4 0 0 1 0 7.75 M12 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0', label: 'Become a Seller' },
                        { href: '/deposit', icon: 'M2 5h20a2 2 0 0 1 0 14H2z M2 10h20', label: 'Wallet' },
                        { href: '/messages', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', label: 'Messages' },
                        { href: '/account-settings', icon: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', label: 'Account Settings' },
                      ].map(({ href, icon, label }) => (
                        <Link key={href} href={href} className="dropdown-item" onClick={() => window.closeProfileDropdown?.()}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {icon.split(' ').map((d, i) => (
                              <path key={i} d={d} />
                            ))}
                          </svg>
                          {label}
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-border py-1">
                      <button
                        onClick={() => {
                          window.logout?.();
                          window.closeProfileDropdown?.();
                        }}
                        className="dropdown-item w-full text-left text-red-500 hover:bg-red-500/5"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Log out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      )}
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 py-2.5">
          <Link
            href="/"
            className="shrink-0 font-black text-2xl text-foreground mr-6"
            style={{ fontFamily: "'Doto', sans-serif", letterSpacing: '-0.02em' }}
          >
            Bounty
          </Link>
          <div className="hidden md:flex items-center">
            <Link href="/browse" className="nav-link">
              Browse
            </Link>
            <Link href="/browse?category=Currency" className="nav-link">
              Currency
            </Link>
            <Link href="/browse?category=Accounts" className="nav-link">
              Accounts
            </Link>
            <Link href="/browse?category=Items" className="nav-link">
              Items
            </Link>
            <Link href="/browse?category=Boosting" className="nav-link">
              Boosting
            </Link>
            <Link href="/browse?category=Top+Ups" className="nav-link">
              Top Ups
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden lg:flex items-center rounded-lg border border-border bg-secondary px-3 py-1.5 gap-2 w-48 focus-within:border-foreground/30 transition-colors">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground shrink-0"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search listings…"
                className="bg-transparent outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    window.location.href = '/browse?q=' + encodeURIComponent(e.currentTarget.value);
                  }
                }}
              />
            </div>
            <div id="auth-buttons" className="flex items-center gap-2">
              <button
                onClick={() => window.openModal?.('login')}
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                Log in
              </button>
              <button
                onClick={() => window.openModal?.('signup')}
                className="px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-foreground text-background hover:opacity-80 transition-opacity"
              >
                Sign up
              </button>
            </div>
            <div id="profile-area" className="hidden items-center gap-1">
              <Link href="/messages" className="nav-icon-btn" title="Messages">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </Link>
              <button id="notifications-button" className="nav-icon-btn relative" title="Notifications">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
              </button>
              <div className="relative">
                <button
                  id="profile-button"
                  onClick={() => window.toggleProfileDropdown?.()}
                  className="h-8 w-8 rounded-full border border-border overflow-hidden hover:border-foreground/40 transition-colors flex items-center justify-center bg-secondary"
                >
                  <div id="profile-avatar" className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                </button>
                <div id="profile-dropdown" className="hidden absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                    <div id="dropdown-avatar" className="h-9 w-9 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p id="dropdown-username" className="text-sm font-semibold truncate" />
                      <p id="dropdown-balance" className="text-xs text-muted-foreground">$0.00</p>
                    </div>
                  </div>
                  <div className="flex gap-2 px-3 py-2 border-b border-border">
                    <Link href="/deposit" className="flex-1 text-center text-xs font-semibold py-1.5 rounded-lg bg-foreground text-background hover:opacity-80 transition-opacity">
                      Deposit
                    </Link>
                    <button className="flex-1 text-xs font-semibold py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors">
                      Withdraw
                    </button>
                  </div>
                  <div className="py-1">
                    {[
                      { href: '/orders', icon: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0', label: 'Orders' },
                      { href: '/dashboard', icon: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z', label: 'Seller Dashboard' },
                      { href: '/become-a-seller', icon: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M16 3.13a4 4 0 0 1 0 7.75 M12 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0', label: 'Become a Seller' },
                      { href: '/deposit', icon: 'M2 5h20a2 2 0 0 1 0 14H2z M2 10h20', label: 'Wallet' },
                      { href: '/messages', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', label: 'Messages' },
                      { href: '/account-settings', icon: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', label: 'Account Settings' },
                    ].map(({ href, icon, label }) => (
                      <Link key={href} href={href} className="dropdown-item" onClick={() => window.closeProfileDropdown?.()}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          {icon.split(' ').map((d, i) => (
                            <path key={i} d={d} />
                          ))}
                        </svg>
                        {label}
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-border py-1">
                    <button
                      onClick={() => {
                        window.logout?.();
                        window.closeProfileDropdown?.();
                      }}
                      className="dropdown-item w-full text-left text-red-500 hover:bg-red-500/5"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Log out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main>{children}</main>

      <div
        id="modal-overlay"
        className="hidden fixed inset-0 z-50 items-center justify-center"
        onClick={(e) => window.handleOverlayClick?.(e)}
      >
        <div id="modal-backdrop" className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div
          className="relative z-10 w-full max-w-md mx-4 bg-card rounded-2xl p-8 shadow-2xl border border-border"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => window.closeModal?.()}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div id="login-modal">
            <h2 className="text-2xl font-black text-center mb-1" style={{ fontFamily: "'Doto', monospace" }}>Welcome back</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">Sign in to your Bounty account</p>
            <p id="login-error" className="hidden text-sm text-red-500 mb-4 text-center rounded-lg bg-red-500/10 px-3 py-2" />
            <form id="login-form" className="space-y-3" onSubmit={(e) => window.handleLoginSubmit?.(e)}>
              <div>
                <label className="text-sm font-medium block mb-1.5">Username</label>
                <input
                  id="login-username"
                  type="text"
                  placeholder="Your username"
                  autoComplete="username"
                  className="w-full h-10 px-3 rounded-lg bg-background border border-input text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Password</label>
                <input
                  id="login-password"
                  type="password"
                  placeholder="Your password"
                  autoComplete="current-password"
                  className="w-full h-10 px-3 rounded-lg bg-background border border-input text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <button id="login-submit-btn" type="submit" className="btn-brand mt-1">
                Log in
              </button>
            </form>
            <div className="auth-divider">
              <div className="line" />
              <span>or continue with</span>
              <div className="line" />
            </div>
            <button type="button" onClick={() => window.handleGoogleOAuth?.()} className="btn-google mb-2">
              <svg width="16" height="16" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              Continue with Google
            </button>
            <button type="button" onClick={() => window.handleDiscordOAuth?.()} className="btn-discord">
              <svg width="18" height="14" viewBox="0 0 71 55" fill="currentColor">
                <path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.3 37.3 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 4.9a.2.2 0 00-.1.1C1.5 18.7-.9 32.2.3 45.5v.1a58.7 58.7 0 0017.7 9 .2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.6 38.6 0 01-5.5-2.6.2.2 0 010-.4l1.1-.9a.2.2 0 01.2 0 41.9 41.9 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .3 36.3 36.3 0 01-5.5 2.7.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1A58.5 58.5 0 0070.3 45.6v-.1C71.7 30.1 67.8 16.7 60.2 5a.2.2 0 00-.1-.1zM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2zm23.7 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2z" />
              </svg>
              Continue with Discord
            </button>
            <p className="text-center text-sm mt-5 text-muted-foreground">
              No account?
              <button type="button" onClick={() => window.switchView?.('signup')} className="text-foreground underline font-medium hover:opacity-70">
                Sign up
              </button>
            </p>
          </div>

          <div id="signup-modal" className="hidden">
            <h2 className="text-2xl font-black text-center mb-1" style={{ fontFamily: "'Doto', monospace" }}>Create account</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">Join thousands of traders on Bounty</p>
            <p id="signup-error" className="hidden text-sm text-red-500 mb-4 text-center rounded-lg bg-red-500/10 px-3 py-2" />
            <form id="signup-form" className="space-y-3" onSubmit={(e) => window.handleSignupSubmit?.(e)}>
              <div>
                <label className="text-sm font-medium block mb-1.5">Username</label>
                <input
                  id="signup-username"
                  type="text"
                  placeholder="Your username"
                  autoComplete="username"
                  className="w-full h-10 px-3 rounded-lg bg-background border border-input text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Email</label>
                <input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full h-10 px-3 rounded-lg bg-background border border-input text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  placeholder="Min 8 characters"
                  autoComplete="new-password"
                  className="w-full h-10 px-3 rounded-lg bg-background border border-input text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Confirm Password</label>
                <input
                  id="signup-confirm-password"
                  type="password"
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  className="w-full h-10 px-3 rounded-lg bg-background border border-input text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <button id="signup-submit-btn" type="submit" className="btn-brand mt-1">
                Create account
              </button>
            </form>
            <div className="auth-divider">
              <div className="line" />
              <span>or register with</span>
              <div className="line" />
            </div>
            <button type="button" onClick={() => window.handleGoogleOAuth?.()} className="btn-google mb-2">
              <svg width="16" height="16" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              Continue with Google
            </button>
            <button type="button" onClick={() => window.handleDiscordOAuth?.()} className="btn-discord">
              <svg width="18" height="14" viewBox="0 0 71 55" fill="currentColor">
                <path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.3 37.3 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 4.9a.2.2 0 00-.1.1C1.5 18.7-.9 32.2.3 45.5v.1a58.7 58.7 0 0017.7 9 .2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.6 38.6 0 01-5.5-2.6.2.2 0 010-.4l1.1-.9a.2.2 0 01.2 0 41.9 41.9 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .3 36.3 36.3 0 01-5.5 2.7.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1A58.5 58.5 0 0070.3 45.6v-.1C71.7 30.1 67.8 16.7 60.2 5a.2.2 0 00-.1-.1zM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2zm23.7 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2z" />
              </svg>
              Continue with Discord
            </button>
            <p className="text-center text-sm mt-5 text-muted-foreground">
              Have an account?
              <button type="button" onClick={() => window.switchView?.('login')} className="text-foreground underline font-medium hover:opacity-70">
                Log in
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
