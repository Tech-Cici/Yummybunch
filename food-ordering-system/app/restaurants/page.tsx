'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Store, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { api, ApiError, Restaurant } from '@/lib/api';
import { RestaurantCard } from '@/components/app/restaurant-card';
import { foodPhoto } from '@/lib/food-photos';

function BrowsePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Links like /restaurants?q=pizza (the craving circles and the navbar menu) set the search,
  // including when you pick another one while already on this page.
  const params = useSearchParams();
  const urlQuery = params.get('q') ?? '';
  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  // Load the cuisine chips once.
  useEffect(() => {
    api.cuisines().then(setCuisines).catch(() => setCuisines([]));
  }, []);

  // Debounced so typing doesn't fire a request per keystroke.
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      setLoading(true);
      api
        .restaurants({ q: query || undefined, cuisine: cuisine || undefined })
        .then(list => {
          if (!cancelled) {
            setRestaurants(list);
            setError(null);
          }
        })
        .catch((e: ApiError) => {
          if (!cancelled) setError(e.message);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, cuisine]);

  const heading = useMemo(() => {
    if (loading) return 'Searching…';
    const n = restaurants.length;
    if (n === 0) return 'No matches';
    return `${n} restaurant${n === 1 ? '' : 's'}`;
  }, [loading, restaurants.length]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#2b1a12] px-6 py-12 text-white shadow-xl sm:px-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={foodPhoto('spread')} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2b1a12] via-[#2b1a12]/75 to-[#2b1a12]/20" />
        <div className="relative max-w-xl">
          <p className="text-sm font-bold uppercase tracking-widest text-saffron">Restaurants near you</p>
          <h1 className="font-display mt-2 text-4xl font-semibold sm:text-5xl">What&apos;s cooking today?</h1>
          <p className="mt-3 text-white/80">Browse menus and prices. No account needed to look around.</p>
          <div className="relative mt-6">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search a dish, cuisine or area…"
              className="h-14 rounded-full border-0 pl-12 pr-12 text-base text-foreground shadow-lg"
              aria-label="Search restaurants"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {cuisines.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            variant={cuisine === null ? 'default' : 'outline'}
            size="sm"
            className={cuisine === null ? '' : 'bg-card'}
            onClick={() => setCuisine(null)}
          >
            All kitchens
          </Button>
          {cuisines.map(c => (
            <Button
              key={c}
              variant={cuisine === c ? 'default' : 'outline'}
              size="sm"
              className={cuisine === c ? '' : 'bg-card'}
              onClick={() => setCuisine(cuisine === c ? null : c)}
            >
              {c}
            </Button>
          ))}
        </div>
      )}

      <h2 className="mt-8 text-sm font-bold text-muted-foreground">{heading}</h2>

      {error && (
        <Card className="mt-4 border-destructive/30 bg-destructive/10">
          <CardContent className="py-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {loading ? (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <Card key={i} className="overflow-hidden rounded-3xl">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <CardContent className="space-y-2 p-5">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : restaurants.length === 0 && !error ? (
        <Card className="mt-4 rounded-3xl border-dashed bg-card/60">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Store className="h-10 w-10 text-primary/40" />
            <p className="text-sm text-muted-foreground">
              {query || cuisine
                ? 'Nothing matched that search. Try a different term.'
                : 'No restaurants have been listed yet.'}
            </p>
            {(query || cuisine) && (
              <Button
                variant="outline"
                onClick={() => {
                  setQuery('');
                  setCuisine(null);
                }}
              >
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map(r => (
            <RestaurantCard key={r.id} r={r} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function RestaurantsPage() {
  // useSearchParams needs a Suspense boundary or the production build fails.
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-20 text-center text-muted-foreground">Loading…</div>}>
      <BrowsePage />
    </Suspense>
  );
}
