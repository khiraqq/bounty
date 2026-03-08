// FILE: components/seller/SellerHero.js
// Place at: components/seller/SellerHero.js

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AUTH_FORM_BUTTON_CLASS } from '../authStyles';

const STATS = [
  { label: 'Safe sales', sub: 'Protected by TradeShield' },
  { label: 'Global reach', sub: 'Millions of verified buyers' },
  { label: 'Trusted platform', sub: 'Thousands of active sellers' },
];

export default function SellerHero() {
  const [clicking, setClicking] = useState(false);

  const handleClick = () => {
    if (clicking) return;
    setClicking(true);
    window.handleStartSelling?.();
    setTimeout(() => setClicking(false), 800);
  };

  return (
    <section className="relative min-h-[520px] flex flex-col overflow-hidden" style={{ background: 'hsl(var(--background))' }}>
      {/* Grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.04,
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl w-full px-6 pt-16 pb-0 flex items-center justify-between gap-8">
        <div className="flex-1 max-w-xl">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-6xl font-black leading-[1.05] tracking-tight mb-5"
            style={{ fontFamily: "'Doto', sans-serif", color: 'hsl(var(--foreground))' }}
          >
            Start making<br />money on<br />Bounty
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg leading-relaxed mb-8 max-w-md"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            Reach millions of verified gamers who buy gaming goods daily from sellers like you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
          >
            <button
              onClick={handleClick}
              disabled={clicking}
              className={`${AUTH_FORM_BUTTON_CLASS} disabled:opacity-70 flex items-center justify-between gap-2`}
              style={{ minWidth: 160 }}
            >
              <span>{clicking ? 'Loading…' : 'Start Selling'}</span>
              {clicking ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="inline-block text-lg"
                >
                  ⟳
                </motion.span>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 12h12" />
                  <path d="M14 6l6 6-6 6" />
                </svg>
              )}
            </button>
          </motion.div>
        </div>

      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative z-10 mx-auto max-w-7xl w-full px-6 mt-10 pb-12"
      >
        <div className="flex flex-wrap gap-3">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.07 }}
              className="flex flex-col px-5 py-3 rounded-2xl border"
              style={{ minWidth: 170, background: 'hsl(var(--secondary))', borderColor: 'hsl(var(--border))' }}
            >
              <span className="text-sm font-bold" style={{ color: 'hsl(var(--foreground))' }}>{s.label}</span>
              <span className="text-xs mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{s.sub}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}


