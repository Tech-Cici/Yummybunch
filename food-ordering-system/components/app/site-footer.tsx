import Link from 'next/link';
import { UtensilsCrossed } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <Link href="/" className="flex items-center gap-2 rounded-md font-semibold text-primary">
          <UtensilsCrossed className="h-4 w-4" /> Yummybunch
        </Link>
        <nav className="flex items-center gap-5" aria-label="Footer">
          <Link href="/restaurants" className="rounded-md hover:text-foreground">Restaurants</Link>
          <Link href="/signup?role=restaurant" className="rounded-md hover:text-foreground">
            List your restaurant
          </Link>
        </nav>
        <span>Browse freely. Order when you are ready.</span>
      </div>
    </footer>
  );
}
