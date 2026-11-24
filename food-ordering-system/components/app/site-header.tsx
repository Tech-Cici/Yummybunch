'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChefHat, ChevronDown, ClipboardList, HelpCircle, LayoutDashboard, LogIn, LogOut, Menu as MenuIcon,
  Receipt, Settings, Store, UserPlus, UtensilsCrossed,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/app/providers';
import { CRAVINGS, cravingHref, foodPhoto } from '@/lib/food-photos';
import { CartSheet } from './cart-sheet';
import { ThemeToggle } from './theme-toggle';
import { cn } from '@/lib/utils';

type NavLink = { href: string; label: string; icon: typeof Store };

export function SiteHeader() {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Close the mobile drawer on navigation, otherwise it stays open over the new page.
  useEffect(() => setOpen(false), [pathname]);

  const isOwner = user?.role === 'RESTAURANT';

  // Owners get their workspace; everyone else gets the food, plus their orders once signed in.
  const links: NavLink[] = isOwner
    ? [
        { href: '/dashboard', label: 'Order queue', icon: LayoutDashboard },
        { href: '/dashboard/menu', label: 'Menu', icon: ClipboardList },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
      ]
    : [
        { href: '/restaurants', label: 'Restaurants', icon: Store },
        ...(user ? [{ href: '/orders', label: 'My orders', icon: Receipt }] : []),
      ];

  // Sections of the home page, reachable from anywhere
  const explore: NavLink[] = isOwner
    ? [{ href: '/restaurants', label: 'Browse as a customer', icon: Store }]
    : [
        { href: '/#how-it-works', label: 'How it works', icon: HelpCircle },
        ...(user ? [] : [{ href: '/join', label: 'Join us', icon: ChefHat }]),
      ];

  /** /restaurants/12 keeps "Restaurants" lit; /dashboard/menu lights "Menu" but not "Order queue". */
  const isActive = (href: string) =>
    !href.includes('#') && (pathname === href || (href !== '/' && href !== '/dashboard' && pathname.startsWith(`${href}/`)));

  const handleSignOut = () => {
    signOut();
    setOpen(false);
    router.push('/');
  };

  const pill = (active: boolean) =>
    cn(
      'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-colors',
      active ? 'bg-accent text-accent-foreground' : 'text-foreground/70 hover:bg-accent/60 hover:text-foreground'
    );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4">
        {/* ---- mobile drawer ---- */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation menu">
              <MenuIcon className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="flex w-[19rem] flex-col overflow-y-auto p-0">
            <SheetHeader className="border-b px-5 py-4 text-left">
              <SheetTitle className="flex items-center gap-2 text-xl">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
                  <UtensilsCrossed className="h-4 w-4" />
                </span>
                <span className="font-display font-semibold">Yummy<span className="text-primary">bunch</span></span>
              </SheetTitle>
            </SheetHeader>

            <nav className="flex flex-col gap-1 p-3" aria-label="Main">
              {[...links, ...explore].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors',
                    isActive(link.href) ? 'bg-accent text-accent-foreground' : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                  )}
                >
                  <link.icon className="h-4 w-4 text-primary" />
                  {link.label}
                </Link>
              ))}
            </nav>

            {!isOwner && (
              <div className="px-5 pb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">What are you craving?</p>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {CRAVINGS.map(c => (
                    <Link key={c.label} href={cravingHref(c.q)} onClick={() => setOpen(false)} className="group flex flex-col items-center gap-1.5 text-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={foodPhoto(c.photo)} alt="" className="aspect-square w-full rounded-full border-2 border-card object-cover shadow-sm ring-1 ring-border group-hover:ring-primary/50" />
                      <span className="text-[11px] font-bold leading-tight">{c.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <Separator className="mt-auto" />

            <div className="p-3">
              {user ? (
                <>
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-bold">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" /> Sign out
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full justify-start gap-3">
                      <LogIn className="h-4 w-4" /> Sign in
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setOpen(false)}>
                    <Button className="w-full justify-start gap-3">
                      <UserPlus className="h-4 w-4" /> Create account
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* ---- wordmark ---- */}
        <Link href={isOwner ? '/dashboard' : '/'} className="flex shrink-0 items-center gap-2 rounded-full text-lg sm:text-xl">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm shadow-primary/30">
            <UtensilsCrossed className="h-5 w-5" />
          </span>
          <span className="font-display font-semibold text-foreground">Yummy<span className="text-primary">bunch</span></span>
        </Link>

        {/* ---- desktop nav ---- */}
        <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Main">
          {links.slice(0, 1).map(link => (
            <Link key={link.href} href={link.href} aria-current={isActive(link.href) ? 'page' : undefined} className={pill(isActive(link.href))}>
              {link.label}
            </Link>
          ))}

          {!isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger className={pill(false)}>
                Cravings <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[26rem] rounded-2xl p-3 focus-visible:ring-0">
                <DropdownMenuLabel className="px-1 pb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  What are you craving?
                </DropdownMenuLabel>
                <div className="grid grid-cols-3 gap-1">
                  {CRAVINGS.map(c => (
                    <DropdownMenuItem key={c.label} asChild className="cursor-pointer rounded-xl p-2 focus:bg-accent">
                      <Link href={cravingHref(c.q)} className="flex flex-col items-center gap-2 text-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={foodPhoto(c.photo)} alt="" className="aspect-square w-full rounded-full object-cover shadow-sm" />
                        <span className="text-xs font-bold leading-tight">{c.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem asChild className="cursor-pointer justify-center rounded-xl font-bold text-primary">
                  <Link href="/restaurants">See every restaurant →</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {[...links.slice(1), ...explore].map(link => (
            <Link key={link.href} href={link.href} aria-current={isActive(link.href) ? 'page' : undefined} className={pill(isActive(link.href))}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ---- right side ---- */}
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <ThemeToggle />

          {/* Owners never place orders, so no cart for them */}
          {!isOwner && <CartSheet />}

          {loading ? (
            <div className="h-9 w-20 animate-pulse rounded-full bg-muted" aria-hidden />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden max-w-[12rem] gap-2 bg-card pl-1.5 sm:inline-flex">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                    {user.name.trim().charAt(0).toUpperCase()}
                  </span>
                  <span className="truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 rounded-2xl focus-visible:ring-0">
                <DropdownMenuLabel className="font-normal">
                  <span className="block text-sm font-bold">{user.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {[...links, ...explore].map(link => (
                  <DropdownMenuItem key={link.href} onClick={() => router.push(link.href)} className="cursor-pointer">
                    <link.icon className="mr-2 h-4 w-4 text-primary" /> {link.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/signup" className="hidden sm:block">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
