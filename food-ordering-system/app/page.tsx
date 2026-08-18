import Link from 'next/link';
import { ArrowRight, ChefHat, ClipboardCheck, Search, Store, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { API_URL, Restaurant } from '@/lib/api';

/**
 * Server-rendered so the catalogue is visible immediately, with no token and no
 * client round-trip. Browsing is public — that is the whole point of the page.
 */
async function loadRestaurants(): Promise<Restaurant[]> {
  try {
    const res = await fetch(`${API_URL}/api/restaurants`, { cache: 'no-store' });
    if (!res.ok) return [];
    return (await res.json()) as Restaurant[];
  } catch {
    // Backend down: the page still renders, just without the preview strip.
    return [];
  }
}

export default async function HomePage() {
  const restaurants = (await loadRestaurants()).slice(0, 6);

  return (
    <div>
      {/* ---------------- hero ---------------- */}
      <section className="border-b bg-brand-wash">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-primary">
            <UtensilsCrossed className="h-3 w-3" /> Local food, ordered simply
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Order from restaurants near you
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Browse menus without signing up. Create an account only when you are ready to order,
            then follow your food from the kitchen to your door.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/restaurants">
              <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90">
                <Search className="h-4 w-4" /> Browse restaurants
              </Button>
            </Link>
            <Link href="/signup?role=restaurant">
              <Button size="lg" variant="outline" className="gap-2">
                <Store className="h-4 w-4" /> List your restaurant
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- how it works ---------------- */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-semibold">How it works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { icon: Search, title: 'Find a restaurant', body: 'Search by name, cuisine or neighbourhood. Menus and prices are public.' },
            { icon: ClipboardCheck, title: 'Place your order', body: 'Build a cart, add a delivery address, and send it straight to the kitchen.' },
            { icon: ChefHat, title: 'Follow it live', body: 'Received, preparing, ready — the restaurant updates each step as it happens.' },
          ].map(({ icon: Icon, title, body }) => (
            <Card key={title} className="border-border">
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ---------------- live catalogue preview ---------------- */}
      <section className="border-t bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold">
              {restaurants.length > 0 ? 'Open now' : 'No restaurants yet'}
            </h2>
            {restaurants.length > 0 && (
              <Link href="/restaurants">
                <Button variant="ghost" className="gap-1">
                  See all <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>

          {restaurants.length === 0 ? (
            <Card className="mt-8 border-dashed">
              <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
                <Store className="h-10 w-10 text-muted-foreground/40" />
                <p className="max-w-md text-sm text-muted-foreground">
                  Nobody has listed a restaurant yet. If you run one, create an account and your
                  menu will show up here straight away.
                </p>
                <Link href="/signup?role=restaurant">
                  <Button className="bg-primary hover:bg-primary/90">List your restaurant</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {restaurants.map(r => (
                <Link key={r.id} href={`/restaurants/${r.id}`} className="group">
                  <Card className="h-full overflow-hidden transition group-hover:border-primary/40 group-hover:shadow-md">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold group-hover:text-primary">{r.name}</h3>
                        {!r.acceptingOrders && (
                          <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            Closed
                          </span>
                        )}
                      </div>
                      {r.cuisine && <p className="mt-1 text-sm text-primary">{r.cuisine}</p>}
                      {r.address && <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">{r.address}</p>}
                      <p className="mt-3 text-xs text-muted-foreground">
                        {r.menuItemCount} item{r.menuItemCount === 1 ? '' : 's'} on the menu
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
