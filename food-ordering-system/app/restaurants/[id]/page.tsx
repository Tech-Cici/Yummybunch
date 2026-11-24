import { notFound } from 'next/navigation';
import { Clock, MapPin, Phone } from 'lucide-react';
import { API_URL, imageUrl, MenuItem, Restaurant } from '@/lib/api';
import { RestaurantMenu } from '@/components/app/restaurant-menu';
import { BackButton } from '@/components/app/back-button';
import { FoodPhotoImg } from '@/components/app/food-photo';

/**
 * Server component: the restaurant and its menu are fetched here so they appear
 * in the initial HTML. Only the cart interactions are client-side.
 */
async function load(id: string): Promise<{ restaurant: Restaurant; menu: MenuItem[] } | null> {
  try {
    const [rRes, mRes] = await Promise.all([
      fetch(`${API_URL}/api/restaurants/${id}`, { cache: 'no-store', signal: AbortSignal.timeout(8000) }),
      fetch(`${API_URL}/api/restaurants/${id}/menu`, { cache: 'no-store', signal: AbortSignal.timeout(8000) }),
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
      <div className="overflow-hidden rounded-[2rem] border bg-card shadow-sm shadow-orange-900/5">
        <div className="relative h-56 sm:h-72">
          <FoodPhotoImg src={cover} seed={restaurant.id} alt={restaurant.name} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 flex flex-wrap items-end justify-between gap-3 p-6 sm:p-8">
            <div>
              {restaurant.cuisine && (
                <span className="rounded-full bg-card/95 px-3 py-1 text-xs font-bold text-accent-foreground">{restaurant.cuisine}</span>
              )}
              <h1 className="font-display mt-3 text-4xl font-semibold text-white drop-shadow sm:text-5xl">{restaurant.name}</h1>
            </div>
            <span
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold shadow ${
                restaurant.acceptingOrders ? 'bg-herb text-white' : 'bg-card/90 text-muted-foreground'
              }`}
            >
              {restaurant.acceptingOrders ? 'Taking orders now' : 'Not taking orders'}
            </span>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          {restaurant.description && (
            <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">{restaurant.description}</p>
          )}

          <div className={`flex flex-wrap gap-3 text-sm ${restaurant.description ? 'mt-5' : ''}`}>
            {restaurant.address && (
              <span className="flex items-center gap-2 rounded-full bg-secondary px-3.5 py-2">
                <MapPin className="h-4 w-4 text-primary" />{restaurant.address}
              </span>
            )}
            {restaurant.phone && (
              <span className="flex items-center gap-2 rounded-full bg-secondary px-3.5 py-2">
                <Phone className="h-4 w-4 text-primary" />{restaurant.phone}
              </span>
            )}
            {restaurant.openingTime && restaurant.closingTime && (
              <span className="flex items-center gap-2 rounded-full bg-secondary px-3.5 py-2">
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
