import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Restaurants',
    // Children (e.g. a restaurant page) supply their own name; keep the suffix.
    template: '%s · Yummybunch',
  },
  description: 'Browse local restaurants, menus and prices.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
