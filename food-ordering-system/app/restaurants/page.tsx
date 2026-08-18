'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Store, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { api, ApiError, imageUrl, Restaurant } from '@/lib/api';

export default function BrowsePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Restaurants</h1>
      <p className="mt-1 text-muted-foreground">Browse menus and prices. No account needed to look around.</p>

      <div className="mt-6 flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, cuisine or area…"
            className="pl-9"
            aria-label="Search restaurants"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {cuisines.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={cuisine === null ? 'default' : 'outline'}
              size="sm"
              className={cuisine === null ? 'bg-primary hover:bg-primary/90' : ''}
              onClick={() => setCuisine(null)}
            >
              All
            </Button>
            {cuisines.map(c => (
              <Button
                key={c}
                variant={cuisine === c ? 'default' : 'outline'}
                size="sm"
                className={cuisine === c ? 'bg-primary hover:bg-primary/90' : ''}
                onClick={() => setCuisine(cuisine === c ? null : c)}
              >
                {c}
              </Button>
            ))}
          </div>
        )}
      </div>

      <h2 className="mt-8 text-sm font-medium text-muted-foreground">{heading}</h2>

      {error && (
        <Card className="mt-4 border-destructive/30 bg-destructive/10">
          <CardContent className="py-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {loading ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <Card key={i}>
              <Skeleton className="h-40 w-full rounded-t-lg rounded-b-none" />
              <CardContent className="space-y-2 p-5">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : restaurants.length === 0 && !error ? (
        <Card className="mt-4 border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Store className="h-10 w-10 text-muted-foreground/40" />
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
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map(r => {
            const cover = imageUrl(r.coverImageUrl);
            return (
              <Link key={r.id} href={`/restaurants/${r.id}`} className="group">
                <Card className="h-full overflow-hidden transition group-hover:border-primary/40 group-hover:shadow-md">
                  <div className="relative h-40 bg-gradient-to-br from-primary/15 to-accent">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover} alt={r.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-primary/40">
                        <Store className="h-10 w-10" />
                      </div>
                    )}
                    {!r.acceptingOrders && (
                      <span className="absolute right-3 top-3 rounded bg-foreground/80 px-2 py-1 text-xs font-medium text-primary-foreground">
                        Closed
                      </span>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-semibold group-hover:text-primary">{r.name}</h3>
                    {r.cuisine && <p className="mt-1 text-sm text-primary">{r.cuisine}</p>}
                    {r.address && <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">{r.address}</p>}
                    <p className="mt-3 text-xs text-muted-foreground">
                      {r.menuItemCount} item{r.menuItemCount === 1 ? '' : 's'}
                      {r.openingTime && r.closingTime ? ` · ${r.openingTime}–${r.closingTime}` : ''}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
