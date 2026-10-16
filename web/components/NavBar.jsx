'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useApiMode } from './AgentStatus';
import { useAuth } from './AuthProvider';
import { Icon, classNames } from './ui';

import ThemeToggle from './ThemeToggle';

const LINKS = [
  { href: '/dashboard', label: 'Recover', shortLabel: 'Recover', icon: 'restore' },
  { href: '/history', label: 'History & Reports', shortLabel: 'History', icon: 'clock' },
  { href: '/manual', label: 'User Manual', shortLabel: 'Manual', icon: 'book' },
  { href: '/agent', label: 'Windows Setup & ZIP', shortLabel: 'Agent Setup', icon: 'download' },
];

export default function NavBar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const mode = useApiMode();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMenuOpen(false), [pathname]);
  const active = (href) => pathname && pathname.startsWith(href);
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur transition-colors duration-200 dark:border-slate-800/90 dark:bg-[#0b1120]/95 dark:shadow-md dark:shadow-black/20">
      <div className="mx-auto flex min-h-14 max-w-screen-2xl items-center gap-3 px-4 py-2 2xl:px-6">
        <Link href="/dashboard" className="flex shrink-0 items-center gap-2 whitespace-nowrap font-semibold text-slate-900 transition-colors dark:text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm shadow-brand-500/20"><Icon name="drive" /></span>
          <span className="hidden sm:inline font-bold">HDD File Recovery</span>
        </Link>
        <nav aria-label="Main navigation" className="hidden shrink-0 items-center gap-1 2xl:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href}
              aria-current={active(l.href) ? 'page' : undefined}
              aria-label={l.label}
              className={classNames('flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                active(l.href)
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 dark:border dark:border-brand-800/50'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white')}>
              <Icon name={l.icon} /> <span>{l.shortLabel}</span>
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-2 text-sm">
          {mode === 'mock' ? (
            <span className="whitespace-nowrap rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:border dark:border-amber-800/40">
              MOCK DATA
            </span>
          ) : (
            <span className="whitespace-nowrap rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border dark:border-emerald-800/40">
              {mode === 'agent' ? 'LIVE AGENT' : 'LIVE'}
            </span>
          )}
          <ThemeToggle />
          <div className="hidden shrink-0 items-center gap-2 2xl:flex">
          {user ? (
            <>
              <span className="max-w-36 truncate whitespace-nowrap text-slate-600 dark:text-slate-300 font-medium" title={user.full_name || user.email}>{user.full_name || user.email}</span>
              <span className="whitespace-nowrap rounded bg-slate-100 px-1.5 py-0.5 text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400 dark:border dark:border-slate-700">{user.role}</span>
              <button type="button" className="btn-ghost shrink-0 whitespace-nowrap px-2.5 py-1.5" onClick={logout}>Sign out</button>
            </>
          ) : (
            <Link href="/login" className="btn-primary px-3 py-1.5">Sign in</Link>
          )}
          </div>
          <button type="button" className="btn-secondary shrink-0 px-2.5 py-2 2xl:hidden" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((open) => !open)}>
            <Icon name={menuOpen ? 'x' : 'menu'} />
          </button>
        </div>
      </div>
      {menuOpen && <nav id="mobile-navigation" aria-label="Mobile navigation" className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 2xl:hidden">
        <div className="mx-auto flex max-w-7xl flex-col gap-1">
          {LINKS.map((l) => <Link key={l.href} href={l.href} aria-current={active(l.href) ? 'page' : undefined} className={classNames('flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium', active(l.href) ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800')}><Icon name={l.icon} />{l.label}</Link>)}
          <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-800">
            <span className="text-sm text-slate-600 dark:text-slate-300">{user ? `${user.full_name || user.email} · ${user.role}` : 'Guest'}</span>
            {user ? <button type="button" className="btn-ghost px-3 py-2" onClick={logout}>Sign out</button> : <Link href="/login" className="btn-primary px-3 py-2">Sign in</Link>}
          </div>
        </div>
      </nav>}
    </header>
  );
}
