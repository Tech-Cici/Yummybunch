import Link from 'next/link';
import { Clock, MapPin } from 'lucide-react';
import { imageUrl, Restaurant } from '@/lib/api';
import { FoodPhotoImg } from './food-photo';

/** Photo-first restaurant card used on the home page and the restaurant list. */
export function RestaurantCard({ r }: { r: Restaurant }) {
  return (
    <Link href={`/restaurants/${r.id}`} className="group block h-full rounded-3xl focus-visible:ring-offset-4">
      <article className="flex h-full flex-col overflow-hidden rounded-3xl border bg-card shadow-sm shadow-orange-900/5 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-orange-900/10">
        <div className="relative aspect-[4/3] overflow-hidden">
          <FoodPhotoImg src={imageUrl(r.coverImageUrl)} seed={r.id} alt={r.name} className="transition duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0" />
          {r.cuisine && (
            <span className="absolute left-3 top-3 rounded-full bg-card/95 px-3 py-1 text-xs font-bold text-accent-foreground shadow-sm">
              {r.cuisine}
            </span>
          )}
          <span
            className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold shadow-sm ${
              r.acceptingOrders ? 'bg-herb text-white' : 'bg-foreground/80 text-background'
            }`}
          >
            {r.acceptingOrders ? 'Open' : 'Closed'}
          </span>
          <h3 className="font-display absolute bottom-3 left-4 right-4 text-2xl font-semibold text-white drop-shadow">{r.name}</h3>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-5 text-sm text-muted-foreground">
          {r.address && (
            <p className="flex items-center gap-1.5 line-clamp-1">
              <MapPin className="h-4 w-4 shrink-0 text-primary" /> <span className="truncate">{r.address}</span>
            </p>
          )}
          <div className="mt-auto flex items-center justify-between pt-1">
            <span>
              {r.menuItemCount} dish{r.menuItemCount === 1 ? '' : 'es'}
            </span>
            {r.openingTime && r.closingTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {r.openingTime}–{r.closingTime}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
