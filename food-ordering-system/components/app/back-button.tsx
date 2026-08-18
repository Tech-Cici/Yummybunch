'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Back control for sub-pages.
 *
 * Uses real history when there is any, and otherwise navigates to `fallback` —
 * so arriving from a shared link or an email never leaves the button dead.
 */
export function BackButton({
  fallback = '/',
  label = 'Back',
  className,
}: {
  fallback?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // history.length > 1 means this tab has somewhere to go back to.
    setCanGoBack(typeof window !== 'undefined' && window.history.length > 1);
  }, []);

  return (
    <Button
      variant="ghost"
      size="sm"
      className={className ?? '-ml-2 mb-4 gap-1.5 text-muted-foreground hover:text-foreground'}
      onClick={() => (canGoBack ? router.back() : router.push(fallback))}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}
