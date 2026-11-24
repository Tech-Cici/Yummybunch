import { foodPhoto, FoodPhoto } from '@/lib/food-photos';

/** Sign-in / sign-up layout: a warm food photo with a note on large screens, the form beside it. */
export function AuthSplit({ photo, quote, children }: { photo: FoodPhoto; quote: { title: string; body: string }; children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-2 lg:py-14">
      <aside className="relative hidden min-h-[36rem] overflow-hidden rounded-[2rem] shadow-xl shadow-orange-900/15 lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={foodPhoto(photo)} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2b1a12]/90 via-[#2b1a12]/20 to-transparent" />
        <div className="absolute bottom-0 p-10 text-white">
          <p className="font-display text-3xl font-semibold leading-tight">{quote.title}</p>
          <p className="mt-3 max-w-sm text-white/80">{quote.body}</p>
        </div>
      </aside>
      <div className="flex flex-col justify-center">{children}</div>
    </div>
  );
}
