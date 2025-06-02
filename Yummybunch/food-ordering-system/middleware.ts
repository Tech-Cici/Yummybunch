import { NextResponse } from 'next/server';

export async function middleware(req: any) {
  const token = req.cookies.get('token')?.value;
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
  const isRestaurantPage = req.nextUrl.pathname.startsWith('/restaurant');
  const isCustomerPage = req.nextUrl.pathname.startsWith('/customer');
  const isAdminPage = req.nextUrl.pathname.startsWith('/admin');

  let user = null;
  if (token) {
    try {
      const response = await fetch('http://localhost:8080/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        user = await response.json();
      } else {
        // If token verification fails, clear the cookies
        const response = NextResponse.next();
        response.cookies.delete('token');
        response.cookies.delete('user');
        return response;
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      // If there's an error, clear the cookies
      const response = NextResponse.next();
      response.cookies.delete('token');
      response.cookies.delete('user');
      return response;
    }
  }

  const isAuth = !!user;
  const role = user?.role;

  // If user is on auth page and authenticated, redirect to appropriate dashboard
  if (isAuthPage && isAuth) {
    let redirectUrl;
    if (role === 'ADMIN') {
      redirectUrl = '/admin';
    } else if (role === 'RESTAURANT') {
      redirectUrl = '/restaurant/dashboard';
    } else {
      redirectUrl = '/customer/restaurants';
    }
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  // If user is not authenticated and trying to access protected pages
  if (!isAuth && (isRestaurantPage || isCustomerPage || isAdminPage)) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // If user is authenticated but trying to access wrong role pages
  if (isAuth) {
    if (role === 'RESTAURANT' && (isCustomerPage || isAdminPage)) {
      return NextResponse.redirect(new URL('/restaurant/dashboard', req.url));
    }
    if (role === 'CUSTOMER' && (isRestaurantPage || isAdminPage)) {
      return NextResponse.redirect(new URL('/customer/restaurants', req.url));
    }
    if (role === 'ADMIN' && (isRestaurantPage || isCustomerPage)) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/restaurant/:path*',
    '/customer/:path*',
    '/admin/:path*',
    '/auth/:path*',
  ],
}; 