import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Confirm your delivery details and place your order.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
