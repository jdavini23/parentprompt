import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

// Force dynamic to ensure this route is not cached
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (!code) {
    console.error('No code provided to callback route');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Create a Supabase client using the auth helpers for route handlers
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);

    // Get the redirect URL from the query parameters
    const redirectTo = requestUrl.searchParams.get('redirect') || '/dashboard';

    // Make sure the redirect URL is safe (starts with a slash to keep it on the same domain)
    const safeRedirectPath = redirectTo.startsWith('/') ? redirectTo : '/dashboard';

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(new URL(safeRedirectPath, request.url));
  } catch (error) {
    console.error('Error in auth callback:', error);
    return NextResponse.redirect(new URL('/login?error=callback_error', request.url));
  }
}
