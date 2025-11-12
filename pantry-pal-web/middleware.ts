import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  const isAuthRoute = req.nextUrl.pathname.startsWith('/auth');
  const isPublicRoute = req.nextUrl.pathname === '/' ||
                        req.nextUrl.pathname.startsWith('/about') ||
                        req.nextUrl.pathname.startsWith('/features') ||
                        req.nextUrl.pathname.startsWith('/pricing') ||
                        req.nextUrl.pathname.startsWith('/blog');

  if (!isAuthRoute && !isPublicRoute) {
    try {
      const sessionResponse = await fetch(`${apiUrl}/auth/session`, {
        method: 'GET',
        headers: {
          cookie: req.headers.get('cookie') || '',
        },
      });

      if (!sessionResponse.ok) {
        const redirectUrl = new URL('/auth/login', req.url);
        redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }
    } catch (error) {
      const redirectUrl = new URL('/auth/login', req.url);
      redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (isAuthRoute) {
    try {
      const sessionResponse = await fetch(`${apiUrl}/auth/session`, {
        method: 'GET',
        headers: {
          cookie: req.headers.get('cookie') || '',
        },
      });

      if (sessionResponse.ok) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    } catch (error) {
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
