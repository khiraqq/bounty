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

function MascotIllustration() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className="relative select-none"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
      >
        <svg width="320" height="300" viewBox="0 0 320 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="160" cy="285" rx="80" ry="12" fill="black" fillOpacity="0.25" />
          <ellipse cx="160" cy="185" rx="72" ry="78" fill="#E8A020" />
          <ellipse cx="160" cy="195" rx="44" ry="52" fill="#F5C842" />
          <path d="M88 160 C50 130 30 90 60 80 C75 75 90 95 95 120Z" fill="#F0F0E8" stroke="#D4D0C4" strokeWidth="1.5" />
          <path d="M232 160 C270 130 290 90 260 80 C245 75 230 95 225 120Z" fill="#F0F0E8" stroke="#D4D0C4" strokeWidth="1.5" />
          <path d="M128 68 L138 44 L150 60 L160 38 L170 60 L182 44 L192 68Z" fill="#A855F7" />
          <circle cx="138" cy="44" r="4" fill="#C084FC" />
          <circle cx="160" cy="38" r="4" fill="#C084FC" />
          <circle cx="182" cy="44" r="4" fill="#C084FC" />
          <rect x="128" y="65" width="64" height="12" rx="4" fill="#9333EA" />
          <ellipse cx="160" cy="110" rx="52" ry="48" fill="#E8A020" />
          <ellipse cx="143" cy="100" rx="12" ry="14" fill="white" />
          <ellipse cx="177" cy="100" rx="12" ry="14" fill="white" />
          <circle cx="147" cy="103" r="7" fill="#1a1a1a" />
          <circle cx="181" cy="103" r="7" fill="#1a1a1a" />
          <circle cx="149" cy="100" r="2.5" fill="white" />
          <circle cx="183" cy="100" r="2.5" fill="white" />
          <path d="M140 65 C130 45 118 40 122 55Z" fill="#C87010" />
          <path d="M180 65 C190 45 202 40 198 55Z" fill="#C87010" />
          <ellipse cx="160" cy="126" rx="22" ry="14" fill="#C87010" />
          <ellipse cx="154" cy="122" rx="5" ry="4" fill="#A06010" />
          <ellipse cx="166" cy="122" rx="5" ry="4" fill="#A06010" />
          <path d="M147 132 Q160 142 173 132" stroke="#8B5010" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <rect x="155" y="132" width="5" height="8" rx="2" fill="white" />
          <rect x="163" y="132" width="5" height="8" rx="2" fill="white" />
          <path d="M90 185 Q70 195 78 215 Q88 235 108 225" stroke="#C87010" strokeWidth="20" strokeLinecap="round" fill="none" />
          <path d="M230 185 Q250 195 242 215 Q232 235 212 225" stroke="#C87010" strokeWidth="20" strokeLinecap="round" fill="none" />
          <rect x="100" y="210" width="120" height="80" rx="16" fill="#7C3AED" />
          <rect x="115" y="195" width="90" height="30" rx="10" fill="#6D28D9" />
          <circle cx="160" cy="250" r="12" fill="#A78BFA" />
          <text x="155" y="255" fontSize="14" fill="white" fontWeight="bold">$</text>
          <rect x="120" y="188" width="35" height="22" rx="4" fill="#4ADE80" transform="rotate(-15 130 195)" />
          <rect x="155" y="185" width="35" height="22" rx="4" fill="#86EFAC" transform="rotate(5 165 192)" />
          <rect x="182" y="190" width="32" height="20" rx="4" fill="#4ADE80" transform="rotate(18 190 198)" />
          <ellipse cx="135" cy="268" rx="22" ry="18" fill="#C87010" />
          <ellipse cx="185" cy="268" rx="22" ry="18" fill="#C87010" />
          <ellipse cx="130" cy="278" rx="16" ry="10" fill="#A06010" />
          <ellipse cx="190" cy="278" rx="16" ry="10" fill="#A06010" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

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
              className={`${AUTH_FORM_BUTTON_CLASS} disabled:opacity-70`}
              style={{ minWidth: 160 }}
            >
              <span>{clicking ? 'Loading…' : 'Start Selling'}</span>
              {clicking ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.6, ease: 'linear' }}
                  className="inline-block text-lg"
                >↻</motion.span>
              ) : (
                <motion.span
                  className="inline-block text-xl font-black"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                >›</motion.span>
              )}
            </button>
          </motion.div>
        </div>

        <div className="hidden md:block flex-shrink-0">
          <MascotIllustration />
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
