import { notFound } from 'next/navigation';
import { Clock, MapPin, Phone, UtensilsCrossed } from 'lucide-react';
import { API_URL, imageUrl, MenuItem, Restaurant } from '@/lib/api';
import { RestaurantMenu } from '@/components/app/restaurant-menu';
import { BackButton } from '@/components/app/back-button';

/**
 * Server component: the restaurant and its menu are fetched here so they appear
 * in the initial HTML. Only the cart interactions are client-side.
 */
async function load(id: string): Promise<{ restaurant: Restaurant; menu: MenuItem[] } | null> {
  try {
    const [rRes, mRes] = await Promise.all([
      fetch(`${API_URL}/api/restaurants/${id}`, { cache: 'no-store' }),
      fetch(`${API_URL}/api/restaurants/${id}/menu`, { cache: 'no-store' }),
    ]);
    if (!rRes.ok) return null;
    return {
      restaurant: (await rRes.json()) as Restaurant,
      menu: mRes.ok ? ((await mRes.json()) as MenuItem[]) : [],
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const data = await load(params.id);
  // The brand suffix comes from the layout's title template, so it must not be
  // repeated here — that produced "Name — Yummybunch · Yummybunch".
  if (!data) return { title: 'Restaurant not found' };
  const { restaurant } = data;
  return {
    title: restaurant.name,
    description:
      restaurant.description ||
      `Order ${restaurant.cuisine ? `${restaurant.cuisine} food` : 'food'} from ${restaurant.name}.`,
  };
}

export default async function RestaurantPage({ params }: { params: { id: string } }) {
  const data = await load(params.id);
  if (!data) notFound();

  const { restaurant, menu } = data;
  const cover = imageUrl(restaurant.coverImageUrl);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <BackButton fallback="/restaurants" label="All restaurants" />
      <div className="overflow-hidden rounded-xl border">
        <div className="relative h-48 bg-gradient-to-br from-primary/25 to-accent sm:h-60">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt={restaurant.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-primary/40">
              <UtensilsCrossed className="h-14 w-14" />
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">{restaurant.name}</h1>
              {restaurant.cuisine && <p className="mt-1 text-primary">{restaurant.cuisine}</p>}
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                restaurant.acceptingOrders ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'
              }`}
            >
              {restaurant.acceptingOrders ? 'Accepting orders' : 'Not accepting orders'}
            </span>
          </div>

          {restaurant.description && (
            <p className="mt-3 text-sm text-muted-foreground">{restaurant.description}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {restaurant.address && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />{restaurant.address}
              </span>
            )}
            {restaurant.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-primary" />{restaurant.phone}
              </span>
            )}
            {restaurant.openingTime && restaurant.closingTime && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                {restaurant.openingTime}–{restaurant.closingTime}
              </span>
            )}
          </div>
        </div>
      </div>

      <RestaurantMenu restaurant={restaurant} menu={menu} />
    </div>
  );
}
