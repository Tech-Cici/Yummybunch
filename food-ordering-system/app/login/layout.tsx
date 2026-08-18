import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to order or manage your restaurant.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
