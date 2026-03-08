
import Link from 'next/link';
import { useState } from 'react';
import { AUTH_FORM_BUTTON_CLASS } from './authStyles';

const ALL_GAMES = [
  'World of Warcraft',
  'OSRS',
  'Path of Exile',
  'Final Fantasy XIV',
  'Diablo IV',
  'Lost Ark',
  'Fortnite',
  'Valorant',
  'Rocket League',
  'FIFA',
  'NBA 2K',
  'Apex Legends',
  'Genshin Impact',
  'CS2',
  'League of Legends',
];

const NAV_DROPDOWNS = [
  { label: 'Items', games: ['CS2 Skins', 'League of Legends Items', 'Rocket League Items', 'Valorant Bundles'], allGames: ALL_GAMES },
  { label: 'Currency', games: ['OSRS Gold', 'WOW Gold', 'Diablo IV Gold', 'Genshin Primogems'], allGames: ALL_GAMES },
  { label: 'Accounts', games: ['Fortnite Accounts', 'Roblox Accounts', 'Valorant Accounts', 'WoW Accounts'], allGames: ALL_GAMES },
  { label: 'Top Ups', games: ['Roblox Robux', 'FIFA Points', 'NBA 2K VC', 'Apex Coins'], allGames: ALL_GAMES },
  { label: 'Boosting', games: ['Valorant Boosting', 'Rocket League Rank', 'Diablo Speedclear', 'WoW Raid Carry'], allGames: ALL_GAMES },
  { label: 'Gift Cards', games: ['Steam Cards', 'Amazon Cards', 'PlayStation Cards', 'Xbox Cards'], allGames: ALL_GAMES },
];

function NavDropdown({ label, games, allGames }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="nav-link flex items-center gap-1"
      >
        {label}
        <svg width="10" height="10" viewBox="0 0 8 8" className="text-muted-foreground">
          <path d="M0 2.5 4 6.5 8 2.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </button>

      <div
        className={`absolute left-0 top-full mt-2 rounded-3xl border border-border bg-card shadow-2xl p-6 text-sm text-muted-foreground transition-opacity ${open ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
        style={{ width: 540 }}
      >
        <div className="grid gap-6" style={{ gridTemplateColumns: 'minmax(0, 1fr) 280px' }}>
          <div className="grid grid-cols-2 gap-2">
            {games.map((game) => (
              <button
                key={game}
                type="button"
                onClick={() => {
                  window.location.href = '/browse?game=' + encodeURIComponent(game);
                }}
                className="text-left rounded-xl px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/50"
              >
                {game}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border border-border p-4 text-xs" style={{ backgroundColor: '#070707' }}>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-black/50 px-3 py-2 focus-within:border-amber-400 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                <circle cx="11" cy="11" r="7" />
                <line x1="17" y1="17" x2="22" y2="22" />
              </svg>
              <input
                type="search"
                placeholder="Search all games"
                className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
              {allGames.map((game) => (
                <button
                  key={game}
                  type="button"
                  onClick={() => { window.location.href = '/browse?game=' + encodeURIComponent(game); }}
                  className="w-full text-left rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                >
                  {game}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function Navbar() {
  const navButtonClass = `${AUTH_FORM_BUTTON_CLASS} w-auto px-4 py-1.5 text-xs font-semibold whitespace-nowrap`;
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

        <div className="hidden md:flex items-center gap-1.5">
          <Link href="/browse" className="nav-link">
            Browse
          </Link>
          {NAV_DROPDOWNS.map((dropdown) => (
            <NavDropdown key={dropdown.label} {...dropdown} />
          ))}
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
              id="theme-toggle"
              onClick={() => window.toggleTheme?.()}
              title="Toggle theme"
              className="px-2 py-1 rounded-md border border-border bg-transparent text-muted-foreground hover:text-foreground"
            />
            <Link
              href="https://discord.com/invite/jyrkFzG7Qs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all text-muted-foreground hover:text-foreground"
              style={{ background: 'transparent', borderColor: 'transparent' }}
            >
              <svg width="16" height="12" viewBox="0 0 71 55" fill="currentColor">
                <path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.3 37.3 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 4.9a.2.2 0 00-.1.1C1.5 18.7-.9 32.2.3 45.5v.1a58.7 58.7 0 0017.7 9 .2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.6 38.6 0 01-5.5-2.6.2.2 0 010-.4l1.1-.9a.2.2 0 01.2 0 41.9 41.9 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .3 36.3 36.3 0 01-5.5 2.7.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1A58.5 58.5 0 0070.3 45.6v-.1C71.7 30.1 67.8 16.7 60.2 5a.2.2 0 00-.1-.1zM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2zm23.7 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2z"/>
              </svg>
              Join Discord
            </Link>
            <Link href="/become-a-seller" className={navButtonClass}>
              Become a seller
            </Link>
            <button
              onClick={() => window.openModal?.('login')}
              className={navButtonClass}
              style={{ borderColor: 'transparent', background: 'transparent' }}
            >
              Log in
            </button>
            <button
              onClick={() => window.openModal?.('signup')}
              className={navButtonClass}
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}


