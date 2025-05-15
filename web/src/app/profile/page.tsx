"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Navigation } from "@/components/navigation"
import { supabase } from "@/lib/supabase"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"

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

export default function ProfilePage() {
  // Helper function to use default profile when no data is available
  const useDefaultProfile = () => {
    // If no localStorage data, use basic user info from auth context
    const defaultProfile = {
      id: user?.id || 'unknown',
      name: user?.firstName || '',
      child_name: '',
      child_age: 0,
      interests: [],
      preferred_time: 'morning'
    }
    
    setProfile(defaultProfile)
    setFormData({
      name: user?.firstName || '',
      childName: '',
      childAge: '',
      interests: [],
      preferredTime: 'morning',
    })
  }
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    childName: "",
    childAge: "",
    interests: [] as string[],
    preferredTime: "morning",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Try to fetch from users table (correct table according to schema)
        // Use maybeSingle() instead of single() to handle the case when no rows are found
        const { data, error } = await supabase.from("users").select("*").eq("id", user.id).maybeSingle()

        if (error) {
          console.error("Error fetching profile:", error)
        
          // Fallback to localStorage if available
          const localProfile = localStorage.getItem(`user_profile_${user.id}`)
          if (localProfile) {
            try {
              const parsedProfile = JSON.parse(localProfile)
              setProfile(parsedProfile)
              setFormData({
                name: parsedProfile.name || user.firstName || "",
                childName: parsedProfile.child_name || "",
                childAge: parsedProfile.child_age?.toString() || "",
                interests: parsedProfile.interests || [],
                preferredTime: parsedProfile.preferred_time || "morning",
              })
            } catch (e) {
              console.error("Error parsing local profile:", e)
              useDefaultProfile()
            }
          } else {
            useDefaultProfile()
          }
        } else if (data) { // No Supabase error, and data is truthy (record found in 'users' table)
          setProfile(data);
          setFormData({
            name: data.first_name || '', // Use first_name from 'users' table.
            // Fields below are not strictly in 'users' table as per memory, provide fallbacks
            childName: data.child_name || '', 
            childAge: data.child_age != null ? data.child_age.toString() : '', 
            interests: data.interests || [], 
            preferredTime: data.preferred_time || 'morning', 
          });
        } else { // No Supabase error, and data is null (no record in 'users' table for this user.id)
          console.log(`No profile found in 'users' table for user ID: ${user?.id}. Checking localStorage.`);
          const localProfile = localStorage.getItem(`user_profile_${user?.id}`);
          if (localProfile) {
            try {
              const parsedProfile = JSON.parse(localProfile);
              setProfile(parsedProfile); // localStorage data might have all fields
              setFormData({
                name: parsedProfile.name || (user && user.firstName) || '', // Prefer localStorage name, then auth user.firstName
                childName: parsedProfile.child_name || '',
                childAge: parsedProfile.child_age?.toString() || '',
                interests: parsedProfile.interests || [],
                preferredTime: parsedProfile.preferred_time || 'morning',
              });
            } catch (e) {
              console.error("Error parsing local profile:", e);
              useDefaultProfile(); // Fallback to default profile settings
            }
          } else {
            // No DB record, no localStorage record
            useDefaultProfile(); // Fallback to default profile settings
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

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
    setSaving(true)

    try {
      if (!user) throw new Error("User not authenticated")

      // Save to localStorage as a fallback
      const profileData = {
        id: user.id,
        name: formData.name,
        child_name: formData.childName,
        child_age: Number.parseInt(formData.childAge) || 0,
        interests: formData.interests,
        preferred_time: formData.preferredTime,
        updated_at: new Date().toISOString()
      }
      
      try {
        localStorage.setItem(`user_profile_${user.id}`, JSON.stringify(profileData))
      } catch (e) {
        console.error("Error saving to localStorage:", e)
      }
      
      // Try to upsert in Supabase users table (create if not exists, update if exists)
      const { error } = await supabase
        .from("users")
        .upsert({
          id: user.id, // Include ID for upsert
          name: formData.name,
          child_name: formData.childName,
          child_age: Number.parseInt(formData.childAge) || 0,
          interests: formData.interests,
          preferred_time: formData.preferredTime,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error("Error updating profile:", error)
        
        toast({
          title: "Profile saved locally",
          description: "Your profile has been saved to your device, but couldn't be updated in the database.",
          variant: "default",
        })
      } else {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "There was an error updating your profile.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
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
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">Update your profile and preferences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
            <CardDescription>Update your personal information and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
