import Link from 'next/link';
import { ArrowRight, Bike, ChefHat, Heart, Search, ShoppingBag, Store, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { API_URL, Restaurant } from '@/lib/api';
import { RestaurantCard } from '@/components/app/restaurant-card';
import { CRAVINGS, cravingHref, foodPhoto } from '@/lib/food-photos';

/**
 * Server-rendered so the catalogue is visible immediately, with no token and no
 * client round-trip. Browsing is public — that is the whole point of the page.
 */
async function loadRestaurants(): Promise<Restaurant[]> {
  try {
    const res = await fetch(`${API_URL}/api/restaurants`, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
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
    <div className="overflow-x-clip">
      {/* ---------------- hero ---------------- */}
      <section className="relative">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 lg:grid-cols-[1.05fr_1fr] lg:pb-24 lg:pt-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3.5 py-1.5 text-xs font-bold text-primary shadow-sm">
              <Heart className="h-3.5 w-3.5 fill-primary" /> Home-style food from local kitchens
            </span>
            <h1 className="font-display mt-6 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Good food, <span className="squiggle">made with love</span>, brought to your door.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Browse the menus of restaurants near you without signing up. When something looks too good to pass,
              order in a few taps and follow it from the kitchen to your table.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/restaurants">
                <Button size="lg" className="gap-2">
                  <Search className="h-4 w-4" /> Find something tasty
                </Button>
              </Link>
              <Link href="/signup?role=restaurant">
                <Button size="lg" variant="outline" className="gap-2 bg-card/70">
                  <Store className="h-4 w-4" /> List your restaurant
                </Button>
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-muted-foreground">
              {['Menus open to everyone', 'Live order tracking', 'Local kitchens'].map(t => (
                <li key={t} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-saffron" /> {t}
                </li>
              ))}
            </ul>
          </div>

          <HeroCollage />
        </div>
      </section>

      {/* ---------------- cravings ---------------- */}
      <section id="cravings" className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-16">
        <h2 className="font-display text-3xl font-semibold">What are you craving?</h2>
        <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-6">
          {CRAVINGS.map(c => (
            <Link key={c.label} href={cravingHref(c.q)} className="group flex flex-col items-center gap-3 rounded-3xl p-2 text-center">
              <span className="relative aspect-square w-full overflow-hidden rounded-full border-4 border-card shadow-md shadow-orange-900/10 ring-1 ring-border transition duration-300 group-hover:-translate-y-1 group-hover:ring-primary/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={foodPhoto(c.photo)} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
              </span>
              <span className="text-sm font-bold leading-tight group-hover:text-primary">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- open now ---------------- */}
      <section id="restaurants" className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Fresh out of the kitchen</p>
            <h2 className="font-display mt-1 text-3xl font-semibold">{restaurants.length > 0 ? 'Restaurants on Yummybunch' : 'No restaurants yet'}</h2>
          </div>
          {restaurants.length > 0 && (
            <Link href="/restaurants">
              <Button variant="ghost" className="gap-1">
                See all <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        {restaurants.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-3xl border border-dashed bg-card/60 px-6 py-14 text-center">
            <UtensilsCrossed className="h-10 w-10 text-primary/40" />
            <p className="max-w-md text-sm text-muted-foreground">
              Nobody has listed a restaurant yet. If you run one, create an account and your menu will show up here
              straight away.
            </p>
            <Link href="/signup?role=restaurant">
              <Button>List your restaurant</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map(r => (
              <RestaurantCard key={r.id} r={r} />
            ))}
          </div>
        )}
      </section>

      {/* ---------------- how it works ---------------- */}
      <section id="how-it-works" className="scroll-mt-16 border-y bg-secondary/60">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="text-center text-sm font-bold uppercase tracking-widest text-primary">How it works</p>
          <h2 className="font-display mt-1 text-center text-3xl font-semibold">From craving to first bite</h2>
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: Search, title: 'Pick a kitchen', body: 'Search by dish, cuisine or neighbourhood. Every menu and price is open to browse.' },
              { icon: ShoppingBag, title: 'Fill your basket', body: 'Add what you love, give a delivery address, and your order goes straight to the cooks.' },
              { icon: Bike, title: 'Follow it home', body: 'Received, preparing, ready: the restaurant updates each step so you know when to set the table.' },
            ].map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="relative rounded-3xl border bg-card p-7 shadow-sm shadow-orange-900/5">
                <span className="font-display absolute right-6 top-4 text-6xl font-semibold text-primary/10">{i + 1}</span>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="font-display mt-5 text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------- for restaurants ---------------- */}
      <section id="for-restaurants" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#2b1a12] text-white shadow-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={foodPhoto('cafe')} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2b1a12] via-[#2b1a12]/85 to-transparent" />
          <div className="relative max-w-xl p-8 sm:p-14">
            <ChefHat className="h-10 w-10 text-saffron" />
            <h2 className="font-display mt-4 text-4xl font-semibold leading-tight">Run a kitchen? Let the neighbourhood find you.</h2>
            <p className="mt-4 text-white/80">
              Put your menu online with photos and prices, switch ordering on when you open, and manage incoming orders
              from one simple queue.
            </p>
            <Link href="/signup?role=restaurant" className="mt-8 inline-block">
              <Button size="lg" className="gap-2 bg-saffron text-[#2b1a12] shadow-none hover:bg-saffron/90">
                List your restaurant <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Three plates arranged like a table spread, with a little order-status note pinned on. */
function HeroCollage() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[34rem]">
      <div className="absolute inset-6 rounded-full bg-gradient-to-br from-saffron/30 via-accent to-primary/20 blur-2xl" aria-hidden />
      <figure className="absolute left-0 top-4 h-[72%] w-[52%] overflow-hidden rounded-[2rem] border-[6px] border-card shadow-2xl shadow-orange-900/20 -rotate-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={foodPhoto('brochettes')} alt="Grilled brochettes with dipping sauces" className="h-full w-full object-cover" />
      </figure>
      <figure className="absolute right-0 top-0 h-[44%] w-[50%] overflow-hidden rounded-[2rem] border-[6px] border-card shadow-xl shadow-orange-900/20 rotate-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={foodPhoto('curry')} alt="A bowl of prawn curry with rice" className="h-full w-full object-cover" />
      </figure>
      <figure className="absolute bottom-0 right-4 h-[50%] w-[48%] overflow-hidden rounded-[2rem] border-[6px] border-card shadow-xl shadow-orange-900/20 rotate-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={foodPhoto('stew')} alt="Chicken stew with basil" className="h-full w-full object-cover" />
      </figure>
      <div className="absolute bottom-10 left-2 flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-xl shadow-orange-900/15">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-herb/15 text-herb">
          <ChefHat className="h-5 w-5" />
        </span>
        <div className="text-sm">
          <p className="font-bold">Your order is cooking</p>
          <p className="text-muted-foreground">Received · <span className="font-semibold text-primary">Preparing</span> · Ready</p>
        </div>
      </div>
    </div>
  );
}
