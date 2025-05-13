import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

/**
 * Creates a Supabase admin client with service role key for server-side operations
 * that require elevated privileges. This should ONLY be used in server-side code.
 * 
 * @returns Supabase client with admin privileges
 */
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase URL or service role key');
  }
  
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

/**
 * Formats a date object or string to a human-readable format
 * 
 * @param date Date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Calculates a child's age in years and months
 * 
 * @param birthdate Child's birthdate
 * @returns Object containing years and months
 */
export const calculateAge = (birthdate: Date | string): { years: number; months: number } => {
  const birth = typeof birthdate === 'string' ? new Date(birthdate) : birthdate;
  const now = new Date();
  
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  return { years, months };
};

/**
 * Determines the age group of a child based on their birthdate
 * 
 * @param birthdate Child's birthdate
 * @returns Age group string
 */
export const determineAgeGroup = (birthdate: Date | string): string => {
  const { years, months } = calculateAge(birthdate);
  
  if (years === 0 && months <= 6) return 'infant-0-6m';
  if (years === 0) return 'infant-6-12m';
  if (years === 1) return 'toddler-1y';
  if (years === 2) return 'toddler-2y';
  if (years >= 3 && years <= 5) return 'preschool';
  if (years >= 6 && years <= 12) return 'school-age';
  return 'teen';
};

/**
 * Generates a list of age-appropriate prompts for a child
 * 
 * @param supabase Supabase client
 * @param childId Child ID
 * @param limit Maximum number of prompts to return
 * @returns Array of prompts
 */
export const getAgeAppropriatePrompts = async (
  supabase: ReturnType<typeof createClient<Database>>,
  childId: string,
  limit: number = 5
) => {
  // Get the child's information
  const { data: child, error: childError } = await supabase
    .from('children')
    .select('*')
    .eq('id', childId)
    .single();
  
  if (childError || !child) {
    throw new Error('Child not found');
  }
  
  // Determine the child's age group
  const ageGroup = determineAgeGroup(child.birthdate);
  
  // Get prompts appropriate for the child's age and interests
  const { data: prompts, error: promptsError } = await supabase
    .from('prompts')
    .select('*')
    .contains('age_range', [ageGroup])
    .limit(limit);
  
  if (promptsError) {
    throw new Error('Error fetching prompts');
  }
  
  return prompts;
};
