import { Database } from '@/lib/supabase';
import { getSupabaseClient } from '@/lib/supabase';

/**
 * Helper function to update or create a user record in the users table
 * @param userData Object containing user data to update
 * @returns Promise with success status and optional error
 */
export async function updateUserRecord(userData: {
  id: string;
  first_name: string;
  last_name: string;
  updated_at: string;
}): Promise<{ success: boolean; error?: any }> {
  try {
    const adminClient = getSupabaseClient(true);
    const { error } = await adminClient
      .from('users')
      .upsert(userData, { onConflict: 'id' });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating user record:', error);
    return { success: false, error };
  }
}

/**
 * Helper function to update or create a child record in the children table
 * @param childData Object containing child data to update
 * @param userId The ID of the associated user
 * @returns Promise with success status and optional error
 */
export async function upsertChildRecord(
  childData: {
    user_id: string;
    name: string;
    birthdate: string | null;
    interests: string[];
    updated_at: string;
  },
  userId: string
): Promise<{ success: boolean; error?: any }> {
  try {
    const adminClient = getSupabaseClient(true);

    // Check if child record exists
    const { data: existingChild, error: selectError } = await adminClient
      .from('children')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (selectError) throw selectError;

    let operationError;
    if (existingChild) {
      // Update existing child
      const { error } = await adminClient
        .from('children')
        .update(childData)
        .eq('id', existingChild.id);
      operationError = error;
    } else {
      // Insert new child
      const { error } = await adminClient
        .from('children')
        .insert(childData);
      operationError = error;
    }

    if (operationError) throw operationError;
    return { success: true };
  } catch (error) {
    console.error('Error upserting child record:', error);
    return { success: false, error };
  }
}

/**
 * Helper function to calculate birthdate from age
 * @param age Age in years
 * @returns ISO string representation of birthdate
 */
export function calculateBirthdate(age: number): string {
  const today = new Date();
  const birthYear = today.getFullYear() - age;
  return new Date(birthYear, today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0];
}
