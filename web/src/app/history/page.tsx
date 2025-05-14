"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { getPromptHistory, markPromptCompleted, markPromptFavorite } from "@/lib/prompt-service"
import { CheckCircle, Star, StarOff } from "lucide-react"

export default function HistoryPage() {
  const { user } = useAuth()
  const [prompts, setPrompts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPrompts = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const promptsData = await getPromptHistory(user.id)
        setPrompts(promptsData)
      } catch (error) {
        console.error("Error fetching prompts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrompts()
  }, [user])

  const handleMarkCompleted = async (promptId: string, completed: boolean) => {
    try {
      await markPromptCompleted(promptId, completed)
      setPrompts(prompts.map((p) => (p.id === promptId ? { ...p, completed } : p)))
    } catch (error) {
      console.error("Error marking prompt as completed:", error)
    }
  }

  const handleMarkFavorite = async (promptId: string, favorite: boolean) => {
    try {
      await markPromptFavorite(promptId, favorite)
      setPrompts(prompts.map((p) => (p.id === promptId ? { ...p, favorite } : p)))
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Prompt History</h1>
          <p className="text-muted-foreground">View all your previous parenting prompts</p>
        </div>

        {prompts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No prompts in your history yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {prompts.map((prompt) => (
              <Card key={prompt.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {new Date(prompt.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{prompt.prompt_text}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant={prompt.completed ? "default" : "outline"}
                    onClick={() => handleMarkCompleted(prompt.id, !prompt.completed)}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {prompt.completed ? "Completed" : "Mark Complete"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleMarkFavorite(prompt.id, !prompt.favorite)}
                    className="flex items-center gap-2"
                  >
                    {prompt.favorite ? (
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
