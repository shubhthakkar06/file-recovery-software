import Link from 'next/link';

export const metadata = { title: 'Site map - HDD File Recovery Suite' };

const sections = [
  { title: 'Get started', pages: [['Recovery workspace', '/dashboard'], ['Agent setup and download', '/agent'], ['User manual and safety guide', '/manual']] },
  { title: 'Manage recovery sessions', pages: [['Scan results and recovery', '/dashboard'], ['History and PDF reports', '/history']] },
  { title: 'Help and contact', pages: [['Help centre and accessibility', '/help'], ['Contact and feedback', '/contact']] },
  { title: 'Website policies', pages: [['Privacy notice', '/policies#privacy'], ['Terms of use', '/policies#terms'], ['External link policy', '/policies#links'], ['Copyright information', '/policies#copyright']] },
];

export default function SitemapPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header><p className="text-sm font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">Navigate</p><h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">Site map</h1><p className="mt-2 text-slate-600 dark:text-slate-300">Pages are grouped by the tasks they support.</p></header>
      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => <section key={section.title} className="card p-5"><h2 className="text-lg font-bold text-slate-900 dark:text-white">{section.title}</h2><ul className="mt-3 space-y-2 border-l-2 border-brand-200 pl-4 dark:border-brand-800">{section.pages.map(([label, href]) => <li key={`${label}-${href}`}><Link className="text-sm font-medium text-brand-700 underline-offset-4 hover:underline dark:text-brand-300" href={href}>{label}</Link></li>)}</ul></section>)}
      </div>
    </div>
  );
}
