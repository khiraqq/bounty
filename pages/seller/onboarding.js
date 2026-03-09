// FILE: pages/seller/onboarding.js
// Submits a SellerApplication document (gatekeeper flow).
// No emojis. Pure React.

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

// ── Shared styles ──────────────────────────────────────────────────────────────
const DOTO = { fontFamily: "'Doto', sans-serif" };

const CARD_BASE = {
  background:  'hsl(var(--card))',
  borderColor: 'hsl(var(--border))',
  color:       'hsl(var(--foreground))',
};

const INPUT_CLASS =
  'w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all bg-transparent';

const INPUT_STYLE = {
  borderColor: 'hsl(var(--border))',
  color:       'hsl(var(--foreground))',
  background:  'hsl(var(--background))',
};

const MUTED = { color: 'hsl(var(--muted-foreground))' };
const FG    = { color: 'hsl(var(--foreground))' };

// ── Slide animation variants ───────────────────────────────────────────────────
const variants = {
  enter:  (dir) => ({ opacity: 0, x: dir > 0 ?  48 : -48 }),
  center: { opacity: 1, x: 0 },
  exit:   (dir) => ({ opacity: 0, x: dir > 0 ? -48 :  48 }),
};

// ── Back / Continue buttons shared ────────────────────────────────────────────
function NavButtons({ onBack, onNext, nextLabel = 'Continue', disabled = false, loading = false }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <button
        onClick={onBack}
        className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-colors"
        style={{ borderColor: 'hsl(var(--border))', ...MUTED, background: 'transparent' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'hsl(var(--secondary))'; e.currentTarget.style.color = 'hsl(var(--foreground))'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'hsl(var(--muted-foreground))'; }}
      >
        Back
      </button>
      <button
        onClick={onNext}
        disabled={disabled || loading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity disabled:opacity-40 hover:opacity-80"
        style={{ background: 'hsl(var(--foreground))', color: 'hsl(var(--background))' }}
      >
        {loading ? 'Submitting...' : nextLabel}
        {!loading && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        )}
      </button>
    </div>
  );
}

// ── Step 1: Intro / Before You Start ─────────────────────────────────────────
const EXPECTATIONS = [
  {
    title: 'Professional conduct',
    desc:  'Be clear, polite and honest in listings and chats.',
    icon:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  },
  {
    title: 'Reliable delivery',
    desc:  'Deliver on time. Mark the order complete only after successful delivery.',
    icon:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  },
  {
    title: 'Platform integrity',
    desc:  'Keep all communication and payments on Bounty for safety.',
    icon:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>,
  },
];

const REMINDERS = [
  {
    title: 'Refunds',
    desc:  'Buyers can get refunds for false, incomplete or late deliveries.',
    icon:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>,
  },
  {
    title: 'Account suspension',
    desc:  'Repeated or serious violations can lead to temporary or permanent suspension.',
    icon:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>,
  },
  {
    title: 'Payout holds',
    desc:  'Funds may be held during confirmed fraud or security investigations.',
    icon:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>,
  },
];

function InfoRow({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-3 rounded-xl px-4 py-3 border" style={{ background: 'hsl(var(--secondary))', borderColor: 'hsl(var(--border))' }}>
      <div className="mt-0.5 shrink-0" style={MUTED}>{icon}</div>
      <div>
        <p className="text-sm font-semibold" style={FG}>{title}</p>
        <p className="text-xs mt-0.5 leading-relaxed" style={MUTED}>{desc}</p>
      </div>
    </div>
  );
}

function StepIntro({ onNext, onBack }) {
  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-black mb-2" style={{ ...DOTO, ...FG }}>Before you start selling</h2>
      <p className="text-sm mb-6 leading-relaxed" style={MUTED}>
        Here's what we expect from every seller and what to know before starting verification.
      </p>
      <p className="text-sm font-bold mb-3" style={FG}>What we expect from sellers</p>
      <div className="space-y-2 mb-5">
        {EXPECTATIONS.map(r => <InfoRow key={r.title} {...r} />)}
      </div>
      <p className="text-sm font-bold mb-3" style={FG}>What to keep in mind</p>
      <div className="space-y-2 mb-8">
        {REMINDERS.map(r => <InfoRow key={r.title} {...r} />)}
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Continue to verification" />
    </div>
  );
}

// ── Step 2: Categories ────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'currency',  label: 'Currency' },
  { id: 'accounts',  label: 'Accounts' },
  { id: 'items',     label: 'Items' },
  { id: 'topups',    label: 'Top Ups' },
  { id: 'boosting',  label: 'Boosting' },
  { id: 'giftcards', label: 'Giftcards' },
];

function StepCategories({ data, setData, onNext, onBack }) {
  const toggle = (id) => {
    const current = data.categories || [];
    setData(d => ({
      ...d,
      categories: current.includes(id) ? current.filter(c => c !== id) : [...current, id],
    }));
  };
  const selected = data.categories || [];

  return (
    <div className="w-full max-w-md mx-auto">
      <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={MUTED}>Step 1 of 3</p>
      <h2 className="text-2xl font-black mb-2" style={{ ...DOTO, ...FG }}>What will you sell?</h2>
      <p className="text-sm mb-6" style={MUTED}>Select the categories you'll be selling in.</p>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {CATEGORIES.map(cat => {
          const active = selected.includes(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => toggle(cat.id)}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border py-5 text-sm font-semibold transition-all duration-150"
              style={{
                background:   active ? 'hsl(var(--foreground))' : 'hsl(var(--secondary))',
                borderColor:  active ? 'hsl(var(--foreground))' : 'hsl(var(--border))',
                color:        active ? 'hsl(var(--background))' : 'hsl(var(--foreground))',
                transform:    active ? 'scale(1.03)' : 'scale(1)',
              }}
            >
              <div
                className="w-8 h-8 rounded-lg"
                style={{ background: active ? 'hsl(var(--background)/0.15)' : 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
              />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      <NavButtons onBack={onBack} onNext={onNext} disabled={selected.length === 0} />
    </div>
  );
}

// ── Step 3: Experience ────────────────────────────────────────────────────────
function StepExperience({ data, setData, onNext, onBack }) {
  const select = (val) => setData(d => ({ ...d, experience: val }));

  const options = [
    { id: 'new',         label: 'New Seller',         desc: "I'm just starting out and want to build my reputation on Bounty." },
    { id: 'experienced', label: 'Experienced Seller',  desc: 'I have sold on other platforms and want to bring my business to Bounty.' },
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={MUTED}>Step 2 of 3</p>
      <h2 className="text-2xl font-black mb-2" style={{ ...DOTO, ...FG }}>Your experience</h2>
      <p className="text-sm mb-6" style={MUTED}>Tell us about your selling background.</p>

      <div className="space-y-3 mb-8">
        {options.map(opt => {
          const active = data.experience === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => select(opt.id)}
              className="w-full flex items-start gap-4 rounded-xl border px-5 py-4 text-left transition-all duration-150"
              style={{
                background:  active ? 'hsl(var(--foreground))' : 'hsl(var(--secondary))',
                borderColor: active ? 'hsl(var(--foreground))' : 'hsl(var(--border))',
              }}
            >
              <div className="flex-1">
                <p className="font-bold text-sm" style={{ color: active ? 'hsl(var(--background))' : 'hsl(var(--foreground))' }}>{opt.label}</p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: active ? 'hsl(var(--background)/0.7)' : 'hsl(var(--muted-foreground))' }}>{opt.desc}</p>
              </div>
              <div
                className="ml-auto mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: active ? 'hsl(var(--background))' : 'hsl(var(--border))', background: active ? 'hsl(var(--background))' : 'transparent' }}
              >
                {active && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--foreground))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <NavButtons onBack={onBack} onNext={onNext} disabled={!data.experience} />
    </div>
  );
}

// ── Step 4: Details + submit to API ──────────────────────────────────────────
function StepDetails({ data, setData, onSubmit, onBack, submitting, submitError }) {
  const set    = (k, v) => setData(d => ({ ...d, [k]: v }));
  const isExp  = data.experience === 'experienced';
  const canSubmit = !!data.discord && !!data.deliverySpeed;

  return (
    <div className="w-full max-w-md mx-auto">
      <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={MUTED}>Step 3 of 3</p>
      <h2 className="text-2xl font-black mb-2" style={{ ...DOTO, ...FG }}>
        {isExp ? 'Tell us more' : 'Almost there'}
      </h2>
      <p className="text-sm mb-6" style={MUTED}>
        {isExp
          ? 'Share your background so buyers can trust you faster.'
          : 'A few final details to complete your application.'}
      </p>

      <div className="space-y-4 mb-8">
        {isExp && (
          <>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={FG}>Previous Platforms</label>
              <input type="text" placeholder="e.g. Eldorado, G2G, PlayerAuctions..." value={data.platforms || ''} onChange={e => set('platforms', e.target.value)} className={INPUT_CLASS} style={INPUT_STYLE} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={FG}>Proof of Reputation / Shop Links</label>
              <textarea rows={3} placeholder="Paste links to your shop or feedback page..." value={data.reputation || ''} onChange={e => set('reputation', e.target.value)} className={INPUT_CLASS} style={{ ...INPUT_STYLE, resize: 'none' }} />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-semibold mb-1.5" style={FG}>How do you source your goods?</label>
          <textarea rows={2} placeholder="e.g. I farm gold manually, buy in bulk and resell..." value={data.sourcing || ''} onChange={e => set('sourcing', e.target.value)} className={INPUT_CLASS} style={{ ...INPUT_STYLE, resize: 'none' }} />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5" style={FG}>Delivery Speed</label>
          <select value={data.deliverySpeed || ''} onChange={e => set('deliverySpeed', e.target.value)} className={INPUT_CLASS} style={INPUT_STYLE}>
            <option value="" disabled>Select typical delivery time...</option>
            <option value="instant">Instant (automated)</option>
            <option value="under1h">Under 1 hour</option>
            <option value="under6h">Under 6 hours</option>
            <option value="under24h">Within 24 hours</option>
            <option value="custom">Custom / varies</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5" style={FG}>Discord Username</label>
          <input type="text" placeholder="yourname or yourname#0000" value={data.discord || ''} onChange={e => set('discord', e.target.value)} className={INPUT_CLASS} style={INPUT_STYLE} />
          <p className="text-xs mt-1" style={MUTED}>Used for verification and support</p>
        </div>
      </div>

      {submitError && (
        <p className="text-sm mb-4 rounded-xl px-4 py-2.5" style={{ background: '#ef444422', color: '#ef4444' }}>{submitError}</p>
      )}

      <NavButtons onBack={onBack} onNext={onSubmit} nextLabel="Submit Application" disabled={!canSubmit} loading={submitting} />
    </div>
  );
}

// ── Step 5: Done ──────────────────────────────────────────────────────────────
function StepDone() {
  const router = useRouter();
  return (
    <div className="w-full max-w-md mx-auto text-center py-6">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
        style={{ background: '#22c55e22', border: '1px solid #22c55e44' }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </motion.div>

      <h2 className="text-3xl font-black mb-3" style={{ ...DOTO, ...FG }}>Application Submitted</h2>
      <p className="text-sm leading-relaxed mb-2" style={MUTED}>
        Your seller application has been received and is now pending review.
      </p>
      <p className="text-sm leading-relaxed mb-8" style={MUTED}>
        We'll review it within 24–48 hours and contact you via Discord. You'll be notified once your application is approved.
      </p>
      <button
        onClick={() => router.push('/dashboard')}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-80"
        style={{ background: 'hsl(var(--foreground))', color: 'hsl(var(--background))' }}
      >
        Go to Dashboard
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
      </button>
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ step }) {
  const total = 4;
  const pct   = Math.min((step / total) * 100, 100);
  if (step > 4) return null;
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between text-xs mb-2" style={MUTED}>
        <span>Seller Application</span>
        <span>Step {step} of {total}</span>
      </div>
      <div className="w-full h-1.5 rounded-full" style={{ background: 'hsl(var(--border))' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'hsl(var(--foreground))' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SellerOnboarding() {
  const router   = useRouter();
  const [step, setStep]   = useState(1);
  const [dir,  setDir]    = useState(1);
  const [formData, setFormData] = useState({
    categories:    [],
    experience:    '',
    platforms:     '',
    reputation:    '',
    sourcing:      '',
    deliverySpeed: '',
    discord:       '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const go   = (target) => { setDir(target > step ? 1 : -1); setStep(target); };
  const next = () => go(step + 1);
  const back = () => { if (step === 1) router.push('/become-a-seller'); else go(step - 1); };

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError('');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('bounty_token') : '';
      if (!token) { setSubmitError('You must be logged in to apply.'); return; }

      const res = await fetch('/api/seller/apply', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) { setSubmitError(data.message || 'Submission failed.'); return; }

      go(5); // advance to done screen
    } catch {
      setSubmitError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head>
        <title>Seller Application — Bounty</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'hsl(var(--background))' }}>
        {/* Background texture */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            opacity: 0.025,
            backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize:  '32px 32px',
          }}
        />

        <div
          className="relative z-10 w-full max-w-lg rounded-2xl border shadow-2xl p-8 overflow-hidden"
          style={CARD_BASE}
        >
          <ProgressBar step={step} />

          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === 1 && <StepIntro       onNext={next}        onBack={back} />}
              {step === 2 && <StepCategories  data={formData} setData={setFormData} onNext={next}        onBack={back} />}
              {step === 3 && <StepExperience  data={formData} setData={setFormData} onNext={next}        onBack={back} />}
              {step === 4 && (
                <StepDetails
                  data={formData}
                  setData={setFormData}
                  onSubmit={handleSubmit}
                  onBack={back}
                  submitting={submitting}
                  submitError={submitError}
                />
              )}
              {step === 5 && <StepDone />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}