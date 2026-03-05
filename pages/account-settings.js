import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { initApp, exposeToWindow } from '../utils/auth';
import { initSettings, exposeSettingsToWindow } from '../utils/settings';

// ── inline SVG icon components (no data-lucide attrs) ──────────────────────

function IcoUser() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IcoSave() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function IcoEdit() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IcoLock() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IcoUpload() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function IcoSun() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function IcoMoon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9" /><path d="M20 3v4" /><path d="M22 5h-4" />
    </svg>
  );
}

function RuleCheck() {
  return (
    <svg className="icon-ok" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function RuleX() {
  return (
    <svg className="icon-x" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ── static data ─────────────────────────────────────────────────────────────

const NOTIF_ROWS = [
  ['Order updates', 'Get notified about order status changes'],
  ['Messages', 'New messages from buyers or sellers'],
  ['Promotions', 'Deals, discounts and special offers'],
  ['Account activity', 'Sign-ins and security alerts'],
  ['New listings', 'Listings matching your saved searches'],
  ['Price drops', 'Items on your wishlist go on sale'],
  ['Review reminders', 'Remind me to leave a review after purchase'],
  ['Newsletter', 'Weekly highlights and marketplace news'],
];

const PW_RULES = [
  ['rule-length', 'At least 8 characters'],
  ['rule-lower', 'One lowercase letter'],
  ['rule-upper', 'One uppercase letter'],
  ['rule-number', 'One number'],
  ['rule-spaces', 'No leading/trailing spaces'],
];

const PAGE_STYLES = `
  :root{--brand:#6c47ff;--brand-hover:#5835e0}
  .toggle-track{position:relative;display:inline-flex;align-items:center;width:44px;height:24px;border-radius:9999px;background:hsl(var(--muted));border:1px solid hsl(var(--border));cursor:pointer;transition:background .25s;flex-shrink:0}
  .toggle-track.active{background:#16a34a;border-color:#16a34a}
  .toggle-thumb{position:absolute;left:3px;width:18px;height:18px;border-radius:9999px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:transform .25s cubic-bezier(.4,0,.2,1)}
  .toggle-track.active .toggle-thumb{transform:translateX(20px)}
  .settings-card{background:hsl(var(--card));border:1px solid hsl(var(--border));border-radius:.75rem;overflow:hidden}
  .settings-card-header{padding:1rem 1.25rem;border-bottom:1px solid hsl(var(--border));font-size:1rem;font-weight:700;display:flex;align-items:center;justify-content:space-between}
  .notif-row{display:flex;align-items:center;justify-content:space-between;padding:.75rem 1.25rem;border-bottom:1px solid hsl(var(--border))}
  .notif-row:last-child{border-bottom:none}
  .settings-input{width:100%;height:2.5rem;padding:0 .75rem;border-radius:.375rem;background:hsl(var(--background));border:1px solid hsl(var(--input));color:hsl(var(--foreground));font-size:.875rem;outline:none;transition:border-color .2s}
  .settings-input:focus{border-color:hsl(var(--ring))}
  .settings-input[readonly]{opacity:.55;background:hsl(var(--muted)/.4);cursor:default}
  .settings-input.editable{opacity:1;background:hsl(var(--background));cursor:text}
  .settings-textarea{width:100%;padding:.625rem .75rem;border-radius:.375rem;background:hsl(var(--background));border:1px solid hsl(var(--input));color:hsl(var(--foreground));font-size:.875rem;outline:none;resize:vertical;min-height:100px}
  .save-btn{display:inline-flex;align-items:center;justify-content:center;gap:.375rem;height:2.25rem;padding:0 1.25rem;border-radius:.375rem;font-size:.875rem;font-weight:600;color:#fff;background:var(--brand);border:none;cursor:pointer;transition:background .18s}
  .save-btn:hover{background:var(--brand-hover)}.save-btn:disabled{opacity:.6;cursor:not-allowed}
  .edit-btn{display:inline-flex;align-items:center;justify-content:center;gap:.375rem;height:2.25rem;padding:0 .875rem;border-radius:.375rem;font-size:.8125rem;font-weight:600;color:hsl(var(--foreground));background:transparent;border:1px solid hsl(var(--border));cursor:pointer;flex-shrink:0;white-space:nowrap;transition:background .15s}
  .edit-btn:hover{background:hsl(var(--accent))}
  .edit-btn.active-edit{background:var(--brand);border-color:var(--brand);color:#fff}
  .sec-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;height:2.25rem;padding:0 1.125rem;border-radius:.375rem;font-size:.875rem;font-weight:600;color:hsl(var(--foreground));background:transparent;border:1px solid hsl(var(--border));cursor:pointer;transition:background .15s}
  .sec-btn:hover{background:hsl(var(--accent))}
  #avatar-preview{width:96px;height:96px;border-radius:9999px;border:2px solid hsl(var(--border));background:hsl(var(--muted));display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;cursor:pointer}
  #avatar-preview:hover{border-color:var(--brand)}
  .pw-panel{overflow:hidden;max-height:0;opacity:0;transition:max-height .45s cubic-bezier(.4,0,.2,1),opacity .3s}
  .pw-panel.open{max-height:600px;opacity:1}
  .rule-item{display:flex;align-items:center;gap:.5rem;font-size:.8125rem;font-weight:500;color:hsl(var(--muted-foreground));transition:color .35s;user-select:none}
  .rule-icon{position:relative;width:18px;height:18px;border-radius:9999px;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:hsl(var(--muted));transition:background .35s}
  .rule-icon .icon-x{opacity:1;transform:scale(1);transition:opacity .25s,transform .25s}
  .rule-icon .icon-ok{opacity:0;transform:scale(.4);position:absolute;transition:opacity .25s,transform .25s}
  .rule-item.pass{color:#16a34a}.rule-item.pass .rule-icon{background:rgba(22,163,74,.15)}
  .rule-item.pass .rule-icon svg{stroke:#16a34a}
  .rule-item.pass .icon-x{opacity:0;transform:scale(.4)}.rule-item.pass .icon-ok{opacity:1;transform:scale(1)}
  .rule-item.fail{color:#ef4444}.rule-item.fail .rule-icon{background:rgba(239,68,68,.12)}
  .rule-item.fail .rule-icon svg{stroke:#ef4444}
  @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-4px)}80%{transform:translateX(3px)}}
  .rule-item.shaking{animation:shake .4s ease}
  .strength-bar-wrap{height:4px;border-radius:9999px;background:hsl(var(--muted));overflow:hidden;margin-top:.5rem}
  .strength-bar{height:100%;border-radius:9999px;width:0%;transition:width .4s,background .4s}
  #toast{position:fixed;bottom:1.5rem;right:1.5rem;padding:.75rem 1.25rem;border-radius:.5rem;font-size:.875rem;font-weight:500;color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.3);opacity:0;transform:translateY(8px);transition:opacity .25s,transform .25s;pointer-events:none;z-index:999;display:flex;align-items:center;gap:.5rem}
  #toast.show{opacity:1;transform:translateY(0)}.#toast.success{background:#16a34a}#toast.error{background:#dc2626}
  .sidebar-link{display:flex;align-items:center;gap:.625rem;padding:.5rem .75rem;border-radius:.375rem;font-size:.875rem;font-weight:500;color:hsl(var(--muted-foreground));text-decoration:none;transition:background .15s}
  .sidebar-link:hover,.sidebar-link.active{background:hsl(var(--accent));color:hsl(var(--foreground))}
  .hidden-field{display:none!important}
  .spinner{display:inline-block;width:12px;height:12px;border-radius:9999px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;animation:spin .65s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
`;

function Toggle({ id, defaultOn = true, onClick }) {
  return (
    <div id={id} className={'toggle-track' + (defaultOn ? ' active' : '')} onClick={onClick}>
      <div className="toggle-thumb" />
    </div>
  );
}

function RuleItem({ id, label }) {
  return (
    <div id={id} className="rule-item">
      <span className="rule-icon">
        <RuleX />
        <RuleCheck />
      </span>
      {label}
    </div>
  );
}

export default function AccountSettings() {
  useEffect(function () {
    exposeToWindow();
    exposeSettingsToWindow();
    initApp();
    initSettings();
  }, []);

  return (
    <>
      <Head>
        <title>Account Settings - Bounty</title>
        <link rel="stylesheet" href="/css/styles.css" />
        <style dangerouslySetInnerHTML={{ __html: PAGE_STYLES }} />
      </Head>

      {/* NAV */}
      <nav className="bg-nav border-b border-border/40">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3 gap-4">
          <Link href="/" className="font-bold text-xl text-nav-foreground" style={{ fontFamily: "'Doto',sans-serif" }}>
            Bounty
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium text-foreground">Account Settings</span>
          <div className="ml-auto">
            <button id="theme-toggle" onClick={function () { window.toggleTheme && window.toggleTheme(); }} className="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-accent transition-colors" aria-label="Toggle theme">
              <span className="dark:hidden"><IcoSun /></span>
              <span className="hidden dark:inline"><IcoMoon /></span>
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-8 flex gap-8">

        {/* SIDEBAR */}
        <aside className="hidden lg:flex flex-col gap-1 w-52 flex-shrink-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 mb-2">Settings</p>
          <a href="#profile" className="sidebar-link active">Profile</a>
          <a href="#account" className="sidebar-link">Account</a>
          <a href="#security" className="sidebar-link">Security</a>
          <a href="#notifications" className="sidebar-link">Notifications</a>
          <a href="#description" className="sidebar-link">Description</a>
        </aside>

        {/* MAIN */}
        <main className="flex-1 flex flex-col gap-6 min-w-0">

          {/* PROFILE */}
          <section id="profile" className="settings-card">
            <div className="settings-card-header">Profile</div>
            <div className="p-5 flex flex-col gap-5">
              <div className="flex items-center gap-5">
                <div id="avatar-preview" onClick={function () { document.getElementById('avatar-input') && document.getElementById('avatar-input').click(); }}>
                  <IcoUser />
                </div>
                <input id="avatar-input" type="file" accept="image/jpeg,image/png,image/heic,image/gif" className="hidden" onChange={function (e) { window.handleAvatarUpload && window.handleAvatarUpload(e); }} />
                <div>
                  <button className="edit-btn" onClick={function () { document.getElementById('avatar-input') && document.getElementById('avatar-input').click(); }}>
                    <IcoUpload /> Upload photo
                  </button>
                  <p id="avatar-error" className="hidden text-xs text-red-500 mt-1.5" />
                  <p className="text-xs text-muted-foreground mt-1.5">JPEG, PNG, HEIC or GIF · Max 10 MB</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Username</label>
                <div className="flex gap-2">
                  <input id="field-username" type="text" readOnly className="settings-input flex-1" placeholder="Your username" />
                  <button id="btn-username" className="edit-btn" onClick={function () { window.toggleEdit && window.toggleEdit('username'); }}>
                    <IcoEdit /> Edit
                  </button>
                </div>
                <p id="username-error" className="hidden text-xs text-red-500 mt-1.5">Username must be at least 3 characters.</p>
              </div>
              <div className="flex justify-end">
                <button id="profile-save-btn" className="save-btn" onClick={function () { window.saveProfile && window.saveProfile(); }}>
                  <IcoSave /> Save profile
                </button>
              </div>
            </div>
          </section>

          {/* ACCOUNT */}
          <section id="account" className="settings-card">
            <div className="settings-card-header">Account</div>
            <div className="p-5 flex flex-col gap-5">
              <div id="email-row">
                <label className="text-sm font-medium block mb-1.5">
                  Email address
                  <span id="email-method-badge" className="hidden ml-2 text-xs font-semibold px-2 py-0.5 rounded-full" />
                </label>
                <div className="flex gap-2">
                  <input id="field-email" type="email" readOnly className="settings-input flex-1" placeholder="your@email.com" />
                  <button id="btn-email" className="edit-btn" onClick={function () { window.toggleEdit && window.toggleEdit('email'); }}>
                    <IcoEdit /> Edit
                  </button>
                </div>
                <p id="email-google-note" className="hidden text-xs text-muted-foreground mt-1.5">Email is managed by Google and cannot be changed here.</p>
              </div>
              <div className="flex justify-end">
                <button id="account-save-btn" className="save-btn" onClick={function () { window.saveAccount && window.saveAccount(); }}>
                  <IcoSave /> Save account
                </button>
              </div>
            </div>
          </section>

          {/* SECURITY */}
          <section id="security" className="settings-card">
            <div className="settings-card-header">Security</div>
            <div className="p-5 flex flex-col gap-4">

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Password</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Change your account password</p>
                </div>
                <button className="sec-btn" onClick={function () { window.togglePasswordPanel && window.togglePasswordPanel(); }}>
                  <IcoLock /> Change password
                </button>
              </div>

              <div id="pw-panel" className="pw-panel">
                <div className="flex flex-col gap-3 pt-3 border-t border-border">
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Old Password</label>
                    <input id="pw-current" type="password" placeholder="Enter current password" className="settings-input" />
                    <p id="pw-current-error" className="hidden text-xs text-red-500 mt-1.5">Current password is incorrect.</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">New Password</label>
                    <input id="pw-new" type="password" placeholder="Enter new password" className="settings-input" />
                    <div className="strength-bar-wrap">
                      <div id="strength-bar" className="strength-bar" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
                    {PW_RULES.map(function (r) {
                      return <RuleItem key={r[0]} id={r[0]} label={r[1]} />;
                    })}
                  </div>
                  <div className="flex justify-end gap-2 mt-1">
                    <button className="sec-btn text-xs" onClick={function () { window.togglePasswordPanel && window.togglePasswordPanel(); }}>Cancel</button>
                    <button id="pw-save-btn" className="save-btn" onClick={function () { window.submitPasswordChange && window.submitPasswordChange(); }}>
                      <IcoLock /> Update password
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div>
                  <p className="text-sm font-semibold">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Add an extra layer of security</p>
                </div>
                <button className="sec-btn" onClick={function () { window.toggle2FAPanel && window.toggle2FAPanel(); }}>Enable 2FA</button>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div>
                  <p className="text-sm font-semibold">Active Sessions</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Manage devices signed into your account</p>
                </div>
                <button className="sec-btn" onClick={function () { window.confirmLogoutAll && window.confirmLogoutAll(); }}>Log out all devices</button>
              </div>
            </div>
          </section>

          {/* NOTIFICATIONS */}
          <section id="notifications" className="settings-card">
            <div className="settings-card-header">
              <span>Notifications</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-normal">All</span>
                <Toggle id="master-toggle" onClick={function () { window.toggleMaster && window.toggleMaster(); }} />
              </div>
            </div>
            <div id="notif-list">
              {NOTIF_ROWS.map(function (row) {
                return (
                  <div key={row[0]} className="notif-row">
                    <div>
                      <p className="text-sm font-medium">{row[0]}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{row[1]}</p>
                    </div>
                    <Toggle onClick={function (e) { e.currentTarget.classList.toggle('active'); }} />
                  </div>
                );
              })}
            </div>
          </section>

          {/* DESCRIPTION */}
          <section id="description" className="settings-card">
            <div className="settings-card-header">Profile Description</div>
            <div className="p-5">
              <label className="text-sm font-medium block mb-1.5">About you</label>
              <textarea id="settings-description" className="settings-textarea" placeholder="Tell buyers and sellers about yourself..." maxLength={500} />
              <div className="flex justify-between items-center mt-1.5">
                <p className="text-xs text-muted-foreground"><span id="desc-count">0</span> / 500</p>
                <button className="save-btn" onClick={function () { window.showToast && window.showToast('Description saved!', 'success'); }}>
                  <IcoSave /> Save description
                </button>
              </div>
            </div>
          </section>

        </main>
      </div>

      <div id="toast" />
    </>
  );
}
