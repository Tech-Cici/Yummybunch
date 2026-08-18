import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Restaurant settings',
  description: 'Your public restaurant profile.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
