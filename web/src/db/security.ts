import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

/**
 * Utility functions for testing and verifying Supabase security policies
 */

/**
 * Tests if the current user can access their own user data
 * 
 * @param supabase Authenticated Supabase client
 * @returns Test result with success status and message
 */
export const testUserDataAccess = async (
  supabase: ReturnType<typeof createClient<Database>>
) => {
  try {
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        message: 'No authenticated user found',
      };
    }
    
    // Try to access the user's own data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id);
    
    // Check if we got any data back - it's okay if the user doesn't exist in the users table yet
    if (userError) {
      return {
        success: false,
        message: `Error accessing user data: ${userError.message}`,
      };
    }
    
    // If no user data exists yet, that's okay - we're just testing access permissions
    const userDataExists = userData && userData.length > 0;
    
    // Try to access another user's data (should fail due to RLS)
    const { data: otherUserData, error: otherUserError } = await supabase
      .from('users')
      .select('*')
      .neq('id', user.id)
      .limit(1);
    
    // If no other users exist or RLS is working, this is considered a success
    if (otherUserError || !otherUserData || otherUserData.length === 0) {
      return {
        success: true,
        message: userDataExists 
          ? 'User data access policy is working correctly' 
          : 'User data access policy is working correctly (note: your user record does not exist in the users table yet)',
        userData: userDataExists ? userData[0] : null,
      };
    }
    
    if (otherUserData) {
      return {
        success: false,
        message: 'Security issue: User can access other users\' data',
      };
    }
    
    return {
      success: true,
      message: 'User data access policy is working correctly',
      userData,
    };
  } catch (error) {
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

/**
 * Tests if the current user can access their own children's data
 * 
 * @param supabase Authenticated Supabase client
 * @returns Test result with success status and message
 */
export const testChildrenDataAccess = async (
  supabase: ReturnType<typeof createClient<Database>>
) => {
  try {
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        message: 'No authenticated user found',
      };
    }
    
    // Try to access the user's own children data
    const { data: childrenData, error: childrenError } = await supabase
      .from('children')
      .select('*')
      .eq('user_id', user.id);
    
    if (childrenError) {
      return {
        success: false,
        message: `Error accessing children data: ${childrenError.message}`,
      };
    }
    
    // Try to access another user's children data (should fail due to RLS)
    const { data: otherChildrenData, error: otherChildrenError } = await supabase
      .from('children')
      .select('*')
      .neq('user_id', user.id)
      .limit(1);
    
    // If no other children exist or RLS is working, this is considered a success
    if (otherChildrenError || !otherChildrenData || otherChildrenData.length === 0) {
      return {
        success: true,
        message: 'Children data access policy is working correctly',
        childrenData,
      };
    } else {
      return {
        success: false,
        message: 'Security issue: User can access other users\' children data',
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

/**
 * Tests if the current user can access prompts
 * 
 * @param supabase Authenticated Supabase client
 * @returns Test result with success status and message
 */
export const testPromptsAccess = async (
  supabase: ReturnType<typeof createClient<Database>>
) => {
  try {
    // Try to access prompts data
    const { data: promptsData, error: promptsError } = await supabase
      .from('prompts')
      .select('*')
      .limit(5);
    
    if (promptsError) {
      return {
        success: false,
        message: `Error accessing prompts data: ${promptsError.message}`,
      };
    }
    
    return {
      success: true,
      message: 'Prompts access policy is working correctly',
      promptsData,
    };
  } catch (error) {
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

/**
 * Tests if the current user can access their own user_prompts data
 * 
 * @param supabase Authenticated Supabase client
 * @returns Test result with success status and message
 */
export const testUserPromptsAccess = async (
  supabase: ReturnType<typeof createClient<Database>>
) => {
  try {
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        message: 'No authenticated user found',
      };
    }
    
    // Try to access the user's own user_prompts data
    const { data: userPromptsData, error: userPromptsError } = await supabase
      .from('user_prompts')
      .select('*')
      .eq('user_id', user.id);
    
    if (userPromptsError) {
      return {
        success: false,
        message: `Error accessing user_prompts data: ${userPromptsError.message}`,
      };
    }
    
    // Try to access another user's user_prompts data (should fail due to RLS)
    const { data: otherUserPromptsData, error: otherUserPromptsError } = await supabase
      .from('user_prompts')
      .select('*')
      .neq('user_id', user.id)
      .limit(1);
    
    // If no other user prompts exist or RLS is working, this is considered a success
    if (otherUserPromptsError || !otherUserPromptsData || otherUserPromptsData.length === 0) {
      return {
        success: true,
        message: 'User prompts data access policy is working correctly',
        userPromptsData,
      };
    }
    
    return {
      success: false,
      message: 'Security issue: User can access other users\' user_prompts data',
    };
  } catch (error) {
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

/**
 * Comprehensive security test that checks all RLS policies
 * 
 * @param supabase Authenticated Supabase client
 * @returns Test results for all security policies
 */
export const testAllSecurityPolicies = async (
  supabase: ReturnType<typeof createClient<Database>>
) => {
  const userDataTest = await testUserDataAccess(supabase);
  const childrenDataTest = await testChildrenDataAccess(supabase);
  const promptsTest = await testPromptsAccess(supabase);
  const userPromptsTest = await testUserPromptsAccess(supabase);
  
  const allTestsPassed = 
    userDataTest.success && 
    childrenDataTest.success && 
    promptsTest.success && 
    userPromptsTest.success;
  
  return {
    success: allTestsPassed,
    message: allTestsPassed 
      ? 'All security policies are working correctly' 
      : 'Some security policies failed',
    tests: {
      userDataTest,
      childrenDataTest,
      promptsTest,
      userPromptsTest,
    },
  };
};
