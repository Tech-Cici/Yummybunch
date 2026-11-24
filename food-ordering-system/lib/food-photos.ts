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

/** "What are you craving?" categories: shown on the home page and in the navbar menu. */
export const CRAVINGS: { label: string; photo: FoodPhoto; q: string }[] = [
  { label: 'Grills & brochettes', photo: 'brochettes', q: 'grill' },
  { label: 'Stews & curries', photo: 'curry', q: 'stew' },
  { label: 'Pizza', photo: 'pizza', q: 'pizza' },
  { label: 'Breakfast', photo: 'pancakes', q: 'breakfast' },
  { label: 'Fresh bowls', photo: 'bowl', q: 'salad' },
  { label: 'Sharing plates', photo: 'platter', q: '' },
];

export const cravingHref = (q: string) => (q ? `/restaurants?q=${encodeURIComponent(q)}` : '/restaurants');
