'use client';

import type React from 'react';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase, getSupabaseClient } from '@/lib/supabase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

const interests = [
  { id: 'reading', label: 'Reading' },
  { id: 'music', label: 'Music' },
  { id: 'outdoors', label: 'Outdoors' },
  { id: 'sports', label: 'Sports' },
  { id: 'art', label: 'Art & Crafts' },
  { id: 'science', label: 'Science' },
  { id: 'cooking', label: 'Cooking' },
];

const timeOptions = [
  { value: 'morning', label: 'Morning (8:00 AM)' },
  { value: 'afternoon', label: 'Afternoon (2:00 PM)' },
  { value: 'evening', label: 'Evening (7:00 PM)' },
];

// Diagnostic function to test database connectivity
async function testDatabaseConnection() {
  console.log('Testing database connection...');
  try {
    // Get admin client
    const adminClient = getSupabaseClient(true);
    console.log('Admin client obtained');

    // Test connection by checking if tables exist
    console.log('Checking if users table exists...');
    const { data: usersData, error: usersError } = await adminClient
      .from('users')
      .select('count')
      .limit(1);

    console.log('Users table check result:', { data: usersData, error: usersError });

    console.log('Checking if children table exists...');
    const { data: childrenData, error: childrenError } = await adminClient
      .from('children')
      .select('count')
      .limit(1);

    console.log('Children table check result:', { data: childrenData, error: childrenError });

    // Check RLS policies
    console.log('Checking RLS policies...');
    const { data: policiesData, error: policiesError } = await adminClient
      .rpc('get_policies')
      .select('*');

    console.log('RLS policies check result:', { data: policiesData, error: policiesError });

    return {
      usersTable: !usersError,
      childrenTable: !childrenError,
      policies: policiesData,
    };
  } catch (error) {
    console.error('Database connection test failed:', error);
    return {
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export default function ProfilePage() {
  // Helper function to use default profile when no data is available
  const useDefaultProfile = () => {
    // If no localStorage data, use basic user info from auth context
    const defaultProfile = {
      id: user?.id || 'unknown',
      first_name: user?.firstName?.split(' ')[0] || '',
      last_name: user?.firstName?.split(' ').slice(1).join(' ') || '',
      child_name: '',
      child_age: 0,
      interests: [],
      preferred_time: 'morning',
    };

    setProfile(defaultProfile);
    setFormData({
      name: user?.firstName || '',
      childName: '',
      childAge: '',
      interests: [],
      preferredTime: 'morning',
    });
  };
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [diagnosisRunning, setDiagnosisRunning] = useState(false);
  const [diagnosisResults, setDiagnosisResults] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    childName: '',
    childAge: '',
    interests: [] as string[],
    preferredTime: 'morning',
  });

  // Helper function to calculate age from birthdate
  const calculateAge = (birthdate: string): number => {
    const birthDate = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Helper function to calculate birthdate from age
  const calculateBirthdate = (age: number): string => {
    const today = new Date();
    const birthYear = today.getFullYear() - age;
    return new Date(birthYear, today.getMonth(), today.getDate()).toISOString().split('T')[0];
  };

  const fetchProfile = useCallback(async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Fetch user data from users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (userError) {
          console.error('Error fetching user data:', userError);
          throw userError;
        }

        // Initialize form data with user data if available
        if (userData) {
          // Combine first_name and last_name for the name field
          const fullName = [userData.first_name, userData.last_name].filter(Boolean).join(' ');
          setProfile(userData);
          setFormData(prev => ({
            ...prev,
            name: fullName,
          }));
        }

        // Fetch child data from children table
        const { data: childData, error: childError } = await supabase
          .from('children')
          .select('*')
          .eq('user_id', user?.id || 'guest-user')
          .maybeSingle();

        if (childData) {
          setFormData(prev => ({
            ...prev,
            childName: childData.name || '',
            childAge: childData.birthdate ? calculateAge(childData.birthdate).toString() : '',
            interests: childData.interests || [],
          }));
        } else if (childError) {
          console.error('Error fetching child data:', childError);
          // Fallback to localStorage if available
          const localProfile = localStorage.getItem(`user_profile_${user.id}`);
          if (localProfile) {
            try {
              const parsedProfile = JSON.parse(localProfile);
              setFormData(prev => ({
                ...prev,
                childName: parsedProfile.child_name || '',
                childAge: parsedProfile.child_age?.toString() || '',
                interests: parsedProfile.interests || [],
                preferredTime: parsedProfile.preferred_time || 'morning',
              }));
            } catch (e) {
              console.error('Error parsing local profile:', e);
            }
          }
        }

        // If no user data was found, use default profile
        if (!userData) {
          useDefaultProfile();
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [user, fetchProfile]);

  const handleInterestChange = (id: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        interests: [...formData.interests, id],
      });
    } else {
      setFormData({
        ...formData,
        interests: formData.interests.filter(interest => interest !== id),
      });
    }
  };

  const runDiagnostics = async () => {
    setDiagnosisRunning(true);
    try {
      const results = await testDatabaseConnection();
      setDiagnosisResults(results);
      console.log('Diagnosis complete:', results);
    } catch (error) {
      console.error('Diagnosis failed:', error);
      setDiagnosisResults({ error: String(error) });
    } finally {
      setDiagnosisRunning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    console.log('Starting profile update...');

    // Use a fallback ID if user is not authenticated
    const userId = user?.id || 'guest-user';
    console.log('Using user ID:', userId);
    console.log('User authenticated, proceeding with update');

    // Declare profileData at the top level of the function
    let profileData: any = {
      id: userId,
      name: '',
      child_name: '',
      child_age: 0,
      interests: [],
      preferred_time: 'morning',
      updated_at: new Date().toISOString(),
    };

    try {

    // Save to localStorage as fallback
    try {
      localStorage.setItem(`user_profile_${userId}`, JSON.stringify(profileData));
      console.log('Saved to localStorage successfully');
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }

    // Use admin client for database operations to bypass RLS
    console.log('Getting Supabase admin client...');
    const adminClient = getSupabaseClient(true);
    console.log('Admin client:', adminClient);
    if (!adminClient) {
      console.error('Admin client not available');
      throw new Error('Admin client not available');
    }
    console.log('Admin client obtained successfully');

    // Log environment variable for service role key (masking for security)
    const srk = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
    if (srk) {
      console.log('Service role key present, starts with:', srk.slice(0, 6) + '...');
    } else {
      console.error('Service role key is missing!');
    }

    // Proceed with database operations
    console.log('Proceeding with database operations');

    // Check if service role key is available
    if (!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase service role key');
      throw new Error('Missing Supabase service role key');
    }

    try {
      // Get admin client for the update
      const adminClient = getSupabaseClient(true);
      
      if (!user?.id) {
        console.error('User is not authenticated, cannot update database');
        throw new Error('User is not authenticated');
      }

      // Split full name into first and last name
      const [firstName, ...lastNameParts] = formData.name.split(' ');
      const lastName = lastNameParts.join(' ');
      const now = new Date().toISOString();

      // Update user data in the users table
      console.log('Updating user data in users table...');
      const { data: userUpdateData, error: userUpdateError } = await adminClient
        .from('users')
        .upsert(
          {
            id: user.id,
            first_name: firstName || '',
            last_name: lastName || '',
            updated_at: now,
          },
          {
            onConflict: 'id',
            count: 'exact',
          }
        )
        .select();

      if (userUpdateError) {
        console.error('Error updating user data:', userUpdateError);
        // Continue with child updates even if user update fails
      } else {
        console.log('Successfully updated user data:', userUpdateData);
      }

      // Only update child data if child name is provided
      if (formData.childName) {
        console.log('Updating child data in children table...');
        const { data: childUpdateData, error: childUpdateError } = await adminClient
          .from('children')
          .upsert(
            {
              user_id: user.id,
              name: formData.childName,
              birthdate: formData.childAge ? calculateBirthdate(parseInt(formData.childAge, 10)) : null,
              interests: formData.interests,
              updated_at: now,
            },
            {
              onConflict: 'user_id',
              count: 'exact',
            }
          )
          .select();

        if (childUpdateError) {
          console.error('Error updating child data:', childUpdateError);
        } else {
          console.log('Successfully updated child data:', childUpdateData);
        }
      }

      // Update local state and show success message
      toast({
        title: 'Profile updated successfully',
        description: 'Your profile has been updated.',
      });

      // Refresh the profile data
      await fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error updating profile',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }

    // Handle child data in children table
    console.log('Preparing child data...');
    // User ID validation already done above
    const childData = {
      user_id: user?.id || 'guest-user',
      name: formData.childName,
      birthdate: new Date(
        new Date().setFullYear(
          new Date().getFullYear() - (Number.parseInt(formData.childAge) || 0)
        )
      ).toISOString(),
      interests: formData.interests,
    };
    console.log('Child data prepared:', childData);

    // Check if child exists using direct query instead of RPC
    console.log('Checking if child exists...');
    const { data: existingChildren, error: fetchError } = await adminClient
      .from('children')
      .select('*')
      .eq('user_id', user?.id || 'guest-user')
      .limit(1);

    if (fetchError) {
      console.error('Error fetching child:', fetchError);
      throw fetchError;
    }
    console.log('Child check complete, found:', existingChildren?.length || 0, 'children');

    let childError = null;
    if (existingChildren && existingChildren.length > 0) {
      // Update existing child using direct query
      console.log('Updating existing child...');
      const { error } = await adminClient
        .from('children')
        .update({
          name: childData.name,
          birthdate: childData.birthdate,
          interests: childData.interests,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingChildren[0].id);

      childError = error;
      if (!error) {
        console.log('Child updated successfully');
      }
    } else {
      // Create new child using direct insert
      console.log('Creating new child...');
      const { error } = await adminClient.from('children').insert({
        user_id: user?.id || 'guest-user',
        name: childData.name,
        birthdate: childData.birthdate,
        interests: childData.interests,
      });

      childError = error;
      if (!error) {
        console.log('Child created successfully');
      }
    }

    if (childError) {
      console.error('Error updating child data:', childError);
      throw childError;
    }

    // Assign profileData in try block
    profileData = {
      id: userId,
      name: formData.name,
      child_name: formData.childName,
      child_age: Number.parseInt(formData.childAge) || 0,
      interests: formData.interests,
      preferred_time: formData.preferredTime,
      updated_at: new Date().toISOString(),
    };

    // Upsert profile data into profiles table
    const profileUpsertPayload = {
      id: user?.id || 'guest-user',
      name: formData.name,
      child_name: formData.childName,
      child_age: Number.parseInt(formData.childAge) || 0,
      interests: formData.interests,
      preferred_time: formData.preferredTime,
      updated_at: new Date().toISOString(),
    };
    console.log('Profile upsert payload:', profileUpsertPayload);
    const { error: profileError, data: profileUpsertData } = await adminClient
      .from('users')
      .upsert(profileUpsertPayload, { onConflict: 'id' });
    if (profileError) {
      console.error('Error upserting profile:', profileError);
      throw profileError;
    } else {
      console.log('Profile upserted successfully:', profileUpsertData);
    }

    // Success - show toast notification
    toast({
      title: 'Profile updated',
      description: 'Your profile has been updated successfully.',
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    // Check if the admin client is properly initialized
    try {
      const adminClient = getSupabaseClient(true);
      console.log('Admin client check:', adminClient ? 'Available' : 'Not available');

      // Check if we can make a simple query using an async IIFE
      (async () => {
        try {
          const result = await adminClient.from('users').select('count').limit(1);
          console.log('Test query result:', result);
        } catch (queryError: unknown) {
          console.error('Test query error:', queryError);
        }
      })(); // Invoke the async function immediately
    } catch (clientError) {
      console.error('Error checking admin client:', clientError);
    }

    // Use a fallback ID if user is not authenticated
    const fallbackId = user?.id || 'guest-user';

    // Save to localStorage as fallback
    try {
      localStorage.setItem(`user_profile_${fallbackId}`, JSON.stringify(profileData));
      toast({
        title: 'Profile saved locally',
        description:
          "Your profile has been saved to your device, but couldn't be fully updated in the database.",
        variant: 'default',
      });
    } catch (e) {
      console.error('Error saving to localStorage:', e);
      toast({
        title: 'Error',
        description:
          "There was an error updating your profile and we couldn't save to local storage.",
        variant: 'destructive',
      });
    }
  } finally {
    setSaving(false);
  }
};

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="md:pl-64">
      {/* Navigation component has been removed as it's not defined */}

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
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="childName">Child&apos;s Name</Label>
                  <Input
                    id="childName"
                    value={formData.childName}
                    onChange={e => setFormData({ ...formData, childName: e.target.value })}
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
                    onChange={e => setFormData({ ...formData, childAge: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Interests (Select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {interests.map(interest => (
                      <div key={interest.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={interest.id}
                          checked={formData.interests.includes(interest.id)}
                          onCheckedChange={checked =>
                            handleInterestChange(interest.id, checked as boolean)
                          }
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
                    onValueChange={value => setFormData({ ...formData, preferredTime: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={runDiagnostics}
                  disabled={diagnosisRunning}
                  className="text-sm"
                >
                  {diagnosisRunning ? 'Running Tests...' : 'Test Database Connection'}
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>

              {diagnosisResults && (
                <div className="mt-4 p-4 border rounded-md bg-slate-50">
                  <h3 className="font-medium mb-2">Database Diagnosis Results:</h3>
                  <pre className="text-xs overflow-auto p-2 bg-slate-100 rounded">
                    {JSON.stringify(diagnosisResults, null, 2)}
                  </pre>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}