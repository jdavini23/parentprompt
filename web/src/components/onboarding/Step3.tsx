import React from 'react';
import { useFormContext } from 'react-hook-form';
import type { OnboardingFormData } from '../../types/onboarding';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const INTERESTS = [
  { id: 'reading', label: 'Reading' },
  { id: 'music', label: 'Music' },
  { id: 'outdoors', label: 'Outdoors' },
  { id: 'sports', label: 'Sports' },
  { id: 'art', label: 'Art & Crafts' },
  { id: 'science', label: 'Science' },
  { id: 'cooking', label: 'Cooking' },
];

export default function Step3({ prevStep, onSubmit }: { prevStep: () => void; onSubmit: () => void }) {
  const { register, formState: { errors }, trigger, watch, setValue } = useFormContext<OnboardingFormData>();
  
  const selectedInterests = watch('interests') || [];
  
  const toggleInterest = (interestId: string) => {
    const newInterests = selectedInterests.includes(interestId)
      ? selectedInterests.filter(id => id !== interestId)
      : [...selectedInterests, interestId];
    setValue('interests', newInterests);
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Child's Interests</h2>
      <p className="text-muted-foreground mb-6">Select your child's interests to personalize their experience</p>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            What are your child's interests? <span className="text-muted-foreground">(Select all that apply)</span>
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {INTERESTS.map((interest) => (
              <div key={interest.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`interest-${interest.id}`}
                  checked={selectedInterests.includes(interest.id)}
                  onCheckedChange={() => toggleInterest(interest.id)}
                />
                <Label htmlFor={`interest-${interest.id}`} className="text-sm font-normal">
                  {interest.label}
                </Label>
              </div>
            ))}
          </div>
          <input
            type="hidden"
            {...register('interests', {
              validate: (value) => {
                return value && value.length > 0 || 'Please select at least one interest';
              }
            })}
          />
          {errors.interests && (
            <p className="text-sm text-red-500">{errors.interests.message}</p>
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
            const isValid = await trigger('interests');
            if (isValid) onSubmit();
          }}
        >
          Complete Onboarding
        </Button>
      </div>
    </div>
  );
}
