import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Order queue',
    // Children (e.g. a restaurant page) supply their own name; keep the suffix.
    template: '%s · Yummybunch',
  },
  description: 'Incoming orders for your restaurant.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
