import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';

// This middleware's primary role is to refresh the session cookie if needed.
// It does NOT perform route protection itself. Route protection should be handled
// in Server Components (e.g., layouts or pages) using createServerComponentClient.

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createMiddlewareClient<Database>({
    req: request,
    res: response,
  });

  // Refresh session if expired - Supabase Auth Helpers handles this.
  // The getSession() call is enough to trigger the cookie refresh.
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('Middleware: Error from supabase.auth.getSession():', error);
  } else if (session) {
    console.log('Middleware: Session refreshed/validated. User:', session.user?.email);
  } else {
    console.log('Middleware: No active session found by getSession().');
  }

  // It's important to return the response object,
  // as it may have been modified by the Supabase client to set/update the session cookie.
  return response;
}

// Specify which routes this middleware should run on.
// It should run on all routes that might need session information or refresh.
// For simplicity, often it's set to run on most app routes.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login
     * - signup
     * - auth/callback
     *
     * This ensures it runs on protected routes and also on public routes
     * where a session might exist and need refreshing.
     * Adjust the matcher as per your application's specific needs.
     * For now, keeping original matcher to see if this simpler middleware works.
     */
    '/dashboard',
    '/dashboard/:path*',
    '/profile',
    '/profile/:path*',
    '/settings',
    '/settings/:path*',
    '/admin',
    '/admin/:path*',
    '/security-test',
    '/security-test/:path*',
    // Auth routes are included here so that if a user with an existing session
    // (perhaps from a previous tab) navigates to them, the session can be
    // managed/refreshed by the middleware. The actual redirect for authenticated
    // users away from auth routes should happen on the client or server component
    // of those auth pages.
    '/login',
    '/signup',
    '/auth/callback',
  ],
};
