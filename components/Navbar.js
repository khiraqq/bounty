import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-nav border-b border-border sticky top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 py-2.5">
        <Link
          href="/"
          className="shrink-0 font-black text-2xl text-foreground mr-6"
          style={{ fontFamily: "'Doto', sans-serif", letterSpacing: '-0.02em' }}
        >
          Bounty
        </Link>

        <div className="hidden md:flex items-center">
          <Link href="/browse" className="nav-link">
            Browse
          </Link>
          <Link href="/browse?category=Currency" className="nav-link">
            Currency
          </Link>
          <Link href="/browse?category=Accounts" className="nav-link">
            Accounts
          </Link>
          <Link href="/browse?category=Items" className="nav-link">
            Items
          </Link>
          <Link href="/browse?category=Boosting" className="nav-link">
            Boosting
          </Link>
          <Link href="/browse?category=Top+Ups" className="nav-link">
            Top Ups
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden lg:flex items-center rounded-lg border border-border bg-secondary px-3 py-1.5 gap-2 w-48 focus-within:border-foreground/30 transition-colors">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground shrink-0"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search listings…"
              className="bg-transparent outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  window.location.href = '/browse?q=' + encodeURIComponent(e.currentTarget.value);
                }
              }}
            />
          </div>
          <div id="auth-buttons" className="flex items-center gap-2">
            <button
              onClick={() => window.openModal?.('login')}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => window.openModal?.('signup')}
              className="px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-foreground text-background hover:opacity-80 transition-opacity"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
