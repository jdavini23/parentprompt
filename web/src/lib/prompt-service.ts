import { supabase } from "./supabase"
import type { Database } from "./supabase"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type Prompt = Database["public"]["Tables"]["prompts"]["Row"]

// Sample prompt bank
const promptBank = [
  "Read a book with {childName} today. Ask them to point out their favorite pictures and talk about why they like them.",
  "Sing {childName}'s favorite song together and make up silly dance moves.",
  "Take {childName} outside and look for bugs or interesting plants. Talk about what you find.",
  "Build a fort with {childName} using blankets and pillows. Read a story inside your new special place.",
  "Cook a simple snack with {childName}. Let them help mix ingredients and talk about how things change when they're combined.",
  "Have a 'color hunt' with {childName}. Pick a color and find objects of that color around your home.",
  "Play 'follow the leader' with {childName}, taking turns being the leader.",
  "Draw pictures together and tell stories about what you've drawn.",
  "Create a simple obstacle course for {childName} using household items.",
  "Teach {childName} a simple card game or board game appropriate for their age.",
]

// Get a random prompt from the bank
function getRandomPrompt(profile: Profile): string {
  const randomIndex = Math.floor(Math.random() * promptBank.length)
  let prompt = promptBank[randomIndex]

  // Replace placeholders with actual values
  prompt = prompt.replace(/{childName}/g, profile.child_name)

  return prompt
}

// Get today's prompt for a user
export async function getTodaysPrompt(userId: string): Promise<Prompt | null> {
  const today = new Date().toISOString().split("T")[0]

  // Check if there's already a prompt for today
  const { data: existingPrompt, error: fetchError } = await supabase
    .from("prompts")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .single()

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Error fetching today's prompt:", fetchError)
    return null
  }

  // If there's already a prompt for today, return it
  if (existingPrompt) {
    return existingPrompt
  }

  // Otherwise, create a new prompt
  // First, get the user's profile
  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (profileError) {
    console.error("Error fetching user profile:", profileError)
    return null
  }

  // Generate a new prompt
  const promptText = getRandomPrompt(profile)

  // Save the new prompt
  const { data: newPrompt, error: insertError } = await supabase
    .from("prompts")
    .insert({
      user_id: userId,
      prompt_text: promptText,
      completed: false,
      favorite: false,
      date: today,
    })
    .select()
    .single()

  if (insertError) {
    console.error("Error creating new prompt:", insertError)
    return null
  }

  return newPrompt
}

// Mark a prompt as completed
export async function markPromptCompleted(promptId: string, completed: boolean): Promise<void> {
  const { error } = await supabase.from("prompts").update({ completed }).eq("id", promptId)

  if (error) {
    console.error("Error marking prompt as completed:", error)
    throw error
  }
}

// Mark a prompt as favorite
export async function markPromptFavorite(promptId: string, favorite: boolean): Promise<void> {
  const { error } = await supabase.from("prompts").update({ favorite }).eq("id", promptId)

  if (error) {
    console.error("Error marking prompt as favorite:", error)
    throw error
  }
}

// Get prompt history for a user
export async function getPromptHistory(userId: string): Promise<Prompt[]> {
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching prompt history:", error)
    return []
  }

  return data || []
}

// Get favorite prompts for a user
export async function getFavoritePrompts(userId: string): Promise<Prompt[]> {
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("user_id", userId)
    .eq("favorite", true)
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching favorite prompts:", error)
    return []
  }

  return data || []
}
