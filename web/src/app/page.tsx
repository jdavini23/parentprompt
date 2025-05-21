'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/navigation';
import { getTodaysPrompt, markPromptCompleted, markPromptFavorite } from '@/lib/prompt-service';
import { CheckCircle, Star, StarOff, AlertTriangle } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/supabase';
import { isUsingRealCredentials } from '@/lib/supabase';
import { DebugEnv } from '@/components/debug-env';

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createClientComponentClient<Database>();
  const [prompt, setPrompt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(true);

  // Add a timeout to prevent loading state from getting stuck
  useEffect(() => {
    // Set a timeout to force loading to false after 8 seconds
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Loading timeout reached, forcing loading state to false');
        setLoading(false);
        setLoadingTimeout(true);
      }
    }, 8000);

    return () => clearTimeout(timeout);
  }, [loading]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        // If no user after 2 seconds, stop loading
        setTimeout(() => {
          if (!user && loading) {
            console.log('No user after timeout, stopping loading');
            setLoading(false);
          }
        }, 2000);
        return;
      }

      try {
        console.log('Fetching user profile and prompt data...');

        // Fetch user profile with error handling
        try {
          // Try users table first (which is what exists in the schema)
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (userError) {
            console.warn(
              'Error fetching from users table, trying profiles as fallback:',
              userError
            );

            // Try profiles table as fallback (in case schema was updated)
            try {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

              if (profileError) {
                console.warn('Error fetching from profiles table too:', profileError);
              } else if (profileData) {
                setProfile(profileData);
              }
            } catch (profileError) {
              console.warn('Exception fetching from profiles table:', profileError);
            }
          } else if (userData) {
            // Successfully got user data from users table
            setProfile(userData);

            // Cache the profile data for the prompt service to use
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem(`profile_${user.id}`, JSON.stringify(userData));
              } catch (cacheError) {
                console.warn('Error caching profile to localStorage:', cacheError);
              }
            }
          }
        } catch (profileError) {
          console.warn('Exception fetching profile, but continuing:', profileError);
        }

        // Fetch today's prompt with better error handling
        try {
          console.log("Fetching today's prompt for user:", user.id);
          const promptData = await getTodaysPrompt(supabase, user.id);
          if (promptData) {
            console.log('Successfully retrieved prompt:', promptData.id);
            setPrompt(promptData);
          } else {
            console.warn('No prompt data returned, using fallback');
            // Create a fallback prompt if needed
            setPrompt({
              id: 'fallback-' + Date.now(),
              user_id: user.id,
              prompt_text: 'Spend quality time with your child today.',
              completed: false,
              favorite: false,
              date: new Date().toISOString().split('T')[0],
              created_at: new Date().toISOString(),
            });
          }
        } catch (promptError) {
          console.error("Error fetching today's prompt:", promptError);
          // Set a fallback prompt
          setPrompt({
            id: 'error-fallback-' + Date.now(),
            user_id: user.id,
            prompt_text: 'Read a book with your child today.',
            completed: false,
            favorite: false,
            date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Error in main fetchData function:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, loading]);

  const handleMarkCompleted = async () => {
    if (!prompt) return;

    try {
      await markPromptCompleted(supabase, prompt.id, !prompt.completed);
      setPrompt({ ...prompt, completed: !prompt.completed });
    } catch (error) {
      console.error('Error marking prompt as completed:', error);
    }
  };

  const handleMarkFavorite = async () => {
    if (!prompt) return;

    try {
      await markPromptFavorite(supabase, prompt.id, !prompt.favorite);
      setPrompt({ ...prompt, favorite: !prompt.favorite });
    } catch (error) {
      console.error('Error marking prompt as favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 text-sm">Loading your parenting prompts...</p>
      </div>
    );
  }

  // If we hit the loading timeout, show a fallback UI with demo content
  if (loadingTimeout || (!user && !loading)) {
    return (
      <div className="md:pl-64">
        <Navigation />
        <div className="container max-w-4xl py-8 md:py-12">
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h2 className="font-semibold text-yellow-800 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Authentication Issue
            </h2>
            <p className="mt-2 text-sm text-yellow-700">
              We're having trouble authenticating your account. You're viewing demo content.
            </p>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold">Good {getTimeOfDay()}, Dad!</h1>
            <p className="text-muted-foreground">Here's your parenting prompt for today.</p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Today's Prompt</CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xl">
                Read a book with your child today. Ask them to point out their favorite pictures and
                talk about why they like them.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Mark Complete
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <StarOff className="w-5 h-5" />
                Add to Favorites
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="md:pl-64">
      <Navigation />
      <div className="container max-w-4xl py-8 md:py-12">
        {!isUsingRealCredentials && <DebugEnv />}

        {!isUsingRealCredentials && (
          <Card className="mb-8 border-2 border-orange-300">
            <CardHeader className="bg-orange-50">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="w-5 h-5" />
                Demo Mode Active
              </CardTitle>
              <CardDescription className="text-orange-700">
                The app is running with placeholder Supabase credentials. Authentication and
                database features will not work properly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                You&apos;re seeing this message because the Supabase environment variables are not
                properly configured. The app will show demo content instead of real data.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Good {getTimeOfDay()}, {profile?.name || 'Dad'}!
          </h1>
          <p className="text-muted-foreground">Here&apos;s your parenting prompt for today.</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Today&apos;s Prompt</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl">
              {prompt?.prompt_text ||
                'Read a book with your child today. Ask them to point out their favorite pictures and talk about why they like them.'}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant={prompt?.completed ? 'default' : 'outline'}
              onClick={handleMarkCompleted}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              {prompt?.completed ? 'Completed' : 'Mark Complete'}
            </Button>
            <Button
              variant="outline"
              onClick={handleMarkFavorite}
              className="flex items-center gap-2"
            >
              {prompt?.favorite ? (
                <>
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  Favorited
                </>
              ) : (
                <>
                  <StarOff className="w-5 h-5" />
                  Add to Favorites
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generate a Bedtime Story</CardTitle>
            <CardDescription>
              Create a personalized bedtime story for {profile?.child_name || 'your child'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Need a quick bedtime story? Generate a personalized story based on{' '}
              {profile?.child_name || 'your child'}
              &apos;s interests.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <a href="/bedtime-story">Create Story</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}
