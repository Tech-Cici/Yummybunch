import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Confirm your email',
  description: 'Enter the code we emailed you.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
