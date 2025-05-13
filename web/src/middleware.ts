import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';

// List of routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/admin',
  '/security-test',
];

// List of routes that are public (auth pages)
const authRoutes = [
  '/auth/sign-in',
  '/auth/sign-up',
];

export async function middleware(request: NextRequest) {
  try {
    // Create a Supabase client configured to use cookies
    const response = NextResponse.next();
    const supabase = createMiddlewareClient<Database>({ req: request, res: response });
    
    // Refresh session if expired
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    const requestPath = new URL(request.url).pathname;
    
    // Check if the route requires authentication
    const isProtectedRoute = protectedRoutes.some(route => 
      requestPath === route || requestPath.startsWith(`${route}/`)
    );
    
    // Check if the route is an auth route (sign-in, sign-up)
    const isAuthRoute = authRoutes.some(route => 
      requestPath === route || requestPath.startsWith(`${route}/`)
    );
    
    // Redirect unauthenticated users to sign-in page if trying to access protected routes
    if (isProtectedRoute && !session) {
      const redirectUrl = new URL('/auth/sign-in', request.url);
      redirectUrl.searchParams.set('redirect', requestPath);
      return NextResponse.redirect(redirectUrl);
    }
    
    // Handle redirect after sign-in
    if (session && requestPath === '/auth/callback') {
      const redirectTo = request.nextUrl.searchParams.get('redirect');
      if (redirectTo && redirectTo.startsWith('/')) {
        return NextResponse.redirect(new URL(redirectTo, request.url));
      }
    }
    
    // Redirect authenticated users to dashboard if they try to access auth routes
    if (isAuthRoute && session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    return response;
  } catch (error) {
    // In case of any errors, log them and redirect to sign-in page
    console.error('Auth middleware error:', error);
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    // Only apply middleware to dashboard, profile, settings, admin, and security-test routes
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/admin/:path*',
    '/security-test/:path*',
    '/security-test',
  ],
};
