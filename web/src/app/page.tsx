"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { getTodaysPrompt, markPromptCompleted, markPromptFavorite } from "@/lib/prompt-service"
import { CheckCircle, Star, StarOff, AlertTriangle } from "lucide-react"
import { supabase, isUsingRealCredentials } from "@/lib/supabase"
import { DebugEnv } from "@/components/debug-env"

export default function HomePage() {
  const { user } = useAuth()
  const [prompt, setPrompt] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [showDebug, setShowDebug] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Fetch user profile
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        setProfile(profileData)

        // Fetch today's prompt
        const promptData = await getTodaysPrompt(user.id)
        setPrompt(promptData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const handleMarkCompleted = async () => {
    if (!prompt) return

    try {
      await markPromptCompleted(prompt.id, !prompt.completed)
      setPrompt({ ...prompt, completed: !prompt.completed })
    } catch (error) {
      console.error("Error marking prompt as completed:", error)
    }
  }

  const handleMarkFavorite = async () => {
    if (!prompt) return

    try {
      await markPromptFavorite(prompt.id, !prompt.favorite)
      setPrompt({ ...prompt, favorite: !prompt.favorite })
    } catch (error) {
      console.error("Error marking prompt as favorite:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
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
                The app is running with placeholder Supabase credentials. Authentication and database features will not
                work properly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                You&apos;re seeing this message because the Supabase environment variables are not properly configured.
                The app will show demo content instead of real data.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Good {getTimeOfDay()}, {profile?.name || "Dad"}!
          </h1>
          <p className="text-muted-foreground">Here&apos;s your parenting prompt for today.</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Today&apos;s Prompt</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl">
              {prompt?.prompt_text ||
                "Read a book with your child today. Ask them to point out their favorite pictures and talk about why they like them."}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant={prompt?.completed ? "default" : "outline"}
              onClick={handleMarkCompleted}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              {prompt?.completed ? "Completed" : "Mark Complete"}
            </Button>
            <Button variant="outline" onClick={handleMarkFavorite} className="flex items-center gap-2">
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
              Create a personalized bedtime story for {profile?.child_name || "your child"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Need a quick bedtime story? Generate a personalized story based on {profile?.child_name || "your child"}
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
  )
}

function getTimeOfDay() {
  const hour = new Date().getHours()
  if (hour < 12) return "morning"
  if (hour < 18) return "afternoon"
  return "evening"
}
