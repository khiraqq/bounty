// FILE: pages/admin.js
// Admin Dashboard — Pending Applications + Suspicious Activity (gated)
// Pure React — no document.getElementById, no innerHTML, all client-side guards in useEffect

import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';

// -- Shared style constants (match site) ----------------------------------------
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

// -- Risk helpers (mirrors server utils/riskScore.js) --------------------------
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

// -- Tiny helpers --------------------------------------------------------------
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

// -- Spinner -------------------------------------------------------------------
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

// -- RiskBadge -----------------------------------------------------------------
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

// -- StatusBadge ---------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// TAB 1 — Pending Applications
// -----------------------------------------------------------------------------
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

      {loading && <Spinner />}...
