import { NextRequest, NextResponse } from 'next/server';

/**
 * Route guard. Only checks that a session cookie exists and what role it claims;
 * the backend re-authorises every request, so this is purely for redirecting
 * people to the right place instead of showing them a dead screen.
 */
const TOKEN_COOKIE = 'yb_token';
const USER_COOKIE = 'yb_user';

const CUSTOMER_ONLY = ['/orders', '/checkout'];
const RESTAURANT_ONLY = ['/dashboard'];
const AUTH_PAGES = ['/login', '/signup', '/verify'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(TOKEN_COOKIE)?.value;

  let role: string | null = null;
  const rawUser = req.cookies.get(USER_COOKIE)?.value;
  if (rawUser) {
    try {
      role = JSON.parse(decodeURIComponent(rawUser)).role ?? null;
    } catch {
      try {
        role = JSON.parse(rawUser).role ?? null;
      } catch {
        role = null;
      }
    }
  }

  const signedIn = Boolean(token);
  const home = role === 'RESTAURANT' ? '/dashboard' : '/restaurants';

  // Already signed in? The auth pages have nothing to offer.
  // /verify stays reachable: finishing signup happens while signed out.
  if (signedIn && AUTH_PAGES.some(p => pathname.startsWith(p)) && !pathname.startsWith('/verify')) {
    return NextResponse.redirect(new URL(home, req.url));
  }

  const needsCustomer = CUSTOMER_ONLY.some(p => pathname.startsWith(p));
  const needsRestaurant = RESTAURANT_ONLY.some(p => pathname.startsWith(p));

  if ((needsCustomer || needsRestaurant) && !signedIn) {
    const url = new URL('/login', req.url);
    url.searchParams.set('next', pathname); // return here after signing in
    return NextResponse.redirect(url);
  }

  if (needsRestaurant && role && role !== 'RESTAURANT') {
    return NextResponse.redirect(new URL('/restaurants', req.url));
  }
  if (needsCustomer && role === 'RESTAURANT') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/orders/:path*', '/checkout/:path*', '/dashboard/:path*', '/login', '/signup'],
};
