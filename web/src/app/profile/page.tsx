'use client';

import type React from 'react';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/supabase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

const interestsList = [
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

/*
// Diagnostic function to test database connectivity - Requires an admin client via a secure Route Handler
async function testDatabaseConnection() {
  // This function would need to be an API call to a route handler
  // that uses an admin client (e.g., createClient({ auth: { persistSession: false, autoRefreshToken: false } }, supabaseUrl, supabaseServiceKey))
  console.log('Testing database connection (client-side stub)...');
  // Example: const response = await fetch('/api/admin/db-test');
  // const results = await response.json();
  // return results;
}
*/

export default function ProfilePage() {
  const { user } = useAuth();
  const supabase = createClientComponentClient<Database>(); // Correct instantiation

  const [profile, setProfile] = useState<Database['public']['Tables']['users']['Row'] | null>(null);
  const [childProfile, setChildProfile] = useState<
    Database['public']['Tables']['children']['Row'] | null
  >(null);
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

  const calculateAge = (birthdate: string | null | undefined): number => {
    if (!birthdate) return 0;
    const birthDate = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculateBirthdate = (age: number): string => {
    const today = new Date();
    const birthYear = today.getFullYear() - age;
    // Ensure month and day are valid (e.g. a two digit string)
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${birthYear}-${month}-${day}`;
  };

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    console.log('Fetching profile data for user:', user.id);
    setLoading(true);
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        // PGRST116: no rows found
        console.error('Error fetching user data:', userError);
        toast({ title: 'Error', description: userError.message, variant: 'destructive' });
        setLoading(false);
        return;
      }
      if (userData) {
        console.log('User data loaded:', userData);
        setProfile(userData);
        setFormData(prev => ({
          ...prev,
          name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
        }));
      }

      const { data: childData, error: childError } = await supabase
        .from('children')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (childError && childError.code !== 'PGRST116') {
        // PGRST116: no rows found
        console.error('Error fetching child data:', childError);
        toast({ title: 'Error', description: childError.message, variant: 'destructive' });
      } else if (childData) {
        console.log('Child data loaded:', childData);
        setChildProfile(childData);
        setFormData(prev => ({
          ...prev,
          childName: childData.name || '',
          childAge: childData.birthdate ? calculateAge(childData.birthdate).toString() : '',
          interests: childData.interests || [],
        }));
      }
    } catch (error: any) {
      console.error('Unexpected error fetching profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch profile data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInterestChange = (id: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      interests: checked
        ? [...prev.interests, id]
        : prev.interests.filter(interest => interest !== id),
    }));
  };

  const handleTimeChange = (value: string) => {
    setFormData(prev => ({ ...prev, preferredTime: value }));
  };

  const runDiagnostics = async () => {
    setDiagnosisRunning(true);
    setDiagnosisResults(null);
    try {
      // const results = await testDatabaseConnection(); // Keep commented out
      setDiagnosisResults({
        message:
          'Client-side diagnostics are limited. Server-side checks needed for full diagnostics.',
      });
      console.log('Diagnosis complete (client-side stub)');
      toast({
        title: 'Diagnostics',
        description:
          'Client-side checks complete. Full DB diagnostics require server-side execution.',
      });
    } catch (error: any) {
      console.error('Diagnosis failed:', error);
      setDiagnosisResults({ error: error.message });
      toast({
        title: 'Error',
        description: `Diagnosis failed: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setDiagnosisRunning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: 'Error', description: 'User not authenticated.', variant: 'destructive' });
      return;
    }
    setSaving(true);

    try {
      const [firstName, ...lastNameParts] = formData.name.split(' ');
      const lastName = lastNameParts.join(' ');

      // Ensure user.email is available, otherwise handle error or provide a default
      if (!user.email) {
        // This case should ideally not happen for an authenticated user
        // but it's good to guard against it.
        console.error('User email is not available. Cannot upsert user profile.');
        toast({
          title: 'Error',
          description: 'User email is missing. Cannot save profile.',
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }

      const userDataToUpsert: Database['public']['Tables']['users']['Insert'] = {
        id: user.id,
        email: user.email, // Always include email
        first_name: firstName || '',
        last_name: lastName || '',
      };

      const { error: userUpsertError } = await supabase.from('users').upsert(userDataToUpsert);

      if (userUpsertError) throw userUpsertError;
      console.log('User profile upserted successfully');
      toast({ title: 'Success', description: 'User profile updated.' });

      if (formData.childName) {
        const childAgeNumber = parseInt(formData.childAge, 10);
        const childDataToUpsert: Omit<
          Database['public']['Tables']['children']['Insert'],
          'id' | 'created_at' | 'updated_at'
        > & { id?: string } = {
          user_id: user.id,
          name: formData.childName,
          birthdate: childAgeNumber ? calculateBirthdate(childAgeNumber) : undefined,
          interests: formData.interests,
        };

        if (childProfile && childProfile.id) {
          // Update existing child
          const { error: childUpdateError } = await supabase
            .from('children')
            .update(childDataToUpsert) // TS might complain if id is here, ensure Update type doesn't expect it if not needed for matching
            .eq('id', childProfile.id);
          if (childUpdateError) throw childUpdateError;
          console.log('Child profile updated successfully');
          toast({ title: 'Success', description: 'Child profile updated.' });
        } else {
          // Insert new child (explicitly remove id for insert)
          const { id, ...insertData } = childDataToUpsert;
          const { error: childInsertError } = await supabase
            .from('children')
            .insert(insertData as Database['public']['Tables']['children']['Insert']); // Cast to Insert type
          if (childInsertError) throw childInsertError;
          console.log('Child profile created successfully');
          toast({ title: 'Success', description: 'Child profile created.' });
        }
      }
      fetchProfile(); // Refresh data
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({ title: 'Error saving profile', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading profile...</div>;
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        Please log in to view your profile.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Manage your personal and child's information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Your Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="E.g., Jane Doe"
              />
            </div>

            <h3 className="text-lg font-semibold pt-4">Child's Information</h3>
            <div>
              <Label htmlFor="childName">Child's Name</Label>
              <Input
                id="childName"
                name="childName"
                value={formData.childName}
                onChange={handleInputChange}
                placeholder="E.g., Alex"
              />
            </div>
            <div>
              <Label htmlFor="childAge">Child's Age</Label>
              <Input
                id="childAge"
                name="childAge"
                type="number"
                value={formData.childAge}
                onChange={handleInputChange}
                placeholder="E.g., 5"
              />
            </div>

            <div>
              <Label>Child's Interests</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                {interestsList.map(interest => (
                  <div key={interest.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={interest.id}
                      checked={formData.interests.includes(interest.id)}
                      onCheckedChange={checked => handleInterestChange(interest.id, !!checked)}
                    />
                    <Label htmlFor={interest.id} className="font-normal">
                      {interest.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferred time for prompts - Assuming this is for future use and not directly in users/children table */}
            {/* 
            <div>
              <Label htmlFor="preferredTime">Preferred Time for Prompts</Label>
              <Select onValueChange={handleTimeChange} value={formData.preferredTime}>
                <SelectTrigger id="preferredTime">
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
            */}

            <div className="flex flex-col sm:flex-row justify-between items-center pt-6 space-y-4 sm:space-y-0">
              <Button type="submit" disabled={saving || loading} className="w-full sm:w-auto">
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={runDiagnostics}
                disabled={diagnosisRunning}
                className="w-full sm:w-auto"
              >
                {diagnosisRunning ? 'Running Diagnostics...' : 'Run Diagnostics'}
              </Button>
            </div>
          </form>
          {diagnosisResults && (
            <div className="mt-6 p-4 border rounded-md bg-muted">
              <h4 className="font-semibold">Diagnosis Results:</h4>
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(diagnosisResults, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
