import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  try {
    // Check if we're using placeholder credentials from environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    const isUsingRealCredentials = supabaseUrl && supabaseUrl.startsWith("http") && supabaseAnonKey

    // If we're using placeholder credentials, skip auth checks
    if (!isUsingRealCredentials) {
      return res
    }

    // Public paths that don't require authentication
    const publicPaths = [
      '/login',
      '/signup',
      '/',  // Add the root path as public
      '/auth/callback',
      '/auth/reset-password',
      '/api/auth',
      '/_next',
      '/favicon.ico',
      '/images',
      '/fonts',
      '/static'
    ]
    
    // Check if the current path is public
    const isPublicPath = publicPaths.some(path => 
      req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith(path)
    )
    
    console.log(`[Middleware] Path: ${req.nextUrl.pathname}, isPublic: ${isPublicPath}`)
    
    // If it's a public path, skip auth checks
    if (isPublicPath) {
      console.log('[Middleware] Public path detected, skipping auth checks')
      return res
    }

    const supabase = createMiddlewareClient({ req, res })

    // Get the session with error handling
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession()
    
    // Handle session errors, particularly refresh token issues
    if (sessionError) {
      console.error('[Middleware] Session error:', sessionError)
      
      // If there's a refresh token error, redirect to login
      if (sessionError.message?.includes('Refresh Token') || 
          sessionError.message?.includes('Invalid Refresh Token')) {
        console.warn('[Middleware] Refresh token error detected, redirecting to login')
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    // Check if the user is authenticated
    const isAuthenticated = !!session
    const isAuthPage = req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signup"
    const isOnboardingPage = req.nextUrl.pathname === "/onboarding"

    // If the user is on an auth page and is already authenticated, redirect to home
    if (isAuthPage && isAuthenticated) {
      return NextResponse.redirect(new URL("/", req.url))
    }

    // If the user is not authenticated and not on an auth page, redirect to login
    if (!isAuthenticated && !isAuthPage) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // If the user is authenticated, check if they have completed onboarding
    if (isAuthenticated && !isOnboardingPage) {
      try {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        // If the user hasn't completed onboarding, redirect to onboarding
        // if (!profile && req.nextUrl.pathname !== "/onboarding") {
        //   return NextResponse.redirect(new URL("/onboarding", req.url))
        // }
      } catch (error) {
        console.error("Error checking profile in middleware:", error)
        // Continue without redirecting if there's an error
      }
    }
  } catch (error) {
    console.error("Middleware error:", error)
    // If there's an error with Supabase, just continue without authentication checks
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
}
