import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { initApp, exposeToWindow } from '../utils/auth';

// ── SVG icons ─────────────────────────────────────────────────────────────────

function IcoSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function IcoSend() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function IcoBell() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function IcoBellOff() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      <path d="M18.63 13A17.9 17.9 0 0 1 18 8" />
      <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14" />
      <path d="M18 8a6 6 0 0 0-9.33-5" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

function IcoUser() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IcoCheck() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IcoCheckCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 7 17l-5-5" /><path d="m22 10-7.5 7.5L13 16" />
    </svg>
  );
}

function IcoArrowLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function IcoSun() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
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

// ── helpers ───────────────────────────────────────────────────────────────────

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getConvId(a, b) {
  return [a, b].sort().join('__');
}

function getToken() {
  try { return localStorage.getItem('bounty_token') || ''; } catch (_) { return ''; }
}

function getUsername() {
  try { return localStorage.getItem('authenticated_username') || ''; } catch (_) { return ''; }
}

const PAGE_STYLES = `
  :root{--brand:#6c47ff;--brand-hover:#5835e0}
  .msg-sidebar{width:320px;flex-shrink:0;border-right:1px solid hsl(var(--border));display:flex;flex-direction:column;height:100%}
  @media(max-width:768px){.msg-sidebar{width:100%;border-right:none}.msg-chat-area{display:none}.msg-sidebar.mobile-hidden{display:none}.msg-chat-area.mobile-visible{display:flex}}
  .msg-chat-area{flex:1;display:flex;flex-direction:column;height:100%}
  .conv-item{display:flex;align-items:center;gap:.75rem;padding:.75rem 1rem;cursor:pointer;transition:background .12s;border-bottom:1px solid hsl(var(--border)/0.5)}
  .conv-item:hover{background:hsl(var(--accent))}
  .conv-item.active{background:hsl(var(--accent))}
  .conv-avatar{width:42px;height:42px;border-radius:9999px;background:hsl(var(--muted));display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid hsl(var(--border))}
  .unread-dot{width:9px;height:9px;border-radius:9999px;background:#6c47ff;flex-shrink:0}
  .msg-bubble{max-width:72%;padding:.625rem .875rem;border-radius:1rem;font-size:.875rem;line-height:1.45;word-break:break-word}
  .msg-bubble.mine{background:#6c47ff;color:#fff;border-bottom-right-radius:.25rem;margin-left:auto}
  .msg-bubble.theirs{background:hsl(var(--muted));color:hsl(var(--foreground));border-bottom-left-radius:.25rem}
  .msg-input-wrap{border-top:1px solid hsl(var(--border));padding:.875rem 1rem;display:flex;gap:.5rem;align-items:flex-end;background:hsl(var(--background))}
  .msg-input{flex:1;resize:none;padding:.625rem .875rem;border-radius:.75rem;background:hsl(var(--muted)/0.5);border:1px solid hsl(var(--border));color:hsl(var(--foreground));font-size:.875rem;line-height:1.45;max-height:120px;outline:none;font-family:inherit}
  .msg-input:focus{border-color:hsl(var(--ring))}
  .send-btn{width:38px;height:38px;border-radius:9999px;background:#6c47ff;color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .15s}
  .send-btn:hover{background:#5835e0}
  .send-btn:disabled{opacity:.5;cursor:not-allowed}
  .notif-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.5rem .875rem;border-radius:.375rem;font-size:.8125rem;font-weight:600;border:1px solid hsl(var(--border));background:transparent;color:hsl(var(--foreground));cursor:pointer;transition:background .15s}
  .notif-btn:hover{background:hsl(var(--accent))}
  .notif-btn.enabled{border-color:#16a34a;color:#16a34a;background:rgba(22,163,74,.08)}
  .notif-btn.denied{border-color:#ef4444;color:#ef4444;background:rgba(239,68,68,.08);cursor:not-allowed}
  .empty-state{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;opacity:.55}
  .date-divider{text-align:center;font-size:.75rem;color:hsl(var(--muted-foreground));margin:.5rem 0;position:relative}
  .date-divider::before,.date-divider::after{content:'';position:absolute;top:50%;width:30%;height:1px;background:hsl(var(--border))}
  .date-divider::before{left:5%}.date-divider::after{right:5%}
`;

export default function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [notifStatus, setNotifStatus] = useState('default');
  const [mobileView, setMobileView] = useState('list');
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);
  const currentUser = typeof window !== 'undefined' ? getUsername() : '';

  useEffect(function () {
    exposeToWindow();
    initApp();
    checkNotifPermission();
    loadConversations();
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const withUser = urlParams ? urlParams.get('with') : null;
    if (withUser && currentUser) {
      const convId = getConvId(currentUser, withUser);
      openConversation({ conversationId: convId, participants: [currentUser, withUser], lastMessage: '', lastMessageAt: new Date().toISOString() });
    }
  }, []);

  useEffect(function () {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function checkNotifPermission() {
    if (typeof Notification === 'undefined') { setNotifStatus('unsupported'); return; }
    setNotifStatus(Notification.permission);
  }

  async function requestNotifications() {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'denied') return;
    const perm = await Notification.requestPermission();
    setNotifStatus(perm);
    if (perm === 'granted') showBrowserNotif('Notifications enabled!', 'You will now receive message notifications from Bounty.');
  }

  function showBrowserNotif(title, body) {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, { body: body, icon: '/favicon.ico' });
    }
  }

  async function loadConversations() {
    try {
      const res = await fetch('/api/messages', { headers: { Authorization: 'Bearer ' + getToken() } });
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (_) {}
  }

  async function openConversation(conv) {
    setActiveConv(conv);
    setMobileView('chat');
    if (pollRef.current) clearInterval(pollRef.current);
    await loadMessages(conv.conversationId);
    pollRef.current = setInterval(function () { loadMessages(conv.conversationId); }, 4000);
  }

  async function loadMessages(convId) {
    try {
      const res = await fetch('/api/messages/' + convId, { headers: { Authorization: 'Bearer ' + getToken() } });
      if (res.ok) {
        const data = await res.json();
        const newMsgs = data.messages || [];
        setMessages(function (prev) {
          if (prev.length && newMsgs.length > prev.length) {
            const newest = newMsgs[newMsgs.length - 1];
            if (newest.fromUsername !== currentUser) {
              showBrowserNotif('New message from ' + newest.fromUsername, newest.text.slice(0, 80));
            }
          }
          return newMsgs;
        });
        loadConversations();
      }
    } catch (_) {}
  }

  function goBack() {
    setMobileView('list');
    setActiveConv(null);
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }

  async function sendMessage() {
    if (!inputText.trim() || !activeConv || loading) return;
    const otherUser = activeConv.participants.find(function (p) { return p !== currentUser; }) || '';
    if (!otherUser) return;
    setLoading(true);
    const tempMsg = { _id: Date.now(), fromUsername: currentUser, toUsername: otherUser, text: inputText.trim(), createdAt: new Date().toISOString(), read: false };
    setMessages(function (prev) { return [...prev, tempMsg]; });
    const textToSend = inputText.trim();
    setInputText('');
    try {
      await fetch('/api/messages/' + activeConv.conversationId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + getToken() },
        body: JSON.stringify({ text: textToSend, toUsername: otherUser }),
      });
      loadConversations();
    } catch (_) {}
    setLoading(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  const otherUser = activeConv ? (activeConv.participants.find(function (p) { return p !== currentUser; }) || '') : '';

  function notifBtnClass() {
    if (notifStatus === 'granted') return 'notif-btn enabled';
    if (notifStatus === 'denied') return 'notif-btn denied';
    return 'notif-btn';
  }

  function notifLabel() {
    if (notifStatus === 'granted') return 'Notifications On';
    if (notifStatus === 'denied') return 'Notifications Blocked';
    if (notifStatus === 'unsupported') return 'Not Supported';
    return 'Enable Notifications';
  }

  return (
    <>
      <Head>
        <title>Messages - Bounty</title>
        <link rel="stylesheet" href="/css/styles.css" />
        <style dangerouslySetInnerHTML={{ __html: PAGE_STYLES }} />
      </Head>

      {/* NAV */}
      <nav className="bg-nav border-b border-border/40">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3 gap-4">
          <Link href="/" className="font-bold text-xl text-nav-foreground" style={{ fontFamily: "'Doto',sans-serif" }}>Bounty</Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">Messages</span>
          <div className="ml-auto flex items-center gap-2">
            <button className={notifBtnClass()} onClick={requestNotifications} disabled={notifStatus === 'denied' || notifStatus === 'unsupported'} title={notifStatus === 'denied' ? 'Notifications blocked — please allow in browser settings' : ''}>
              {notifStatus === 'granted' ? <IcoBell /> : <IcoBellOff />}
              {notifLabel()}
            </button>
            <button id="theme-toggle" onClick={function () { window.toggleTheme && window.toggleTheme(); }} className="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-accent transition-colors" aria-label="Toggle theme">
              <span className="dark:hidden"><IcoSun /></span>
              <span className="hidden dark:inline"><IcoMoon /></span>
            </button>
          </div>
        </div>
      </nav>

      {/* MESSAGES LAYOUT */}
      <div className="mx-auto max-w-7xl" style={{ height: 'calc(100vh - 57px)', display: 'flex', overflow: 'hidden' }}>

        {/* SIDEBAR */}
        <div className={'msg-sidebar' + (mobileView === 'chat' ? ' mobile-hidden' : '')}>
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-2 bg-muted/60 rounded-lg px-3 py-2">
              <IcoSearch />
              <input placeholder="Search conversations" className="bg-transparent text-sm outline-none flex-1 text-foreground placeholder:text-muted-foreground" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 && (
              <div className="empty-state p-8 text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <p className="text-sm font-medium text-foreground">No conversations yet</p>
                <p className="text-xs text-muted-foreground mt-1">Browse listings and message a seller to get started</p>
                <Link href="/" className="mt-3 inline-block text-xs font-semibold px-4 py-2 rounded-lg text-white" style={{ background: '#6c47ff' }}>Browse Listings</Link>
              </div>
            )}
            {conversations.map(function (conv) {
              const other = conv.participants.find(function (p) { return p !== currentUser; }) || 'Unknown';
              const isActive = activeConv && activeConv.conversationId === conv.conversationId;
              const unread = (conv.unreadCount && conv.unreadCount[currentUser]) || 0;
              return (
                <div key={conv.conversationId} className={'conv-item' + (isActive ? ' active' : '')} onClick={function () { openConversation(conv); }}>
                  <div className="conv-avatar"><IcoUser /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-semibold text-foreground truncate">{other}</span>
                      <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{formatTime(conv.lastMessageAt)}</span>
                    </div>
                    <p className={'text-xs truncate' + (unread ? ' font-medium text-foreground' : ' text-muted-foreground')}>{conv.lastMessage || 'Start a conversation'}</p>
                  </div>
                  {unread > 0 && <div className="unread-dot" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* CHAT AREA */}
        <div className={'msg-chat-area' + (mobileView === 'chat' ? ' mobile-visible' : '')}>
          {!activeConv && (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p className="text-sm text-muted-foreground font-medium">Select a conversation to start chatting</p>
            </div>
          )}
          {activeConv && (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background">
                <button className="md:hidden text-foreground" onClick={goBack}><IcoArrowLeft /></button>
                <div className="conv-avatar" style={{ width: 36, height: 36 }}><IcoUser /></div>
                <div>
                  <p className="text-sm font-bold text-foreground">{otherUser}</p>
                  <Link href={'/seller/' + otherUser} className="text-xs text-muted-foreground hover:underline">View profile</Link>
                </div>
                <div className="ml-auto">
                  <Link href={'/seller/' + otherUser} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-accent transition-colors text-foreground">
                    View Listings
                  </Link>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
                {messages.length === 0 && (
                  <div className="empty-state">
                    <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
                  </div>
                )}
                {messages.map(function (msg, idx) {
                  const isMine = msg.fromUsername === currentUser;
                  const prevMsg = messages[idx - 1];
                  const showDate = !prevMsg || new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();
                  return (
                    <div key={msg._id || idx}>
                      {showDate && (
                        <div className="date-divider">{new Date(msg.createdAt).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                      )}
                      <div className={'flex items-end gap-2' + (isMine ? ' flex-row-reverse' : '')}>
                        {!isMine && (
                          <div className="conv-avatar flex-shrink-0" style={{ width: 28, height: 28, fontSize: 12 }}><IcoUser /></div>
                        )}
                        <div className={'msg-bubble ' + (isMine ? 'mine' : 'theirs')}>
                          {msg.text}
                          <div className={'flex items-center gap-1 mt-0.5' + (isMine ? ' justify-end' : '')}>
                            <span className={'text-[10px] ' + (isMine ? 'text-white/60' : 'text-muted-foreground')}>{formatTime(msg.createdAt)}</span>
                            {isMine && (
                              <span className={'text-[10px] ' + (msg.read ? 'text-blue-300' : 'text-white/50')}>
                                {msg.read ? <IcoCheckCheck /> : <IcoCheck />}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="msg-input-wrap">
                <textarea
                  className="msg-input"
                  placeholder={'Message ' + otherUser + '...'}
                  rows={1}
                  value={inputText}
                  onChange={function (e) { setInputText(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
                  onKeyDown={handleKeyDown}
                />
                <button className="send-btn" onClick={sendMessage} disabled={!inputText.trim() || loading}>
                  <IcoSend />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
