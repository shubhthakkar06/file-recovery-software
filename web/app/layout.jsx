import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import ProjectCreditHeader from '@/components/ProjectCreditHeader';
import NavBar from '@/components/NavBar';
import { AgentBanner, ApiModeBoundary } from '@/components/AgentStatus';
import SiteFooter from '@/components/SiteFooter';

export const metadata = {
  title: 'HDD File Recovery Suite',
  description: 'Recover deleted files from Windows NTFS/FAT32 hard disk drives - Quick MFT scan and Deep sector carving.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-slate-100 text-slate-800 antialiased transition-colors duration-200 dark:bg-[#080d1a] dark:text-slate-100">
        <AuthProvider>
          <a href="#main-content" className="sr-only fixed left-4 top-4 z-[60] rounded-lg bg-white px-4 py-3 font-semibold text-brand-900 shadow focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-brand-600">Skip to main content</a>
          <ProjectCreditHeader />
          <NavBar />
          <AgentBanner />
          <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-6"><ApiModeBoundary>{children}</ApiModeBoundary></main>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
