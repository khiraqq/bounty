// FILE: pages/admin.js
// Admin Dashboard — Pending Applications + Suspicious Activity (gated)
// Pure React — no document.getElementById, no innerHTML, all client-side guards in useEffect

import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';

// ── Shared style constants (match site) ────────────────────────────────────────
const DOTO = { fontFamily: "'Doto', sans-serif" };

const S = {
  card: {
    background: 'hsl(var(--card))',
    border:     '1px solid hsl(var(--border))',
    borderColor:'hsl(var(--border))',
  },
  input: {
    background:  'hsl(var(--background))',
    borderColor: 'hsl(var(--border))',
    color:       'hsl(var(--foreground))',
  },
  muted:  { color: 'hsl(var(--muted-foreground))' },
  fg:     { color: 'hsl(var(--foreground))' },
  sec:    { background: 'hsl(var(--secondary))', borderColor: 'hsl(var(--border))' },
};

const INPUT_CLS = 'w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all';

// ── Risk helpers (mirrors server utils/riskScore.js) ──────────────────────────
function riskLabel(score) {
  if (score >= 10) return 'Critical';
  if (score >= 6)  return 'High';
  if (score >= 3)  return 'Medium';
  return 'Low';
}
function riskColor(score) {
  if (score >= 10) return '#ef4444';
  if (score >= 6)  return '#f97316';
  if (score >= 3)  return '#eab308';
  return '#22c55e';
}

// ── Tiny helpers ──────────────────────────────────────────────────────────────
function fmt(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
function fmtDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
function shortId(id) { return id ? String(id).slice(-8) : '—'; }

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div
        className="w-8 h-8 rounded-full border-2"
        style={{
          borderColor: 'hsl(var(--border))',
          borderTopColor: 'hsl(var(--foreground))',
          animation: 'spin 0.7s linear infinite',
        }}
      />
    </div>
  );
}

// ── RiskBadge ─────────────────────────────────────────────────────────────────
function RiskBadge({ score }) {
  const label = riskLabel(score);
  const color = riskColor(score);
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold"
      style={{ background: color + '22', color }}
    >
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: color }} />
      {label} ({score})
    </span>
  );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending:   { bg: '#eab30822', color: '#eab308', label: 'Pending' },
    reviewing: { bg: '#3b82f622', color: '#3b82f6', label: 'In Review' },
    approved:  { bg: '#22c55e22', color: '#22c55e', label: 'Approved' },
    rejected:  { bg: '#ef444422', color: '#ef4444', label: 'Rejected' },
    active:    { bg: '#22c55e22', color: '#22c55e', label: 'Active' },
    suspended: { bg: '#f9731622', color: '#f97316', label: 'Suspended' },
    banned:    { bg: '#ef444422', color: '#ef4444', label: 'Banned' },
  };
  const s = map[status] || { bg: 'hsl(var(--secondary))', color: 'hsl(var(--muted-foreground))', label: status };
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 1 — Pending Applications
// ─────────────────────────────────────────────────────────────────────────────
function ApplicationDetailModal({ app, onClose, onReview, onApprove, onReject, loading }) {
  if (!app) return null;
  const rows = [
    ['Username',       app.username],
    ['Email',          app.email || '—'],
    ['Submitted',      fmt(app.createdAt)],
    ['IP Address',     app.ipAddress || '—'],
    ['User Agent',     app.userAgent ? app.userAgent.slice(0, 80) + '…' : '—'],
    ['Categories',     (app.categories || []).join(', ') || '—'],
    ['Experience',     app.experience || '—'],
    ['Platforms',      app.platforms  || '—'],
    ['Reputation',     app.reputation || '—'],
    ['Sourcing',       app.sourcing   || '—'],
    ['Delivery Speed', app.deliverySpeed || '—'],
    ['Discord',        app.discord    || '—'],
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)' }} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1,    y: 0 }}
        exit={{   opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 w-full max-w-xl mx-4 rounded-2xl border shadow-2xl overflow-hidden"
        style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
          <div>
            <h3 className="font-black text-lg" style={{ ...DOTO, color: 'hsl(var(--foreground))' }}>
              Application — {app.username}
            </h3>
            <p className="text-xs mt-0.5" style={S.muted}>{shortId(app._id)}</p>
          </div>
          <button onClick={onClose} className="hover:opacity-60 transition-opacity" style={S.muted}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: '60vh' }}>
          <div className="space-y-2">
            {rows.map(([label, val]) => (
              <div key={label} className="flex gap-3 text-sm">
                <span className="w-36 shrink-0 font-semibold" style={S.muted}>{label}</span>
                <span className="flex-1 break-all" style={S.fg}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        {app.status === 'pending' && (
          <div className="flex gap-3 px-6 py-4 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
            <button
              onClick={() => onReview(app._id)}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors disabled:opacity-40"
              style={{ borderColor: '#3b82f6', color: '#3b82f6', background: 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#3b82f622'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              {loading ? 'Processing...' : 'Mark as Reviewing'}
            </button>
          </div>
        )}
        {app.status === 'reviewing' && (
          <div className="flex gap-3 px-6 py-4 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
            <button
              onClick={() => onApprove(app._id)}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ background: '#22c55e', color: '#fff' }}
            >
              {loading ? 'Processing...' : 'Approve Application'}
            </button>
            <button
              onClick={() => onReject(app._id)}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors disabled:opacity-40"
              style={{ borderColor: '#ef4444', color: '#ef4444', background: 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#ef444422'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              Reject
            </button>
          </div>
        )}
        {(app.status === 'approved' || app.status === 'rejected') && (
          <div className="px-6 py-4 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
            <StatusBadge status={app.status} />
            {app.reviewedAt && (
              <span className="text-xs ml-3" style={S.muted}>Reviewed {fmt(app.reviewedAt)}</span>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function PendingApplicationsTab({ token }) {
  const [apps, setApps]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [filter, setFilter]   = useState('pending');
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast]     = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchApps = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/applications?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Failed to load'); return; }
      setApps(data.applications || []);
      setTotal(data.total || 0);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [filter, token]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  async function handleAction(appId, action) {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/applications?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ applicationId: appId }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.message || 'Error'); return; }
      showToast(data.message);
      setSelected(null);
      fetchApps();
    } catch {
      showToast('Network error');
    } finally {
      setActionLoading(false);
    }
  }

  const FILTERS = ['pending', 'reviewing', 'approved', 'rejected', 'all'];

  return (
    <div>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold"
            style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selected && (
          <ApplicationDetailModal
            app={selected}
            onClose={() => setSelected(null)}
            onReview={id  => handleAction(id, 'review')}
            onApprove={id => handleAction(id, 'approve')}
            onReject={id  => handleAction(id, 'reject')}
            loading={actionLoading}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black" style={{ ...DOTO, color: 'hsl(var(--foreground))' }}>
            Seller Applications
          </h2>
          <p className="text-sm mt-0.5" style={S.muted}>{total} total</p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl border" style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--secondary))' }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
              style={{
                background: filter === f ? 'hsl(var(--foreground))' : 'transparent',
                color:      filter === f ? 'hsl(var(--background))' : 'hsl(var(--muted-foreground))',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading && <Spinner />}
      {!loading && error && (
        <div className="text-center py-12 text-sm" style={{ color: '#ef4444' }}>{error}</div>
      )}
      {!loading && !error && apps.length === 0 && (
        <div className="text-center py-12 text-sm" style={S.muted}>No {filter} applications found.</div>
      )}

      {!loading && !error && apps.length > 0 && (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'hsl(var(--border))' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'hsl(var(--secondary))' }}>
                {['Username', 'Email', 'Date', 'IP Address', 'Categories', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={S.muted}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {apps.map((app, i) => (
                <tr
                  key={app._id}
                  style={{ borderTop: i > 0 ? '1px solid hsl(var(--border))' : 'none' }}
                >
                  <td className="px-4 py-3 font-semibold" style={S.fg}>{app.username}</td>
                  <td className="px-4 py-3" style={S.muted}>{app.email || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap" style={S.muted}>{fmtDate(app.createdAt)}</td>
                  <td className="px-4 py-3 font-mono text-xs" style={S.muted}>{app.ipAddress || '—'}</td>
                  <td className="px-4 py-3" style={S.muted}>
                    {(app.categories || []).slice(0, 3).join(', ')}{app.categories?.length > 3 ? '…' : ''}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelected(app)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
                      style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', background: 'transparent' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'hsl(var(--secondary))'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      View Application
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 2 — Suspicious Activity (gated)
// ─────────────────────────────────────────────────────────────────────────────

// ── Security Gateway ──────────────────────────────────────────────────────────
function SecurityGateway({ onUnlock }) {
  const [step, setStep]             = useState(1); // 1 = password, 2 = security question
  const [password, setPassword]     = useState('');
  const [secAnswer, setSecAnswer]   = useState('');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      const body = step === 1
        ? { password, securityAnswer: '__skip__' }
        : { password, securityAnswer: secAnswer };

      // We do full validation in one shot on step 2 only.
      // On step 1 we just move forward locally if password is non-empty
      // (actual validation is server-side on step 2).
      if (step === 1) {
        if (!password) { setError('Password required.'); setLoading(false); return; }
        setStep(2);
        setLoading(false);
        return;
      }

      const res = await fetch('/api/admin/verify-security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, securityAnswer: secAnswer.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Verification failed.');
        if (data.field === 'password') setStep(1);
        return;
      }
      onUnlock();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md rounded-2xl border shadow-2xl p-8"
        style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
      >
        {/* Lock icon */}
        <div className="flex justify-center mb-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={S.muted}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-black text-center mb-1" style={{ ...DOTO, color: 'hsl(var(--foreground))' }}>
          Restricted Access
        </h2>
        <p className="text-sm text-center mb-6" style={S.muted}>
          This area requires additional verification.
        </p>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map(n => (
            <div key={n} className="flex items-center gap-2 flex-1">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  background: step >= n ? 'hsl(var(--foreground))' : 'hsl(var(--secondary))',
                  color:      step >= n ? 'hsl(var(--background))' : 'hsl(var(--muted-foreground))',
                  border:     `1px solid ${step >= n ? 'hsl(var(--foreground))' : 'hsl(var(--border))'}`,
                }}
              >
                {step > n ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : n}
              </div>
              <span className="text-xs" style={S.muted}>
                {n === 1 ? 'Admin Password' : 'Security Question'}
              </span>
              {n < 2 && <div className="flex-1 h-px" style={{ background: 'hsl(var(--border))' }} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={S.muted}>
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Enter admin password"
                className={INPUT_CLS}
                style={S.input}
                autoFocus
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={S.muted}>
                Security Question
              </label>
              <p className="text-sm mb-3 font-medium" style={S.fg}>
                What was our brand name before we rebranded?
              </p>
              <input
                type="text"
                value={secAnswer}
                onChange={e => setSecAnswer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Answer (case-sensitive)"
                className={INPUT_CLS}
                style={S.input}
                autoFocus
              />
              <p className="text-xs mt-1.5" style={S.muted}>Answer is case-sensitive including spaces.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p className="mt-3 text-xs text-red-500 rounded-lg px-3 py-2" style={{ background: '#ef444422' }}>
            {error}
          </p>
        )}

        <div className="flex gap-3 mt-5">
          {step === 2 && (
            <button
              onClick={() => { setStep(1); setError(''); }}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors"
              style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))', background: 'transparent' }}
            >
              Back
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: 'hsl(var(--foreground))', color: 'hsl(var(--background))' }}
          >
            {loading ? 'Verifying...' : step === 1 ? 'Continue' : 'Unlock Dashboard'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── User Profile Search Result ────────────────────────────────────────────────
function UserProfilePanel({ profile, token, onClose }) {
  const { user, riskScore, riskBreakdown, orders, activeListings, deletedListings } = profile;
  const [flagging, setFlagging] = useState(false);
  const [flagMsg, setFlagMsg]   = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  async function toggleFlag() {
    setFlagging(true);
    try {
      const res = await fetch('/api/admin/flag-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetUserId: user._id, flagged: !user.manualFlagged }),
      });
      const data = await res.json();
      setFlagMsg(data.message || '');
    } finally {
      setFlagging(false);
    }
  }

  const tabs = ['overview', 'orders', 'listings', 'risk', 'audit'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-6 rounded-2xl border overflow-hidden"
      style={{ borderColor: 'hsl(var(--border))' }}
    >
      {/* Profile Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ background: 'hsl(var(--secondary))', borderColor: 'hsl(var(--border))' }}>
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg" style={{ ...DOTO, color: 'hsl(var(--foreground))' }}>{user.username}</span>
              {user.manualFlagged && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: '#ef444422', color: '#ef4444' }}>Flagged</span>
              )}
              <StatusBadge status={user.status} />
            </div>
            <p className="text-xs mt-0.5" style={S.muted}>{user.email} · ID: {shortId(user._id)} · Joined {fmtDate(user.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <RiskBadge score={riskScore} />
          <button
            onClick={toggleFlag}
            disabled={flagging}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50"
            style={{
              borderColor: user.manualFlagged ? '#22c55e' : '#ef4444',
              color:       user.manualFlagged ? '#22c55e' : '#ef4444',
              background:  'transparent',
            }}
          >
            {flagging ? '...' : user.manualFlagged ? 'Remove Flag' : 'Flag User'}
          </button>
          <button onClick={onClose} className="hover:opacity-60 transition-opacity" style={S.muted}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {flagMsg && (
        <div className="px-6 py-2 text-xs font-medium" style={{ background: '#22c55e22', color: '#22c55e' }}>{flagMsg}</div>
      )}

      {/* Sub-tabs */}
      <div className="flex gap-0 border-b overflow-x-auto" style={{ borderColor: 'hsl(var(--border))' }}>
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className="px-5 py-3 text-sm font-semibold capitalize transition-all whitespace-nowrap"
            style={{
              color:       activeTab === t ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
              borderBottom: activeTab === t ? '2px solid hsl(var(--foreground))' : '2px solid transparent',
              background:  'transparent',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Identity */}
            <Section title="Identity">
              <Row label="User ID"     val={String(user._id)} mono />
              <Row label="Username"    val={user.username} />
              <Row label="Email"       val={user.email} />
              <Row label="Role"        val={user.role} />
              <Row label="Status"      val={<StatusBadge status={user.status} />} />
              <Row label="Joined"      val={fmt(user.createdAt)} />
              <Row label="Reg IP"      val={user.registrationIp || '—'} mono />
            </Section>

            {/* Wallet */}
            <Section title="Wallet &amp; Transactions">
              <Row label="Total Volume" val={`$${Number(user.totalVolume || 0).toFixed(2)}`} />
              <Row label="Dispute Count" val={user.disputeCount || 0} />
              <Row label="Wallet Addresses" val={
                <div className="space-y-1">
                  {(user.walletAddresses || []).length === 0
                    ? <span style={S.muted}>None</span>
                    : (user.walletAddresses || []).map((w, i) => (
                        <div key={i} className="font-mono text-xs break-all" style={S.fg}>{w}</div>
                      ))
                  }
                </div>
              } />
            </Section>

            {/* Login history */}
            <Section title="Recent Login IPs" className="md:col-span-2">
              {(user.loginHistory || []).length === 0
                ? <span className="text-sm" style={S.muted}>No login history.</span>
                : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr style={{ color: 'hsl(var(--muted-foreground))' }}>
                          {['IP', 'Country', 'Time'].map(h => (
                            <th key={h} className="text-left pb-2 pr-6 font-semibold uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(user.loginHistory || []).slice(-10).reverse().map((l, i) => (
                          <tr key={i} style={{ borderTop: i > 0 ? '1px solid hsl(var(--border))' : 'none' }}>
                            <td className="py-1.5 pr-6 font-mono" style={S.fg}>{l.ipAddress || '—'}</td>
                            <td className="py-1.5 pr-6" style={S.muted}>{l.country || '—'}</td>
                            <td className="py-1.5" style={S.muted}>{fmt(l.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </Section>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <p className="text-sm font-semibold mb-4" style={S.fg}>{orders.length} orders</p>
            {orders.length === 0
              ? <p className="text-sm" style={S.muted}>No orders found.</p>
              : (
                <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'hsl(var(--border))' }}>
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: 'hsl(var(--secondary))' }}>
                        {['Order ID', 'Buyer', 'Seller', 'Amount', 'Status', 'Escrow', 'Date'].map(h => (
                          <th key={h} className="text-left px-3 py-2.5 font-semibold uppercase tracking-wide" style={S.muted}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o, i) => (
                        <tr key={String(o._id)} style={{ borderTop: i > 0 ? '1px solid hsl(var(--border))' : 'none' }}>
                          <td className="px-3 py-2 font-mono" style={S.muted}>{shortId(o._id)}</td>
                          <td className="px-3 py-2" style={S.muted}>{shortId(o.buyerId)}</td>
                          <td className="px-3 py-2" style={S.muted}>{shortId(o.sellerId)}</td>
                          <td className="px-3 py-2 font-semibold" style={S.fg}>${Number(o.amount || 0).toFixed(2)}</td>
                          <td className="px-3 py-2"><StatusBadge status={o.status || 'unknown'} /></td>
                          <td className="px-3 py-2" style={S.muted}>{o.escrowStatus || '—'}</td>
                          <td className="px-3 py-2" style={S.muted}>{fmtDate(o.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="space-y-6">
            <ListingSection title="Active Listings" listings={activeListings} />
            <ListingSection title="Deleted Listings" listings={deletedListings} deleted />
          </div>
        )}

        {activeTab === 'risk' && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <RiskBadge score={riskScore} />
              <p className="text-sm" style={S.muted}>
                Score calculated from {riskBreakdown?.length || 0} risk factors
              </p>
            </div>
            {/* Risk score bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs mb-1.5" style={S.muted}>
                <span>Risk Score</span>
                <span>{riskScore} / 24</span>
              </div>
              <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'hsl(var(--secondary))' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((riskScore / 24) * 100, 100)}%` }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full"
                  style={{ background: riskColor(riskScore) }}
                />
              </div>
            </div>
            {/* Factor breakdown */}
            <div className="space-y-2">
              {(riskBreakdown || []).map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl px-4 py-2.5 text-sm"
                  style={{
                    background: f.triggered ? riskColor(f.weight) + '11' : 'hsl(var(--secondary))',
                    border: `1px solid ${f.triggered ? riskColor(f.weight) + '44' : 'hsl(var(--border))'}`,
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: f.triggered ? riskColor(f.weight) : 'hsl(var(--border))' }}
                    />
                    <span style={{ color: f.triggered ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}>
                      {f.factor}
                    </span>
                    {f.note && <span className="text-xs" style={S.muted}>· {f.note}</span>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="text-xs font-bold"
                      style={{ color: f.triggered ? riskColor(f.weight) : 'hsl(var(--muted-foreground))' }}
                    >
                      +{f.weight}
                    </span>
                    {f.triggered
                      ? <span className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: riskColor(f.weight) + '33', color: riskColor(f.weight) }}>
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        </span>
                      : <span className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'hsl(var(--secondary))', color: 'hsl(var(--border))' }}>
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </span>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div>
            <p className="text-sm font-semibold mb-4" style={S.fg}>Security Audit Log</p>
            {(user.auditLog || []).length === 0
              ? <p className="text-sm" style={S.muted}>No audit entries.</p>
              : (
                <div className="space-y-2">
                  {[...(user.auditLog || [])].reverse().map((entry, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm" style={{ background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))' }}>
                      <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{
                        background: entry.action.includes('fail') || entry.action.includes('flag') ? '#ef4444' : '#22c55e'
                      }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold font-mono text-xs" style={S.fg}>{entry.action}</span>
                          {entry.ipAddress && <span className="text-xs font-mono" style={S.muted}>{entry.ipAddress}</span>}
                          {entry.country && <span className="text-xs" style={S.muted}>{entry.country}</span>}
                        </div>
                        {entry.details && <p className="text-xs mt-0.5" style={S.muted}>{entry.details}</p>}
                        <p className="text-xs mt-0.5" style={S.muted}>{fmt(entry.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Reusable section/row helpers ──────────────────────────────────────────────
function Section({ title, children, className = '' }) {
  return (
    <div className={className}>
      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={S.muted}>{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
function Row({ label, val, mono = false }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-32 shrink-0 font-medium" style={S.muted}>{label}</span>
      <span className={`flex-1 break-all ${mono ? 'font-mono text-xs' : ''}`} style={S.fg}>
        {val}
      </span>
    </div>
  );
}
function ListingSection({ title, listings, deleted = false }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={S.muted}>
        {title} ({listings.length})
      </p>
      {listings.length === 0
        ? <p className="text-sm" style={S.muted}>None.</p>
        : (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'hsl(var(--border))' }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: 'hsl(var(--secondary))' }}>
                  {['ID', 'Title', 'Price', 'Created'].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 font-semibold uppercase tracking-wide" style={S.muted}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listings.map((l, i) => (
                  <tr key={String(l._id)} style={{ borderTop: i > 0 ? '1px solid hsl(var(--border))' : 'none', opacity: deleted ? 0.7 : 1 }}>
                    <td className="px-3 py-2 font-mono" style={S.muted}>{shortId(l._id)}</td>
                    <td className="px-3 py-2" style={S.fg}>{l.title}</td>
                    <td className="px-3 py-2 font-semibold" style={S.fg}>${Number(l.price || 0).toFixed(2)}</td>
                    <td className="px-3 py-2" style={S.muted}>{fmtDate(l.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}

// ── Risk Score Table ──────────────────────────────────────────────────────────
function RiskScoreTable({ token }) {
  const [users, setUsers]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [minScore, setMinScore] = useState('3');

  useEffect(() => {
    async function fetch_() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/suspicious-users?minScore=${minScore}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUsers(data.users || []);
        setTotal(data.total || 0);
      } finally {
        setLoading(false);
      }
    }
    fetch_();
  }, [minScore, token]);

  const THRESHOLDS = [{ label: 'All (1+)', val: '1' }, { label: 'Medium (3+)', val: '3' }, { label: 'High (6+)', val: '6' }, { label: 'Critical (10+)', val: '10' }];

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-black text-lg" style={{ ...DOTO, color: 'hsl(var(--foreground))' }}>
            Risk Factor Table
          </h3>
          <p className="text-sm mt-0.5" style={S.muted}>{total} user(s) flagged</p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl border" style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--secondary))' }}>
          {THRESHOLDS.map(t => (
            <button
              key={t.val}
              onClick={() => setMinScore(t.val)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: minScore === t.val ? 'hsl(var(--foreground))' : 'transparent',
                color:      minScore === t.val ? 'hsl(var(--background))' : 'hsl(var(--muted-foreground))',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <Spinner />}
      {!loading && users.length === 0 && (
        <p className="text-center py-8 text-sm" style={S.muted}>No users above this risk threshold.</p>
      )}
      {!loading && users.length > 0 && (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'hsl(var(--border))' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'hsl(var(--secondary))' }}>
                {['#', 'User', 'Role', 'Status', 'Risk Score', 'Reg IP', 'Wallets', 'Volume', 'Joined'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={S.muted}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={String(u._id)} style={{ borderTop: i > 0 ? '1px solid hsl(var(--border))' : 'none' }}>
                  <td className="px-4 py-3 text-xs font-mono" style={S.muted}>{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold" style={S.fg}>{u.username}</div>
                    <div className="text-xs" style={S.muted}>{u.email}</div>
                  </td>
                  <td className="px-4 py-3 text-xs capitalize" style={S.muted}>{u.role}</td>
                  <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                  <td className="px-4 py-3"><RiskBadge score={u.riskScore} /></td>
                  <td className="px-4 py-3 text-xs font-mono" style={S.muted}>{u.registrationIp || '—'}</td>
                  <td className="px-4 py-3 text-xs" style={S.muted}>{(u.walletAddresses || []).length}</td>
                  <td className="px-4 py-3 text-xs font-semibold" style={S.fg}>${Number(u.totalVolume || 0).toFixed(0)}</td>
                  <td className="px-4 py-3 text-xs" style={S.muted}>{fmtDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Suspicious Activity main tab ──────────────────────────────────────────────
function SuspiciousActivityTab({ token }) {
  const [unlocked, setUnlocked] = useState(false);
  const [query, setQuery]       = useState('');
  const [searching, setSearching] = useState(false);
  const [profile, setProfile]   = useState(null);
  const [searchError, setSearchError] = useState('');

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearchError('');
    setProfile(null);
    try {
      const res = await fetch(`/api/admin/user-profile?q=${encodeURIComponent(query.trim())}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { setSearchError(data.message || 'Not found.'); return; }
      setProfile(data);
    } catch {
      setSearchError('Network error.');
    } finally {
      setSearching(false);
    }
  }

  if (!unlocked) {
    return <SecurityGateway onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={S.muted}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-black" style={{ ...DOTO, color: 'hsl(var(--foreground))' }}>
            Suspicious Activity
          </h2>
          <p className="text-sm mt-0.5" style={S.muted}>Search users and review risk profiles</p>
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-2">
        <div
          className="flex-1 flex items-center gap-2 rounded-xl border px-4 py-2.5"
          style={{ background: 'hsl(var(--secondary))', borderColor: 'hsl(var(--border))' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={S.muted}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by username or email..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={S.fg}
          />
        </div>
        <button
          type="submit"
          disabled={searching || !query.trim()}
          className="px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{ background: 'hsl(var(--foreground))', color: 'hsl(var(--background))' }}
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {searchError && (
        <p className="text-sm mt-2 mb-4" style={{ color: '#ef4444' }}>{searchError}</p>
      )}

      {profile && (
        <UserProfilePanel
          profile={profile}
          token={token}
          onClose={() => setProfile(null)}
        />
      )}

      <RiskScoreTable token={token} />
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Admin Page
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  {
    id: 'applications',
    label: 'Pending Applications',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    id: 'suspicious',
    label: 'Suspicious Activity',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    danger: true,
  },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('applications');
  const [token, setToken]         = useState('');
  const [isAdmin, setIsAdmin]     = useState(null); // null=loading, false=denied, true=ok

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tok = localStorage.getItem('bounty_token');
    if (!tok) { setIsAdmin(false); return; }
    setToken(tok);
    // Verify admin role by checking the applications endpoint
    fetch('/api/admin/applications?limit=1', {
      headers: { Authorization: `Bearer ${tok}` },
    }).then(r => {
      if (r.status === 403 || r.status === 401) setIsAdmin(false);
      else setIsAdmin(true);
    }).catch(() => setIsAdmin(false));
  }, []);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(var(--background))' }}>
        <Spinner />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(var(--background))' }}>
        <div className="text-center">
          <svg className="mx-auto mb-4" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={S.muted}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <h1 className="text-2xl font-black mb-2" style={{ ...DOTO, color: 'hsl(var(--foreground))' }}>Access Denied</h1>
          <p className="text-sm" style={S.muted}>You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard — Bounty</title>
      </Head>

      {/* Background texture */}
      <div className="fixed inset-0 pointer-events-none" style={{
        opacity: 0.022,
        backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      <div className="relative z-10 min-h-screen" style={{ background: 'hsl(var(--background))' }}>
        <div className="mx-auto max-w-7xl px-6 py-8">

          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight" style={{ ...DOTO, color: 'hsl(var(--foreground))' }}>
              Admin Dashboard
            </h1>
            <p className="text-sm mt-1" style={S.muted}>Manage applications and monitor platform activity</p>
          </div>

          {/* Tab navigation */}
          <div className="flex gap-2 mb-8 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all"
                style={{
                  color:        activeTab === tab.id
                    ? tab.danger ? '#ef4444' : 'hsl(var(--foreground))'
                    : 'hsl(var(--muted-foreground))',
                  borderBottom: activeTab === tab.id
                    ? `2px solid ${tab.danger ? '#ef4444' : 'hsl(var(--foreground))'}`
                    : '2px solid transparent',
                  background:   'transparent',
                }}
              >
                <span style={{
                  color: activeTab === tab.id
                    ? tab.danger ? '#ef4444' : 'hsl(var(--foreground))'
                    : 'hsl(var(--muted-foreground))'
                }}>
                  {tab.icon}
                </span>
                {tab.label}
                {tab.danger && (
                  <span
                    className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: '#ef444422', color: '#ef4444' }}
                  >
                    Restricted
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={  { opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'applications' && <PendingApplicationsTab token={token} />}
              {activeTab === 'suspicious'   && <SuspiciousActivityTab  token={token} />}
            </motion.div>
          </AnimatePresence>

        </div>
      </div>

      {/* Spin keyframe */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}