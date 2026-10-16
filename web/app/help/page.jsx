import Link from 'next/link';
import { Icon } from '@/components/ui';

export const metadata = { title: 'Help centre - HDD File Recovery Suite' };

const faqs = [
  ['How do I begin?', <>Read the <Link className="font-semibold underline" href="/manual">user manual</Link>, install and start the Windows Recovery Agent, then check its connection on <Link className="font-semibold underline" href="/agent">Agent Setup</Link>.</>],
  ['Why does the site say MOCK DATA?', <>The browser has not switched to a live agent session. Check the agent service and connection on the <Link className="font-semibold underline" href="/agent">setup page</Link>. Demo drives and scan results are simulated; no physical disk is scanned in mock mode.</>],
  ['Which scan should I choose?', <>Quick Scan is intended for recently deleted files and reads file-system metadata. Deep Scan searches sectors for file signatures and may take much longer, especially on large drives.</>],
  ['Where should I restore files?', <>Choose a different physical drive from the one being scanned. Writing recovered files to the source can overwrite other data that may still be recoverable.</>],
  ['Can I use the app with a failing drive?', <>Stop using the drive. If it is making unusual noises or disconnecting, consider a professional recovery service before scanning; further use may worsen damage.</>],
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header><p className="text-sm font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">Support</p><h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">Help centre</h1><p className="mt-2 text-slate-600 dark:text-slate-300">Quick answers for setup, scan choices, and safe recovery.</p></header>
      <section className="card p-5 sm:p-6"><h2 className="text-xl font-bold text-slate-900 dark:text-white">Frequently asked questions</h2><div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">{faqs.map(([question, answer]) => <details key={question} className="group py-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900 marker:hidden dark:text-white"><span>{question}</span><Icon name="x" className="h-4 w-4 rotate-45 text-brand-600 transition-transform group-open:rotate-0 dark:text-brand-300" /></summary><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700 dark:text-slate-300">{answer}</p></details>)}</div></section>
      <section id="accessibility" className="card p-5 sm:p-6"><h2 className="text-xl font-bold text-slate-900 dark:text-white">Accessibility help</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700 dark:text-slate-300"><li>Use Tab and Shift+Tab to move between controls, and Enter or Space to activate them.</li><li>Use your browser zoom and operating-system contrast settings to adjust the display.</li><li>Use the theme control in the top navigation to switch between light and dark themes.</li><li>Buttons and links have visible keyboard focus. If an action is unclear, use its text label or the User Manual.</li></ul></section>
      <section className="rounded-xl border border-brand-200 bg-brand-50 p-5 dark:border-brand-800 dark:bg-brand-950/40"><h2 className="font-bold text-slate-900 dark:text-white">Need more help?</h2><p className="mt-1 text-sm text-slate-700 dark:text-slate-300">See the full setup instructions or prepare a feedback note for your course/project channel.</p><div className="mt-4 flex flex-wrap gap-3"><Link href="/manual" className="btn-primary">Open user manual</Link><Link href="/contact" className="btn-secondary">Contact &amp; feedback</Link></div></section>
    </div>
  );
}
