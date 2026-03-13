// FILE: pages/messages.js
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';

const DOTO = { fontFamily: "'Doto', sans-serif" };
const S = {
  fg:   { color: 'hsl(var(--foreground))' },
  muted:{ color: 'hsl(var(--muted-foreground))' },
  card: { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' },
  sec:  { background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))' },
};

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60)  return 'Just now';
  const m = Math.floor(s / 60);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30)  return `${d}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function OfficialBadge() {
  return (
    <span
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        gap:            '3px',
        padding:        '1px 7px',
        borderRadius:   '4px',
        border:         '1.5px solid #ffffff',
        background:     '#ffffff',
        color:          '#000000',
        fontSize:       '10px',
        fontWeight:     700,
        letterSpacing:  '0.03em',
        lineHeight:     1,
        userSelect:     'none',
        flexShrink:     0,
      }}
    >
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ marginTop: '0px' }}>
        <polyline
          points="2,6 5,9 10,3"
          stroke="#000000"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      OFFICIAL
    </span>
  );
}

function OfficialSender() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div
        style={{
          width:        '36px',
          height:       '36px',
          borderRadius: '50%',
          background:   'hsl(var(--secondary))',
          border:       '1px solid hsl(var(--border))',
          flexShrink:   0,
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontWeight: 700, fontSize: '14px', color: 'hsl(var(--foreground))' }}>
          Bounty
        </span>
        <OfficialBadge />
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div
        className="w-7 h-7 rounded-full border-2"
        style={{
          borderColor:    'hsl(var(--border))',
          borderTopColor: 'hsl(var(--foreground))',
          animation:      'spin 0.7s linear infinite',
        }}
      />
    </div>
  );
}

function subtypeTag(subtype) {
  const map = {
    application_reviewing: { label: 'Under Review',  color: '#3b82f6' },
    application_approved:  { label: 'Approved',      color: '#22c55e' },
    application_rejected:  { label: 'Declined',      color: '#ef4444' },
  };
  const s = map[subtype];
  if (!s) return null;
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: s.color + '22', color: s.color }}
    >
      {s.label}
    </span>
  );
}

export default function MessagesPage() {
  const [messages,  setMessages]  = useState([]);
  const [unread,    setUnread]    = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [selected,  setSelected]  = useState(null);
  const [token,     setToken]     = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('bounty_token') || '');
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    ['data-top-bar', 'data-main-nav'].forEach(attr => {
      const nodes = document.querySelectorAll(`[${attr}]`);
      if (nodes.length <= 1) return;
      nodes.forEach((node, index) => {
        if (index > 0) node.remove();
      });
    });
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/messages', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { setError('Failed to load messages.'); return; }
      const data = await res.json();
      setMessages(data.messages || []);
      setUnread(data.unread || 0);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  async function openMessage(msg) {
    setSelected(msg);
    if (!msg.read) {
      await fetch('/api/messages', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ messageId: msg._id }),
      }).catch(() => {});
      setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, read: true } : m));
      setUnread(prev => Math.max(0, prev - 1));
    }
  }

  async function markAllRead() {
    await fetch('/api/messages', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body:    JSON.stringify({}),
    }).catch(() => {});
    setMessages(prev => prev.map(m => ({ ...m, read: true })));
    setUnread(0);
  }

  return (
    <>
      <Head>
        <title>Messages — Bounty</title>
      </Head>

      <div className="min-h-screen py-10 px-4" style={{ background: 'hsl(var(--background))' }}>
        <div className="max-w-3xl mx-auto">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black" style={{ ...DOTO, color: 'hsl(var(--foreground))' }}>
                Messages
              </h1>
              {unread > 0 && (
                <p className="text-sm mt-0.5" style={S.muted}>
                  {unread} unread message{unread !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-semibold px-4 py-2 rounded-lg border transition-colors"
                style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))', background: 'transparent' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'hsl(var(--secondary))'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                Mark all as read
              </button>
            )}
          </div>

          {error && (
            <div className="text-center py-10 text-sm" style={{ color: '#ef4444' }}>{error}</div>
          )}

          {loading && <Spinner />}

          {!loading && !error && messages.length === 0 && (
            <div
              className="rounded-2xl border py-20 text-center"
              style={S.card}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="ml-auto mr-auto mb-3" style={S.muted}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2 2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p className="text-sm font-semibold" style={S.muted}>No messages yet</p>
            </div>
          )}

          {!loading && !error && messages.length > 0 && (
            <div className="rounded-2xl border overflow-hidden" style={S.card}>
              {messages.map((msg, i) => (
                <button
                  key={msg._id}
                  onClick={() => openMessage(msg)}
                  className="w-full text-left px-5 py-4 flex items-start gap-4 transition-colors"
                  style={{
                    borderTop:   i > 0 ? '1px solid hsl(var(--border))' : 'none',
                    background:  !msg.read ? 'hsl(var(--secondary))' : 'transparent',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'hsl(var(--secondary))'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = !msg.read ? 'hsl(var(--secondary))' : 'transparent'; }}
                >
                  {msg.type === 'system' ? (
                    <div
                      style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))',
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))',
                        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={S.muted}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {msg.type === 'system' ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold" style={S.fg}>Bounty</span>
                          <OfficialBadge />
                        </div>
                      ) : (
                        <span className="text-sm font-bold" style={S.fg}>
                          {msg.senderUsername || 'User'}
                        </span>
                      )}
                      {!msg.read && (
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: 'hsl(var(--foreground))' }}
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold truncate" style={S.fg}>
                        {msg.subject || '(no subject)'}
                      </p>
                      {msg.subtype && subtypeTag(msg.subtype)}
                    </div>

                    <p className="text-xs truncate" style={S.muted}>
                      {msg.body?.split('\n')[0]}
                    </p>
                  </div>

                  <span className="text-xs flex-shrink-0 mt-0.5" style={S.muted}>
                    {timeAgo(msg.createdAt)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backdropFilter: 'blur(3px)' }}
          onClick={() => setSelected(null)}
        >
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)' }} />
          <div
            className="relative z-10 w-full max-w-lg mx-4 rounded-2xl overflow-hidden shadow-2xl"
            style={S.card}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between px-6 py-5 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
              <div className="flex-1 min-w-0">
                {selected.type === 'system' ? (
                  <OfficialSender />
                ) : (
                  <div className="flex items-center gap-2">
                    <div
                      style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={S.muted}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold" style={S.fg}>{selected.senderUsername || 'User'}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <p className="text-base font-black" style={{ ...DOTO, color: 'hsl(var(--foreground))' }}>
                    {selected.subject || '(no subject)'}
                  </p>
                  {selected.subtype && subtypeTag(selected.subtype)}
                </div>
                <p className="text-xs mt-0.5" style={S.muted}>{timeAgo(selected.createdAt)}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="ml-4 hover:opacity-60 transition-opacity flex-shrink-0"
                style={S.muted}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={S.fg}>
                {selected.body}
              </p>
            </div>
            <div className="px-6 py-4 border-t flex justify-end" style={{ borderColor: 'hsl(var(--border))' }}>
              <button
                onClick={() => setSelected(null)}
                className="px-5 py-2 rounded-xl text-sm font-semibold border transition-colors"
                style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', background: 'transparent' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'hsl(var(--secondary))'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
