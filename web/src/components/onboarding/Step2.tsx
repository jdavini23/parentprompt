import React from 'react';
import { useFormContext } from 'react-hook-form';
import { format } from 'date-fns';
import type { OnboardingFormData } from '../../types/onboarding';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';

export default function Step2({ nextStep, prevStep }: { nextStep: () => void; prevStep: () => void }) {
  const { 
    register, 
    formState: { errors }, 
    trigger,
    watch,
    setValue
  } = useFormContext<OnboardingFormData>();

  const childBirthdate = watch('childBirthdate');
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('childBirthdate', e.target.value);
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Child's Information</h2>
      <p className="text-muted-foreground mb-6">Tell us about your child</p>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="childName" className="text-sm font-medium">
            Child's Name
          </label>
          <Input
            id="childName"
            {...register('childName', { required: "Child's name is required" })}
            className={errors.childName ? 'border-red-500' : ''}
            placeholder="Enter your child's name"
          />
          {errors.childName && (
            <p className="text-sm text-red-500">{errors.childName.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label htmlFor="childBirthdate" className="text-sm font-medium">
            Child's Birthdate
          </label>
          <div className="relative">
            <Input
              id="childBirthdate"
              type="date"
              value={childBirthdate?.split('T')[0] || ''}
              onChange={handleDateChange}
              className={`pr-10 ${errors.childBirthdate ? 'border-red-500' : ''}`}
              max={new Date().toISOString().split('T')[0]}
            />
            <CalendarIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
          <input
            type="hidden"
            {...register('childBirthdate', { 
              required: "Child's birthdate is required",
              validate: (value) => {
                if (!value) return "Birthdate is required";
                const birthDate = new Date(value);
                const today = new Date();
                return birthDate <= today || "Birthdate cannot be in the future";
              }
            })}
          />
          {errors.childBirthdate && (
            <p className="text-sm text-red-500">{errors.childBirthdate.message}</p>
          )}
        </div>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button 
          type="button" 
          variant="outline"
          onClick={prevStep}
        >
          Back
        </Button>
        <Button 
          type="button" 
          onClick={async () => {
            const isValid = await trigger(['childName', 'childBirthdate']);
            if (isValid) nextStep();
          }}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
