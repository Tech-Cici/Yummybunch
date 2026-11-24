'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

import { fallbackFor } from '@/lib/food-photos';

export { FOOD_PHOTOS, foodPhoto, fallbackFor } from '@/lib/food-photos';
export type { FoodPhoto } from '@/lib/food-photos';

/** A photo that swaps to a bundled food photo if it is missing or fails to load. */
export function FoodPhotoImg({ src, seed, alt, className }: { src?: string | null; seed: string | number; alt: string; className?: string }) {
  const fallback = fallbackFor(seed);
  const [current, setCurrent] = useState(src || fallback);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt={alt}
      loading="lazy"
      onError={() => current !== fallback && setCurrent(fallback)}
      className={cn('h-full w-full object-cover', className)}
    />
  );
}
