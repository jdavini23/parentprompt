"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const interests = [
  { id: "reading", label: "Reading" },
  { id: "music", label: "Music" },
  { id: "outdoors", label: "Outdoors" },
  { id: "sports", label: "Sports" },
  { id: "art", label: "Art & Crafts" },
  { id: "science", label: "Science" },
  { id: "cooking", label: "Cooking" },
]

const timeOptions = [
  { value: "morning", label: "Morning (8:00 AM)" },
  { value: "afternoon", label: "Afternoon (2:00 PM)" },
  { value: "evening", label: "Evening (7:00 PM)" },
]

export default function OnboardingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    childName: "",
    childAge: "",
    interests: [] as string[],
    preferredTime: "morning",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInterestChange = (id: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        interests: [...formData.interests, id],
      })
    } else {
      setFormData({
        ...formData,
        interests: formData.interests.filter((interest) => interest !== id),
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!user) throw new Error("User not authenticated")

      // Save profile data to Supabase
      const { error } = await supabase.from("profiles").insert({
        id: user.id,
        name: formData.name,
        child_name: formData.childName,
        child_age: Number.parseInt(formData.childAge),
        interests: formData.interests,
        preferred_time: formData.preferredTime,
      })

      if (error) throw error

      // Redirect to home page
      router.push("/")
    } catch (err) {
      console.error(err)
      setError("Error saving profile data")
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    setStep(step + 1)
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome to ParentPrompt</CardTitle>
          <CardDescription className="text-center">
            Let&apos;s set up your profile to personalize your experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <Button type="button" onClick={nextStep} className="w-full">
                  Next
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="childName">Child&apos;s Name</Label>
                  <Input
                    id="childName"
                    value={formData.childName}
                    onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="childAge">Child&apos;s Age (in years)</Label>
                  <Input
                    id="childAge"
                    type="number"
                    min="0"
                    max="18"
                    value={formData.childAge}
                    onChange={(e) => setFormData({ ...formData, childAge: e.target.value })}
                    required
                  />
                </div>
                <div className="flex justify-between">
                  <Button type="button" onClick={prevStep} variant="outline">
                    Back
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Next
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Interests (Select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {interests.map((interest) => (
                      <div key={interest.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={interest.id}
                          checked={formData.interests.includes(interest.id)}
                          onCheckedChange={(checked) => handleInterestChange(interest.id, checked as boolean)}
                        />
                        <Label htmlFor={interest.id} className="text-sm">
                          {interest.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button type="button" onClick={prevStep} variant="outline">
                    Back
                  </Button>
                  <Button type="button" onClick={nextStep}>
                    Next
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="preferredTime">Preferred Time to Receive Prompts</Label>
                  <Select
                    value={formData.preferredTime}
                    onValueChange={(value) => setFormData({ ...formData, preferredTime: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {error && <p className="text-sm font-medium text-red-500">{error}</p>}
                <div className="flex justify-between">
                  <Button type="button" onClick={prevStep} variant="outline">
                    Back
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Complete Setup"}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
