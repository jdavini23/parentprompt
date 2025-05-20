"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { getFavoritePrompts, markPromptFavorite } from "@/lib/prompt-service"
import { Star } from "lucide-react"

export default function FavoritesPage() {
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
        const promptsData = await getFavoritePrompts(user.id)
        setPrompts(promptsData)
      } catch (error) {
        console.error("Error fetching prompts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrompts()
  }, [user])

  const handleRemoveFavorite = async (promptId: string) => {
    try {
      await markPromptFavorite(promptId, false)
      setPrompts(prompts.filter((p) => p.id !== promptId))
    } catch (error) {
      console.error("Error removing from favorites:", error)
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
          <h1 className="text-3xl font-bold">Favorite Prompts</h1>
          <p className="text-muted-foreground">Your collection of favorite parenting prompts</p>
        </div>

        {prompts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                No favorite prompts yet. Mark prompts as favorites to see them here.
              </p>
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
                <CardFooter className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => handleRemoveFavorite(prompt.id)}
                    className="flex items-center gap-2"
                  >
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    Remove from Favorites
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
