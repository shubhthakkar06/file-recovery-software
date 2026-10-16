import Link from 'next/link';

const GROUPS = [
  { title: 'Use the suite', links: [
    ['Recover files', '/dashboard'], ['History & reports', '/history'], ['User manual', '/manual'], ['Agent setup', '/agent'],
  ] },
  { title: 'Help & contact', links: [
    ['Help centre', '/help'], ['Contact & feedback', '/contact'], ['Site map', '/sitemap'],
  ] },
  { title: 'Website policies', links: [
    ['Privacy notice', '/policies#privacy'], ['Terms of use', '/policies#terms'], ['External links', '/policies#links'], ['Copyright', '/policies#copyright'],
  ] },
];

export default function SiteFooter() {
  return (
    <footer className="mt-12 bg-brand-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 font-bold text-white hover:text-indigo-100">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M4 6h16v8H4zM4 14l2 4h12l2-4M7 10h.01" />
                </svg>
              </span>
              HDD File Recovery
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-indigo-100">A local-first recovery control panel for Windows drives.</p>
            <p className="mt-3 text-xs text-indigo-200">Read-only source access. Restore recovered files to a different physical drive.</p>
          </div>
          {GROUPS.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="text-sm font-bold text-white">{group.title}</h2>
              <ul className="mt-3 space-y-2">
                {group.links.map(([label, href]) => <li key={href}><Link className="text-sm text-indigo-100 underline-offset-4 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" href={href}>{label}</Link></li>)}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-9 flex flex-col gap-2 border-t border-white/20 pt-5 text-xs text-indigo-100 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 HDD File Recovery Suite. Project materials by the listed contributors.</span>
          <span>Last updated on: 16 October 2026</span>
        </div>
      </div>
    </footer>
  );
}
