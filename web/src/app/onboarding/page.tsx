'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { OnboardingFormData } from '@/types/onboarding';
import Step1 from '@/components/onboarding/Step1';
import Step2 from '@/components/onboarding/Step2';
import Step3 from '@/components/onboarding/Step3';
import ProgressIndicator from '@/components/onboarding/ProgressIndicator';

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignupSuccess, setShowSignupSuccess] = useState(false);

  const methods = useForm<OnboardingFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      childName: '',
      childBirthdate: '',
      interests: [],
      notificationTime: '09:00',
      notificationMethod: 'email',
    },
  });

  const { handleSubmit, trigger, reset } = methods;

  const nextStep = async () => {
    let isValid = false;

    // Validate current step fields
    if (step === 1) {
      isValid = await trigger(['firstName', 'lastName']);
    } else if (step === 2) {
      isValid = await trigger(['childName', 'childBirthdate']);
    } else if (step === 3) {
      isValid = await trigger(['interests']);
    }

    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const onSubmit = async (data: OnboardingFormData) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    console.log('Submitting form data:', data);
    setIsSubmitting(true);
    setError(null);

    try {
      // Get the admin client to bypass RLS if needed
      const { getSupabaseAdmin } = await import('@/lib/supabase');
      const adminClient = getSupabaseAdmin();

      // Prepare user data with only the fields that exist in the database
      const userData: Record<string, any> = {
        id: user.id,
        email: user.email,
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Only add phone_number if it exists in the database schema
      // and if it's provided in the form data
      if (data.phoneNumber?.trim()) {
        userData.phone_number = data.phoneNumber.trim();
      }

      console.log('Upserting user data:', userData);

      // Try with admin client first, fall back to regular client
      let userUpsert = await adminClient.from('users').upsert(userData).select().single();

      // If admin client fails, try with regular client
      if (userUpsert.error) {
        console.log('Admin client failed, trying regular client...');
        userUpsert = await supabase.from('users').upsert(userData).select().single();
      }

      if (userUpsert.error) {
        console.error('User upsert error details:', {
          code: userUpsert.error.code,
          message: userUpsert.error.message,
          details: userUpsert.error.details,
          hint: userUpsert.error.hint,
        });
        throw new Error(`Failed to save user data: ${userUpsert.error.message || 'Unknown error'}`);
      }

      console.log('User data saved:', userUpsert.data);

      // Prepare child data
      const childData = {
        user_id: user.id,
        name: data.childName.trim(),
        birthdate: data.childBirthdate,
        interests: data.interests || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('Inserting child data:', childData);

      // Use the regular client for inserting children (RLS requires user session)
      let childInsert = await supabase.from('children').insert(childData).select().single();

      if (childInsert.error) {
        console.error('Child insert error details:', {
          code: childInsert.error.code,
          message: childInsert.error.message,
          details: childInsert.error.details,
          hint: childInsert.error.hint,
        });
        throw new Error(
          `Failed to save child data: ${childInsert.error.message || 'Unknown error'}`
        );
      }

      console.log('Child data saved:', childInsert.data);

      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (err) {
      console.error('Error in onSubmit:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while saving your profile. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('justSignedUp') === 'true') {
      setShowSignupSuccess(true);
      sessionStorage.removeItem('justSignedUp');
    }
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        {showSignupSuccess && (
          <div className="mb-4 p-3 rounded bg-green-100 text-green-800 text-center font-medium">
            Account created! Welcome! Please complete your profile to get started.
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-center text-gray-900">
            {step < 4 ? 'Complete Your Profile' : 'Review Your Information'}
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step < 4 ? `Step ${step} of 3` : 'Please review your information before submitting'}
          </p>
        </div>

        <ProgressIndicator currentStep={step} totalSteps={4} />

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && <Step1 nextStep={nextStep} />}
            {step === 2 && <Step2 nextStep={nextStep} prevStep={prevStep} />}
            {step === 3 && <Step3 prevStep={prevStep} onSubmit={handleSubmit(onSubmit)} />}

            {step === 4 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Review Your Information</h3>

                  <div className="space-y-2">
                    <h4 className="font-medium">Your Information</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Name:</span>
                        <span>
                          {methods.watch('firstName')} {methods.watch('lastName')}
                        </span>
                      </div>
                      {methods.watch('phoneNumber') && (
                        <div className="grid grid-cols-2">
                          <span className="text-muted-foreground">Phone:</span>
                          <span>{methods.watch('phoneNumber')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Child's Information</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Name:</span>
                        <span>{methods.watch('childName')}</span>
                      </div>
                      <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Birthdate:</span>
                        <span>
                          {new Date(methods.watch('childBirthdate')).toLocaleDateString()}
                        </span>
                      </div>
                      {methods.watch('interests')?.length > 0 && (
                        <div className="grid grid-cols-2">
                          <span className="text-muted-foreground">Interests:</span>
                          <span>{methods.watch('interests').join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Notification Preferences</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Preferred Time:</span>
                        <span>{methods.watch('notificationTime')}</span>
                      </div>
                      <div className="grid grid-cols-2">
                        <span className="text-muted-foreground">Method:</span>
                        <span>
                          {methods.watch('notificationMethod') === 'email'
                            ? 'Email'
                            : methods.watch('notificationMethod') === 'push'
                              ? 'Push Notification'
                              : methods.watch('notificationMethod') === 'text'
                                ? 'Text Message'
                                : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {error && <p className="text-sm font-medium text-red-500">{error}</p>}

                <div className="flex justify-between">
                  <Button
                    type="button"
                    onClick={prevStep}
                    variant="outline"
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Complete Setup'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
