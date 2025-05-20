'use client';

import type React from 'react';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/auth-provider';
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
    // Get first and last name from user_metadata
    const firstName = user?.user_metadata?.first_name || '';
    const lastName = user?.user_metadata?.last_name || '';
    
    // If no localStorage data, use basic user info from auth context
    const defaultProfile = {
      id: user?.id || 'unknown',
      first_name: firstName,
      last_name: lastName,
      child_name: '',
      child_age: 0,
      interests: [],
      preferred_time: 'morning',
    };

    setProfile(defaultProfile);
    setFormData({
      name: `${firstName} ${lastName}`.trim(),
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

    // Prepare profile data for storage
    const profileData = {
      id: userId,
      name: formData.name,
      child_name: formData.childName,
      child_age: Number.parseInt(formData.childAge) || 0,
      interests: formData.interests,
      preferred_time: formData.preferredTime,
      updated_at: new Date().toISOString(),
    };

    try {
      // Always save to localStorage first as a reliable fallback
      try {
        localStorage.setItem(`user_profile_${userId}`, JSON.stringify(profileData));
        console.log('Saved to localStorage successfully');
      } catch (e) {
        console.error('Error saving to localStorage:', e);
        toast({
          title: 'Error',
          description: 'Could not save your profile locally.',
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }
      
      // Attempt to use database if user is authenticated
      if (user?.id) {
        try {
          // Get admin client for database operations
        console.log('Getting Supabase admin client...');
        const adminClient = getSupabaseClient(true);
        
        if (!adminClient) {
          throw new Error('Admin client not available');
        }

        // Split full name into first and last name
        const [firstName, ...lastNameParts] = formData.name.split(' ');
        const lastName = lastNameParts.join(' ');
        
        // Try to update user data
        try {
          console.log('Updating user data in users table...');
          const { error: userUpdateError } = await adminClient
            .from('users')
            .upsert(
              {
                id: user.id,
                first_name: firstName || '',
                last_name: lastName || '',
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'id' }
            );

          if (userUpdateError) {
            console.error('Error updating user data:', userUpdateError);
          } else {
            console.log('Successfully updated user data');
          }
        } catch (userError) {
          console.error('Exception updating user:', userError);
          // Continue with child updates even if user update fails
        }

        // Try to update child data
        if (formData.childName) {
          try {
            console.log('Updating child data in children table...');
            
            // First, make sure the user exists in the users table
            // This is necessary because children has a foreign key constraint to users
            try {
              // Check if user exists in users table
              const { data: userExists } = await adminClient
                .from('users')
                .select('id')
                .eq('id', user.id)
                .maybeSingle();
              
              // If user doesn't exist, create the user first
              if (!userExists) {
                console.log('User does not exist in users table, creating user first...');
                const [firstName, ...lastNameParts] = formData.name.split(' ');
                const lastName = lastNameParts.join(' ');
                
                await adminClient
                  .from('users')
                  .insert({
                    id: user.id,
                    email: user.email || '',
                    first_name: firstName || '',
                    last_name: lastName || '',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  });
                console.log('User created successfully');
              }
            } catch (userError) {
              console.error('Error checking/creating user:', userError);
              // Continue anyway - we'll catch any errors in the child update
            }
            
            // Now check if child exists
            const { data: existingChildren } = await adminClient
              .from('children')
              .select('id')
              .eq('user_id', user.id)
              .maybeSingle();

            const childData = {
              user_id: user.id,
              name: formData.childName,
              birthdate: formData.childAge ? calculateBirthdate(parseInt(formData.childAge, 10)) : null,
              interests: formData.interests,
              updated_at: new Date().toISOString(),
            };

            let childError = null;
            
            if (existingChildren?.id) {
              // Update existing child
              console.log('Updating existing child with ID:', existingChildren.id);
              const { error } = await adminClient
                .from('children')
                .update(childData)
                .eq('id', existingChildren.id);
              childError = error;
            } else {
              // Create new child
              console.log('Creating new child for user ID:', user.id);
              const { error } = await adminClient
                .from('children')
                .insert(childData);
              childError = error;
            }

            if (childError) {
              console.error('Error updating child data:', childError);
              // Store in localStorage as fallback
              localStorage.setItem(`child_data_${user.id}`, JSON.stringify(childData));
              console.log('Child data saved to localStorage as fallback');
            } else {
              console.log('Successfully updated child data');
            }
          } catch (childError) {
            console.error('Exception updating child:', childError);
          }
        }
        
        // Show success message for database update attempt
        toast({
          title: 'Profile updated',
          description: 'Your profile has been updated successfully.',
        });
        
        // Refresh the profile data
        await fetchProfile();
      } catch (dbError) {
        console.error('Database operation error:', dbError);
        // Show message that we saved locally but had database issues
        toast({
          title: 'Profile saved locally',
          description: "Your profile has been saved to your device, but couldn't be fully updated in the database.",
          variant: 'default',
        });
      }
    } else {
      // User not authenticated, show success for local storage only
      toast({
        title: 'Profile saved locally',
        description: 'Your profile has been saved to your device.',
        variant: 'default',
      });
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'An unknown error occurred',
      variant: 'destructive',
    });
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