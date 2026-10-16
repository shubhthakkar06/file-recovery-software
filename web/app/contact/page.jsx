import FeedbackDraft from '@/components/FeedbackDraft';

export const metadata = { title: 'Contact and feedback - HDD File Recovery Suite' };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header><p className="text-sm font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">Connect</p><h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">Contact &amp; feedback</h1><p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-300">This is a student project. The site does not currently publish a support email or send feedback automatically.</p></header>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
        <FeedbackDraft />
        <aside className="card h-fit p-5"><h2 className="text-xl font-bold text-slate-900 dark:text-white">Project information</h2><dl className="mt-4 space-y-4 text-sm"><div><dt className="font-medium text-slate-500 dark:text-slate-400">Project guide</dt><dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">Prof. Jaidhar C D</dd></div><div><dt className="font-medium text-slate-500 dark:text-slate-400">Project team</dt><dd className="mt-0.5 text-slate-800 dark:text-slate-200">Pranav V Pogal (241IT055)<br />Nikhil Soni (241IT048)<br />Shubh Thakkar (241IT076)</dd></div></dl><p className="mt-5 border-t border-slate-200 pt-4 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:text-slate-300">Use your institution’s official course or project channel to send questions. Direct email addresses are not listed here.</p></aside>
      </div>
    </div>
  );
}
