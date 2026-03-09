// FILE: components/seller/SellerHero.js
// Clean hero — mascot removed, pure framer-motion, no DOM manipulation

import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

const STATS = [
  { label: 'Safe sales', sub: 'Protected by TradeShield' },
  { label: 'Global reach', sub: 'Millions of verified buyers' },
  { label: 'Trusted platform', sub: 'Thousands of active sellers' },
];

export default function SellerHero() {
  const router = useRouter();
  const [clicking, setClicking] = useState(false);

  async function handleClick() {
    setClicking(true);
    await new Promise(r => setTimeout(r, 500));
    router.push('/seller/onboarding');
  }

  return (
    <section
      className="relative min-h-[480px] flex flex-col overflow-hidden"
      style={{ background: 'hsl(var(--background))' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.04,
          backgroundImage: [
            'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px)',
            'linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl w-full px-6 pt-20 pb-12 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <h1
            className="text-5xl md:text-6xl font-black leading-[1.05] tracking-tight mb-5"
            style={{ fontFamily: "'Doto', sans-serif", color: 'hsl(var(--foreground))' }}
          >
            Start making<br />money on<br />Bounty
          </h1>

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
              className="inline-flex items-center justify-center gap-2.5 rounded-xl font-bold text-base transition-all duration-200"
              style={{
                padding: '0.875rem 1.75rem',
                background: 'hsl(var(--foreground))',
                color: 'hsl(var(--background))',
                minWidth: 160,
                opacity: clicking ? 0.7 : 1,
                cursor: clicking ? 'not-allowed' : 'pointer',
              }}
            >
              <span>{clicking ? 'Loading...' : 'Start Selling'}</span>
              {clicking ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.6, ease: 'linear' }}
                  className="inline-block"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                  </svg>
                </motion.span>
              ) : (
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                  className="inline-block"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </motion.span>
              )}
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap gap-3 mt-12"
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.07 }}
              className="flex flex-col px-5 py-3 rounded-2xl border"
              style={{
                minWidth: 170,
                background: 'hsl(var(--secondary))',
                borderColor: 'hsl(var(--border))',
              }}
            >
              <span className="text-sm font-bold" style={{ color: 'hsl(var(--foreground))' }}>{s.label}</span>
              <span className="text-xs mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{s.sub}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
