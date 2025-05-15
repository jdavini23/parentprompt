import { supabase, isUsingRealCredentials } from "./supabase"
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
        "Teach {childName} a simple card game or board game appropriate for their age.",
]

// Get a random prompt from the bank
function getRandomPrompt(profile: any): string {
  // Choose a random prompt from the bank
  const randomIndex = Math.floor(Math.random() * promptBank.length)
  let promptText = promptBank[randomIndex]

  // Replace placeholders with actual values if available
  if (profile) {
    // Try to get child name from different possible structures
    const childName = getChildNameFromProfile(profile);
    promptText = promptText.replace(/{childName}/g, childName || "your child")
  }

  return promptText
}

// Helper function to extract child name from different profile structures
function getChildNameFromProfile(profile: any): string {
  // If profile has children array with at least one child
  if (profile.children && Array.isArray(profile.children) && profile.children.length > 0) {
    return profile.children[0].name;
  }
  
  // If profile has child_name directly (old structure)
  if (profile.child_name) {
    return profile.child_name;
  }
  
  // If we have first_name, use that as a fallback
  if (profile.first_name) {
    return profile.first_name + "'s child";
  }
  
  return "your child";
}

// Get today's prompt for a user
export async function getTodaysPrompt(userId: string): Promise<Prompt | null> {
  try {
    if (!userId) {
      console.error("getTodaysPrompt called without a valid userId");
      return generateLocalPrompt(userId);
    }

    const today = new Date().toISOString().split("T")[0];
    
    // Check if we're using real credentials before attempting database operations
    if (!isUsingRealCredentials) {
      console.log("Using development mode with placeholder credentials - returning local prompt");
      return generateLocalPrompt(userId);
    }

    // Try to get a cached prompt from localStorage first (browser only)
    if (typeof window !== 'undefined') {
      try {
        const cachedPromptJson = localStorage.getItem(`prompt_${userId}_${today}`);
        if (cachedPromptJson) {
          const cachedPrompt = JSON.parse(cachedPromptJson);
          console.log("Using cached prompt from localStorage");
          return cachedPrompt;
        }
      } catch (cacheError) {
        console.warn("Error accessing localStorage:", cacheError);
      }
    }

    // Use a safe try/catch for all database operations
    try {
      // Check if there's already a prompt for today
      const { data: existingPrompt, error: fetchError } = await supabase
        .from("prompts")
        .select("*")
        .eq("user_id", userId)
        .eq("date", today)
        .maybeSingle();

      // If there's an error or no prompt, don't try further database operations
      if (fetchError) {
        console.warn("Error fetching existing prompt, using local prompt:", fetchError);
        return generateAndCacheLocalPrompt(userId);
      }

      // If there's already a prompt for today, return it
      if (existingPrompt) {
        // Cache it in localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`prompt_${userId}_${today}`, JSON.stringify(existingPrompt));
          } catch (cacheError) {
            console.warn("Error caching prompt to localStorage:", cacheError);
          }
        }
        return existingPrompt;
      }

      // Get a random prompt text
      const promptText = getRandomPromptText(userId);
      
      // Try to save the new prompt - but be prepared for it to fail
      try {
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
          .maybeSingle();

        if (insertError || !newPrompt) {
          console.warn("Error creating prompt in database, using local prompt:", insertError || "No data returned");
          return generateAndCacheLocalPrompt(userId, promptText);
        }

        // Cache successful prompt in localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`prompt_${userId}_${today}`, JSON.stringify(newPrompt));
          } catch (cacheError) {
            console.warn("Error caching prompt to localStorage:", cacheError);
          }
        }

        return newPrompt;
      } catch (insertError) {
        console.warn("Exception during prompt creation, using local prompt:", insertError);
        return generateAndCacheLocalPrompt(userId, promptText);
      }
    } catch (dbError) {
      console.warn("Database operation failed, using local prompt:", dbError);
      return generateAndCacheLocalPrompt(userId);
    }
  } catch (error) {
    console.error("Unexpected error in getTodaysPrompt:", error);
    return generateLocalPrompt(userId);
  }
}

// Helper function to generate a random prompt text
function getRandomPromptText(userId: string): string {
  // Try to get user profile for personalized prompts, but don't worry if it fails
  let profile;
  try {
    // This is intentionally synchronous - we're just checking if we already have profile data
    // from a previous fetch in the current session
    if (typeof window !== 'undefined') {
      const cachedProfileJson = localStorage.getItem(`profile_${userId}`);
      if (cachedProfileJson) {
        profile = JSON.parse(cachedProfileJson);
      }
    }
  } catch (profileError) {
    console.warn("Error getting cached profile:", profileError);
  }
  
  // Generate a prompt text with or without profile data
  return profile ? getRandomPrompt(profile) : promptBank[Math.floor(Math.random() * promptBank.length)];
}

// Helper function to generate and cache a local prompt
function generateAndCacheLocalPrompt(userId: string, promptText?: string): Prompt {
  const prompt = generateLocalPrompt(userId, promptText);
  
  // Cache in localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`prompt_${userId}_${prompt.date}`, JSON.stringify(prompt));
    } catch (cacheError) {
      console.warn("Error caching local prompt to localStorage:", cacheError);
    }
  }
  
  return prompt;
}

// Helper function to generate a local prompt
function generateLocalPrompt(userId: string, promptText?: string): Prompt {
  const today = new Date().toISOString().split("T")[0];
  const text = promptText || promptBank[Math.floor(Math.random() * promptBank.length)];
  
  return {
    id: "local-" + Date.now(),
    user_id: userId,
    prompt_text: text,
    completed: false,
    favorite: false,
    date: today,
    created_at: new Date().toISOString(),
  } as Prompt;
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
