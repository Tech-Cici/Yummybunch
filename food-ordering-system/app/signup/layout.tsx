import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create account',
  description: 'Create a Yummybunch account to order or list your restaurant.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
