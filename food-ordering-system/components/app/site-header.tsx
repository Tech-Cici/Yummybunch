'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ClipboardList, LayoutDashboard, LogOut, Menu as MenuIcon, Receipt,
  Settings, Store, UserPlus, UtensilsCrossed, LogIn,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useAuth, useCart } from '@/app/providers';
import { CartSheet } from './cart-sheet';
import { ThemeToggle } from './theme-toggle';
import { cn } from '@/lib/utils';

type NavLink = { href: string; label: string; icon: typeof Store };

export function SiteHeader() {
  const { user, loading, signOut } = useAuth();
  const cart = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Close the mobile drawer on navigation, otherwise it stays open over the new page.
  useEffect(() => setOpen(false), [pathname]);

  const isOwner = user?.role === 'RESTAURANT';

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

  /** Treats /dashboard/menu as active for itself but not for /dashboard. */
  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));

  const handleSignOut = () => {
    signOut();
    setOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4">
        {/* ---- mobile burger ---- */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation menu">
              <MenuIcon className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-[17rem] p-0">
            <SheetHeader className="border-b px-5 py-4 text-left">
              <SheetTitle className="flex items-center gap-2 text-primary">
                <UtensilsCrossed className="h-5 w-5" /> Yummybunch
              </SheetTitle>
            </SheetHeader>

            <nav className="flex flex-col gap-1 p-3" aria-label="Main">
              {links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive(link.href)
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </nav>

            <Separator />

            <div className="p-3">
              {user ? (
                <>
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" /> Sign out
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/login">
                    <Button variant="outline" className="w-full justify-start gap-3">
                      <LogIn className="h-4 w-4" /> Sign in
                    </Button>
                  </Link>
                  <Link href="/signup">
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
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-md text-lg font-bold text-primary sm:text-xl"
        >
          <UtensilsCrossed className="h-6 w-6" />
          <span>Yummybunch</span>
        </Link>

        {/* ---- desktop nav ---- */}
        <nav className="ml-3 hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive(link.href)
                  ? 'bg-accent text-accent-foreground'
                  : 'text-foreground/70 hover:bg-muted hover:text-foreground'
              )}
            >
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
            <div className="h-9 w-20 animate-pulse rounded-md bg-muted" aria-hidden />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden max-w-[11rem] sm:inline-flex">
                  <span className="truncate">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <span className="block text-sm font-medium">{user.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {links.map(link => (
                  <DropdownMenuItem key={link.href} onClick={() => router.push(link.href)}>
                    <link.icon className="mr-2 h-4 w-4" /> {link.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
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
