import Head from 'next/head';
import Link from 'next/link';

function NavBar() {
  return (
    <nav className="bg-nav border-b border-border">
      <div className="mx-auto flex max-w-7xl items-center px-4 py-2">
        <Link href="/" className="flex shrink-0 items-center text-nav-foreground font-bold text-2xl" style={{ fontFamily: "'Doto',sans-serif" }}>
          Bounty
        </Link>
        <div className="ml-auto hidden md:flex items-center gap-6">
          <Link href="/browse?category=Currency" className="text-sm font-medium text-nav-foreground/80 hover:text-nav-foreground transition-colors">
            Currency
          </Link>
          <Link href="/browse?category=Accounts" className="text-sm font-medium text-nav-foreground/80 hover:text-nav-foreground transition-colors">
            Accounts
          </Link>
          <Link href="/browse?category=Top Ups" className="text-sm font-medium text-nav-foreground/80 hover:text-nav-foreground transition-colors">
            Top Ups
          </Link>
          <Link href="/browse?category=Items" className="text-sm font-medium text-nav-foreground/80 hover:text-nav-foreground transition-colors">
            Items
          </Link>
          <Link href="/browse?category=Boosting" className="text-sm font-medium text-nav-foreground/80 hover:text-nav-foreground transition-colors">
            Boosting
          </Link>
          <Link href="/browse?category=Gift Cards" className="text-sm font-medium text-nav-foreground/80 hover:text-nav-foreground transition-colors">
            Gift Cards
          </Link>
          <Link
            href="/become-a-seller"
            className="text-sm font-semibold px-3 py-1.5 rounded-md border border-nav-foreground/20 bg-nav text-nav-foreground hover:text-nav-foreground transition-colors"
          >
            Sell on Bounty
          </Link>
        </div>
        <div className="ml-6 hidden md:flex items-center gap-3">
          <div className="flex items-center rounded-md bg-nav-foreground/10 px-3 py-1.5 text-sm text-nav-foreground/60 gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <span>Search Bounty</span>
          </div>
          <button
            id="login-button"
            onClick={() => window.openModal?.('login')}
            className="rounded-md border border-nav-foreground/20 bg-transparent px-4 py-1.5 text-sm font-medium text-nav-foreground/60 hover:text-nav-foreground hover:border-nav-foreground/40 transition"
          >
            Log in
          </button>
          <button id="theme-toggle" onClick={() => window.toggleTheme?.()} aria-label="Toggle theme" className="nav-icon-btn">
            <svg className="h-4 w-4 dark:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
            <svg className="h-4 w-4 hidden dark:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9" />
              <path d="M20 3v4" />
              <path d="M22 5h-4" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default function Home() {
  return (
    <>
      <Head>
        <title>Bounty — Gaming Marketplace</title>
      </Head>
      <NavBar />
      <main className="min-h-screen bg-black" />
    </>
  );
}
