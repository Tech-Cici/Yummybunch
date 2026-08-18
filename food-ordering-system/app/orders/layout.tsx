import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your orders',
  description: 'Track your orders live, from kitchen to door.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
