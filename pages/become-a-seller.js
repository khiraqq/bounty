import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

function IcoArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IcoShield() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IcoGlobe() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function IcoDollar() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

const HERO_STATS = [
  ['Safe sales', 'Protected by TradeShield'],
  ['Global reach', 'Millions of verified buyers'],
  ['24/7 support', 'Real people standing by'],
];

const BENEFITS = [
  { title: 'Fast & secure verification', desc: 'Verify quickly and safely so you can start selling with confidence.' },
  { title: 'List offers in minutes', desc: 'Create professional listings once you are verified.' },
  { title: 'Payment protection', desc: 'TradeShield guarantees no chargebacks or fraud.' },
  { title: 'Fast payouts', desc: 'Withdraw earnings through crypto, Payoneer, and more.' },
];

const TOOL_CARDS = [
  { title: 'Seller API', desc: 'Automate listings, pricing, and delivery with zero manual work.' },
  { title: 'Bulk uploads', desc: 'Import, edit, and publish hundreds of offers in seconds.' },
  { title: 'Delivery flexibility', desc: 'Deliver instantly or chat in real time with buyers.' },
  { title: 'Influencer growth', desc: 'Tap into Bounty’s partnered streamers and creators.' },
];

const PAGE_STYLES = `
  :root{--brand:#111111;--brand-hover:#2f2f2f}
  .hero-pattern{background-image:radial-gradient(circle at 10% 20%, rgba(255,255,255,.05) 2px, transparent 0), radial-gradient(circle at 80% 0%, rgba(255,255,255,.04) 1px, transparent 0), linear-gradient(135deg, rgba(17,17,17,.95), rgba(5,5,5,.95));background-size:200px 200px,200px 200px,cover}
  .hero-glow{box-shadow:0 25px 45px rgba(0,0,0,.35)}
  .hero-cta{display:inline-flex;align-items:center;gap:.4rem;padding:.9rem 1.8rem;border-radius:.75rem;background:linear-gradient(135deg,#111111,#2f2f2f);color:#fff;font-size:.95rem;font-weight:600;cursor:pointer;transition:transform .2s,box-shadow .2s}
  .hero-cta:active{transform:translateY(1px)}
  .hero-cta-arrow{display:inline-flex;align-items:center;justify-content:center;transition:transform .3s}
  .hero-cta-arrow.move{transform:translateX(6px)}
  .feature-card{text-align:center;padding:1.5rem;border-radius:.75rem;border:1px solid hsl(var(--border));background:hsl(var(--card));box-shadow:0 6px 20px rgba(0,0,0,.3)}
  .tool-card{display:flex;flex-direction:column;align-items:center;gap:.8rem;text-align:center;padding:1.2rem;border-radius:.75rem;border:1px solid hsl(var(--border));background:hsl(var(--card));transition:transform .2s,box-shadow .2s}
  .tool-card:hover{transform:translateY(-4px);box-shadow:0 10px 35px rgba(0,0,0,.25)}
  .grid-pattern{background:linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px),linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px);background-size:60px 60px}
`;

export default function BecomeASeller() {
  const [arrowMoving, setArrowMoving] = useState(false);

  function handleStartSelling() {
    setArrowMoving(true);
    setTimeout(() => {
      setArrowMoving(false);
      window.location.href = '/questions';
    }, 700);
  }

  return (
    <>
      <Head>
        <title>Become a Seller - Bounty</title>
        <style dangerouslySetInnerHTML={{ __html: PAGE_STYLES }} />
      </Head>

      <nav className="bg-nav border-b border-border/40">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3 gap-4">
          <Link href="/" className="font-bold text-xl text-nav-foreground" style={{ fontFamily: "'Doto',sans-serif" }}>
            Bounty
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">Become a Seller</span>
          <div className="ml-auto">
            <button
              id="theme-toggle"
              onClick={() => window.toggleTheme?.()}
              className="text-muted-foreground hover:text-foreground p-1.5 rounded-md hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              <span className="dark:hidden">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              </span>
              <span className="hidden dark:inline">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9" />
                  <path d="M20 3v4" />
                  <path d="M22 5h-4" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </nav>

      <main className="bg-background text-foreground">
        <section className="hero-pattern hero-glow px-4 py-16">
          <div className="mx-auto max-w-6xl grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Bounty seller program</p>
              <h1 className="text-4xl md:text-5xl font-black leading-tight">
                Start making money on <span className="text-foreground">Bounty</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Reach millions of verified gamers who buy gaming goods every day. List your offers, stay protected, and grow your
                earnings with a community built for modern traders.
              </p>
              <div className="flex flex-wrap gap-4 items-center">
                <button className="hero-cta" onClick={handleStartSelling}>
                  Start Selling
                  <span className={`hero-cta-arrow ${arrowMoving ? 'move' : ''}`}>
                    <IcoArrowRight />
                  </span>
                </button>
                <span className="text-sm text-muted-foreground">No paperwork. No monthly fees.</span>
              </div>
              <div className="flex flex-wrap gap-8 pt-6 border-t border-border">
                {HERO_STATS.map(([title, copy]) => (
                  <div key={title}>
                    <p className="text-sm text-muted-foreground">{copy}</p>
                    <p className="text-base font-semibold">{title}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl bg-gradient-to-br from-[#111111] via-[#0b0b0b] to-[#050505] p-10 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🚀</div>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">Launch your storefront and collect payments instantly.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid-pattern px-4 py-16">
          <div className="mx-auto max-w-6xl space-y-10">
            <div className="text-center space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Why Bounty?</p>
              <h2 className="text-3xl font-bold">Tools to power your next sale</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {BENEFITS.map((benefit) => (
                <div key={benefit.title} className="feature-card">
                  <div className="mb-4 text-3xl text-foreground">★</div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16">
          <div className="mx-auto max-w-6xl space-y-10">
            <div className="text-center space-y-2">
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Seller verification</p>
              <h2 className="text-3xl font-bold">Start Selling</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Answer a few questions and we will verify your identity so you can unlock full seller access.
              </p>
            </div>
            <div className="flex justify-center">
              <button className="hero-cta" onClick={handleStartSelling}>
                Start Selling
                <span className={`hero-cta-arrow ${arrowMoving ? 'move' : ''}`}>
                  <IcoArrowRight />
                </span>
              </button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {TOOL_CARDS.map((tool) => (
                <div key={tool.title} className="tool-card">
                  <div className="text-4xl">💠</div>
                  <p className="text-sm font-semibold">{tool.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tool.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
