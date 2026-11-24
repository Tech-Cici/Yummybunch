/**
 * Bundled food photos (Unsplash licence, in /public/food). Used whenever a restaurant or dish
 * has no photo of its own, or its photo fails to load, so the page never shows an empty box.
 * Plain helpers (no React) so both server and client components can use them.
 */
export const FOOD_PHOTOS = ['brochettes', 'curry', 'stew', 'pizza', 'brunch', 'bowl', 'spread', 'platter', 'pancakes'] as const;
export type FoodPhoto = (typeof FOOD_PHOTOS)[number] | 'cafe' | 'dining';

export const foodPhoto = (name: FoodPhoto) => `/food/${name}.webp`;

/** The same restaurant or dish always gets the same stand-in photo. */
export function fallbackFor(seed: string | number) {
  const s = String(seed);
  let h = 7;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return foodPhoto(FOOD_PHOTOS[h % FOOD_PHOTOS.length]);
}
