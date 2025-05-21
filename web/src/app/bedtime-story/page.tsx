"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Navigation } from "@/components/navigation"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

export default function BedtimeStoryPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [story, setStory] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)

  // In a real app, this would call the OpenAI API
  // For now, we'll simulate it with a timeout and a pre-written story
  const generateStory = async () => {
    setLoading(true)
    setStory(null)

    try {
      // Fetch user profile
      const { data: profileData, error } = await supabase.from("profiles").select("*").eq("id", user?.id).single()

      if (error) throw error
      setProfile(profileData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate a story based on the child's interests
      const interests = profileData.interests || []
      const interest = interests.length > 0 ? interests[Math.floor(Math.random() * interests.length)] : "adventure"

      const childName = profileData.child_name
      const childAge = profileData.child_age

      // Simple template-based story generation
      let generatedStory = ""

      if (interest === "reading") {
        generatedStory = `Once upon a time, there was a curious child named ${childName} who loved books more than anything. One day, ${childName} discovered a magical library where the books could talk! "Hello there," said a big blue book. "Would you like to hear my story?" ${childName} nodded excitedly. The book opened itself and suddenly, ${childName} was transported into a world of talking animals and flying ships. After many adventures, ${childName} returned home, but knew the magical library would be waiting for another visit soon. The end.`
      } else if (interest === "music") {
        generatedStory = `In a town not so far away, lived a child named ${childName} who could hear music in everything - the rain, the wind, even the quiet hum of the refrigerator. One night, ${childName} heard a new melody coming from under the bed. It was a tiny orchestra of mice, playing on miniature instruments! "Would you like to conduct us?" asked the lead mouse. ${childName} spent the night directing the most beautiful mouse symphony ever heard. When morning came, the mice were gone, but ${childName} found a tiny conductor's baton as a gift. The end.`
      } else if (interest === "outdoors") {
        generatedStory = `${childName} loved exploring the big oak tree in the backyard. One sunny afternoon, while climbing higher than ever before, ${childName} discovered a tiny door in the trunk. Knocking gently, the door opened to reveal a family of squirrels living in a cozy tree apartment! They invited ${childName} in for acorn cookies and told stories of forest adventures. From that day on, ${childName} visited the squirrel family often, learning all about nature and becoming the official human friend of the woodland creatures. The end.`
      } else {
        generatedStory = `Once upon a time, there was a brave explorer named ${childName}. One night, just before bedtime, ${childName}'s toy rocket ship began to glow. Suddenly, it grew to full size right in the bedroom! "Hop in," said a friendly voice from inside. ${childName} climbed aboard and zoomed into space, visiting stars and planets and making friends with aliens who looked like teddy bears. After an exciting adventure, the rocket brought ${childName} back home, just in time for breakfast. "See you tomorrow night," whispered the rocket, shrinking back to toy size. The end.`
      }

      setStory(generatedStory)
    } catch (error) {
      console.error("Error generating story:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="md:pl-64">
      <Navigation />
      <div className="container max-w-4xl py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Bedtime Story Generator</h1>
          <p className="text-muted-foreground">Create a personalized bedtime story for your child</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Generate a Story</CardTitle>
            <CardDescription>Click the button below to generate a personalized bedtime story</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Our story generator will create a unique story based on your child&apos;s age and interests.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={generateStory} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Story...
                </>
              ) : (
                "Generate Story"
              )}
            </Button>
          </CardFooter>
        </Card>

        {story && (
          <Card>
            <CardHeader>
              <CardTitle>Your Bedtime Story</CardTitle>
              <CardDescription>A special story for {profile?.child_name}</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea value={story} readOnly className="min-h-[300px] text-lg" />
            </CardContent>
            <CardFooter>
              <Button onClick={() => window.print()}>Print Story</Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
