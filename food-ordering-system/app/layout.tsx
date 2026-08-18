import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ThemeProvider } from '@/components/theme-provider';
import { SiteHeader } from '@/components/app/site-header';
import { SiteFooter } from '@/components/app/site-footer';
import { Toaster } from '@/components/ui/sonner';

// Exposed as a CSS variable so globals.css can own the font stack.
const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: 'Yummybunch — order from local restaurants',
    template: '%s · Yummybunch',
  },
  description:
    'Browse local restaurants, order in a couple of taps, and follow your food from kitchen to door.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: next-themes sets the class on <html> before
    // React hydrates, which would otherwise be reported as a mismatch.
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Providers>
            <a href="#main" className="skip-link">Skip to content</a>
            <SiteHeader />
            <main id="main" className="min-h-[calc(100vh-8rem)]">
              {children}
            </main>
            <SiteFooter />
            <Toaster richColors position="top-center" closeButton />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
