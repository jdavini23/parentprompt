import React from 'react';
import { useFormContext } from 'react-hook-form';
import type { OnboardingFormData } from '../../types/onboarding';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Step1({ nextStep }: { nextStep: () => void }) {
  const { register, formState: { errors }, trigger } = useFormContext<OnboardingFormData>();
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Information</h2>
      <p className="text-muted-foreground mb-6">Let's get to know you better</p>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
          <Input
            id="firstName"
            {...register('firstName', { required: 'First name is required' })}
            className={errors.firstName ? 'border-red-500' : ''}
          />
          {errors.firstName && (
            <p className="text-sm text-red-500">{errors.firstName.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
          <Input
            id="lastName"
            {...register('lastName', { required: 'Last name is required' })}
            className={errors.lastName ? 'border-red-500' : ''}
          />
          {errors.lastName && (
            <p className="text-sm text-red-500">{errors.lastName.message}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="phoneNumber" className="text-sm font-medium">
          Phone Number <span className="text-muted-foreground">(Optional)</span>
        </label>
        <Input
          id="phoneNumber"
          type="tel"
          {...register('phoneNumber')}
          placeholder="+1 (555) 000-0000"
        />
      </div>
      
      <div className="flex justify-end pt-4">
        <Button 
          type="button" 
          onClick={async () => {
            const isValid = await trigger(['firstName', 'lastName']);
            if (isValid) nextStep();
          }}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
