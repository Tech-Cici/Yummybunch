import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your menu',
  description: 'Add, edit and photograph your menu items.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
