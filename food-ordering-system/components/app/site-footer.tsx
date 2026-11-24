import Link from 'next/link';
import { Heart, UtensilsCrossed } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="mt-10 bg-[#2b1a12] text-[#f6e9dc]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 rounded-full text-xl">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-white">
              <UtensilsCrossed className="h-5 w-5" />
            </span>
            <span className="font-display font-semibold">Yummy<span className="text-saffron">bunch</span></span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-[#f6e9dc]/70">
            Local kitchens, honest food, and a warm meal on its way. Browse freely and order when you&apos;re hungry.
          </p>
        </div>
        <nav aria-label="Footer" className="text-sm">
          <p className="font-bold text-saffron">Eat</p>
          <ul className="mt-3 space-y-2 text-[#f6e9dc]/80">
            <li><Link href="/restaurants" className="rounded hover:text-white">Restaurants</Link></li>
            <li><Link href="/orders" className="rounded hover:text-white">My orders</Link></li>
            <li><Link href="/login" className="rounded hover:text-white">Sign in</Link></li>
          </ul>
        </nav>
        <nav aria-label="For restaurants" className="text-sm">
          <p className="font-bold text-saffron">Cook</p>
          <ul className="mt-3 space-y-2 text-[#f6e9dc]/80">
            <li><Link href="/signup?role=restaurant" className="rounded hover:text-white">List your restaurant</Link></li>
            <li><Link href="/dashboard" className="rounded hover:text-white">Restaurant dashboard</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto flex max-w-6xl items-center gap-1.5 px-4 py-5 text-xs text-[#f6e9dc]/60">
          Made with <Heart className="h-3.5 w-3.5 fill-primary text-primary" /> for good food · Photos from Unsplash
        </p>
      </div>
    </footer>
  );
}
