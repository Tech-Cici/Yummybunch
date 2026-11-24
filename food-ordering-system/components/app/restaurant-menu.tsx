'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { imageUrl, MenuItem, money, Restaurant } from '@/lib/api';
import { useAuth, useCart } from '@/app/providers';
import { FoodPhotoImg } from './food-photo';

/**
 * Only the interactive half of the restaurant page. The restaurant details and
 * menu arrive as props from the server component, so the menu is in the initial
 * HTML — good for first paint and for search engines.
 */
export function RestaurantMenu({
  restaurant,
  menu,
}: {
  restaurant: Restaurant;
  menu: MenuItem[];
}) {
  const cart = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const sections = useMemo(() => {
    const groups = new Map<string, MenuItem[]>();
    for (const item of menu) {
      const key = item.category?.trim() || 'Menu';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    }
    return [...groups.entries()];
  }, [menu]);

  const isOwner = user?.role === 'RESTAURANT';

  const addToCart = (item: MenuItem) => {
    const ok = cart.add(restaurant.id, restaurant.name, item);
    if (!ok) {
      toast.error('Your cart has items from another restaurant', {
        description: 'Empty it first, or check out that order before starting a new one.',
      });
      return;
    }
    toast.success(`${item.name} added`, { description: money(item.price) });
  };

  return (
    <>
      <div className="mt-10">
        <h2 className="font-display text-3xl font-semibold">On the menu</h2>

        {menu.length === 0 ? (
          <Card className="mt-4 rounded-3xl border-dashed bg-card/60">
            <CardContent className="py-14 text-center text-sm text-muted-foreground">
              This restaurant hasn&apos;t added any menu items yet.
            </CardContent>
          </Card>
        ) : (
          sections.map(([section, items]) => (
            <section key={section} className="mt-8">
              <h3 className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-primary">
                {section}
                <span className="h-px flex-1 bg-border" />
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {items.map(item => {
                  const pic = imageUrl(item.imageUrl);
                  return (
                    <Card key={item.id} className="overflow-hidden rounded-3xl transition hover:shadow-md hover:shadow-orange-900/10">
                      <CardContent className="flex gap-4 p-4">
                        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl">
                          <FoodPhotoImg src={pic} seed={item.id} alt={item.name} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-display text-lg font-semibold leading-snug">{item.name}</h4>
                            <span className="shrink-0 rounded-full bg-accent px-2.5 py-0.5 text-sm font-bold text-accent-foreground">{money(item.price)}</span>
                          </div>
                          {item.description && (
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                          )}
                          <div className="mt-3">
                            {isOwner ? (
                              <p className="text-xs text-muted-foreground">Restaurant accounts cannot place orders</p>
                            ) : !restaurant.acceptingOrders ? (
                              <Button size="sm" variant="outline" disabled>Closed</Button>
                            ) : (
                              <Button size="sm" className="gap-1" onClick={() => addToCart(item)}>
                                <Plus className="h-3 w-3" /> Add to basket
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>

      {cart.count > 0 && cart.restaurantId === restaurant.id && (
        <div className="sticky bottom-4 mt-10">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 rounded-full border bg-card py-3 pl-6 pr-3 shadow-xl shadow-orange-900/15">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <div className="text-sm">
                <p className="font-medium">{cart.count} item{cart.count === 1 ? '' : 's'}</p>
                <p className="text-muted-foreground">{money(cart.subtotal)}</p>
              </div>
            </div>
            <Button onClick={() => router.push('/checkout')}>Go to checkout</Button>
          </div>
        </div>
      )}
    </>
  );
}
