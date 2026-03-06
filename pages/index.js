import Head from 'next/head';
import Link from 'next/link';

const HIGHLIGHTS = [
  {
    title: 'Browse trusted sellers',
    desc: 'Find verified gamers offering currency, accounts, boosts, and more.',
    href: '/browse',
  },
  {
    title: 'Start selling',
    desc: 'Apply to become a seller and tap into a global gaming audience.',
    href: '/become-a-seller',
  },
  {
    title: 'Stay secure',
    desc: 'Escrow protection and analytics keep every trade transparent.',
    href: '/orders',
  },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>Bounty — Gaming Marketplace</title>
        <meta name="description" content="Buy and sell digital goods with verified gamers worldwide." />
      </Head>
      <main className="min-h-screen bg-background text-foreground">
        <section className="mx-auto max-w-4xl px-6 py-24 text-center space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Welcome to</p>
          <h1 className="text-4xl md:text-5xl font-black leading-tight">
            The gaming marketplace built for sellers and buyers who value trust.
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover live sellers, submit orders instantly, and manage every trade with escrow protection and performance data.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/browse" className="btn-primary px-6 py-3">
              Browse listings
            </Link>
            <Link href="/become-a-seller" className="btn-secondary px-6 py-3">
              Become a seller
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="grid gap-6 md:grid-cols-3">
            {HIGHLIGHTS.map((item) => (
              <article key={item.title} className="rounded-2xl border border-border bg-card p-6 text-left">
                <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{item.desc}</p>
                <Link href={item.href} className="text-sm font-semibold text-foreground/70 hover:text-foreground transition-colors">
                  Learn more →
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
