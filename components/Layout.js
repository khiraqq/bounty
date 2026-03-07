import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from './Navbar';
import AuthModal from './AuthModal';
import { exposeToWindow, initApp } from '../utils/auth';

export default function Layout({ children }) {
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [captchaCode, setCaptchaCode] = useState('000');
  const [captchaInput, setCaptchaInput] = useState('');
  const isCaptchaValid = useMemo(() => captchaInput === captchaCode, [captchaCode, captchaInput]);
  const generateCaptcha = useCallback(() => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const nextCode = Array.from({ length: 3 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
    setCaptchaCode(nextCode);
    setCaptchaInput('');
  }, []);

  useEffect(() => {
    const openModal = (view = 'login') => {
      setAuthMode(view);
      generateCaptcha();
      setAuthOpen(true);
      if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';
    };
    const closeModal = () => {
      setAuthOpen(false);
      if (typeof document !== 'undefined') document.body.style.overflow = '';
    };
    const ensureAuth = () => {
      if (!localStorage.getItem('bounty_token')) {
        openModal('login');
        return false;
      }
      return true;
    };

    window.openAuthModal = openModal;
    window.openModal = openModal;
    window.closeAuthModal = closeModal;
    window.closeModal = closeModal;
    window.switchView = (view) => openModal(view);
    window.refreshCaptcha = generateCaptcha;
    window.ensureAuthenticated = ensureAuth;
    window.handleStartSelling = () => {
      if (!ensureAuth()) return;
      router.push('/seller/onboarding');
    };

    generateCaptcha();
  }, [generateCaptcha, router]);
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

    // Theme toggle
    window.toggleTheme = () => {
      const html = document.documentElement;
      html.classList.toggle('dark');
      localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
    };
    if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }

    // Locale dropdown
    window.toggleLocaleDropdown = () => {
      document.getElementById('locale-panel')?.classList.toggle('hidden');
    };
    window.saveLocaleSettings = () => {
      const lang = document.getElementById('language-select')?.value;
      const curr = document.getElementById('currency-select')?.value;
      if (lang) document.getElementById('current-language').textContent = lang.toUpperCase();
      if (curr) document.getElementById('current-currency').textContent = curr + (curr === 'USD' ? ' - $' : curr === 'EUR' ? ' - €' : curr === 'GBP' ? ' - £' : curr === 'BRL' ? ' - R$' : ' - ¥');
      document.getElementById('locale-panel')?.classList.add('hidden');
    };

    // Profile dropdown
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

    // Auth modal
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
      if (e.target === document.getElementById('modal-overlay') || e.target === document.getElementById('modal-backdrop')) {
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
      {/* ── TOP BAR ────────────────────────────────────────────────────── */}
      <div className="bg-topbar text-topbar-foreground text-xs border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5">
          <div />
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
            </svg>
            <span>24/7 Live Support</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative" id="locale-dropdown">
              <button onClick={() => window.toggleLocaleDropdown?.()} className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                <span id="current-language">EN</span>
                <span className="opacity-40 mx-0.5">|</span>
                <span id="current-currency">USD - $</span>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <div id="locale-panel" className="hidden absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card p-4 shadow-2xl z-50">
                <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">Language</label>
                <select id="language-select" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none mb-3">
                  <option value="en">English</option><option value="es">Español</option><option value="fr">Français</option>
                  <option value="de">Deutsch</option><option value="pt">Português</option><option value="ja">日本語</option>
                </select>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wide">Currency</label>
                <select id="currency-select" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none mb-3">
                  <option value="USD">USD - $</option><option value="EUR">EUR - €</option><option value="GBP">GBP - £</option>
                  <option value="BRL">BRL - R$</option><option value="JPY">JPY - ¥</option>
                </select>
                <button onClick={() => window.saveLocaleSettings?.()} className="w-full rounded-lg py-1.5 text-sm font-semibold bg-foreground text-background hover:opacity-80 transition-opacity">Save</button>
              </div>
            </div>
            <button onClick={() => window.toggleTheme?.()} aria-label="Toggle theme" className="hover:text-foreground transition-colors cursor-pointer">
              <svg className="h-3.5 w-3.5 dark:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
              <svg className="h-3.5 w-3.5 hidden dark:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9"/><path d="M20 3v4M22 5h-4"/></svg>
            </button>
          </div>
        </div>
      </div>

      <Navbar />

      {/* ── PAGE CONTENT ───────────────────────────────────────────────── */}
      <main>{children}</main>
      <AuthModal
        open={authOpen}
        mode={authMode}
        captchaCode={captchaCode}
        captchaInput={captchaInput}
        onCaptchaChange={(event) => setCaptchaInput(event.target.value.toUpperCase())}
        refreshCaptcha={generateCaptcha}
        onClose={() => setAuthOpen(false)}
        onSwitch={(mode) => setAuthMode(mode)}
        isCaptchaValid={isCaptchaValid}
      />
    </>
  );
}
