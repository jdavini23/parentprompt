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

const NOTIFICATION_METHODS = [
  { id: 'email', label: 'Email' },
  { id: 'push', label: 'Push Notification' },
  { id: 'text', label: 'Text Message' },
];

export default function Step3({
  prevStep,
  onSubmit,
}: {
  prevStep: () => void;
  onSubmit: () => void;
}) {
  const {
    register,
    formState: { errors },
    trigger,
    watch,
    setValue,
  } = useFormContext<OnboardingFormData>();

  const selectedInterests = watch('interests') || [];
  const notificationTime = watch('notificationTime') || '09:00';
  const notificationMethod = watch('notificationMethod') || 'email';

  const toggleInterest = (interestId: string) => {
    const newInterests = selectedInterests.includes(interestId)
      ? selectedInterests.filter(id => id !== interestId)
      : [...selectedInterests, interestId];
    setValue('interests', newInterests);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Child's Interests</h2>
      <p className="text-muted-foreground mb-6">
        Select your child's interests to personalize their experience
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            What are your child's interests?{' '}
            <span className="text-muted-foreground">(Select all that apply)</span>
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {INTERESTS.map(interest => (
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
              validate: value => {
                return (value && value.length > 0) || 'Please select at least one interest';
              },
            })}
          />
          {errors.interests && <p className="text-sm text-red-500">{errors.interests.message}</p>}
        </div>
        {/* Notification Preferences */}
        <div className="space-y-2 pt-4">
          <Label className="text-sm font-medium">Notification Preferences</Label>
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Label htmlFor="notificationTime" className="text-sm font-normal min-w-[120px]">
                Preferred Time
              </Label>
              <input
                id="notificationTime"
                type="time"
                className={`border rounded px-2 py-1 w-32 ${errors.notificationTime ? 'border-red-500' : 'border-gray-300'}`}
                {...register('notificationTime', {
                  required: 'Notification time is required',
                  pattern: {
                    value: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
                    message: 'Invalid time format',
                  },
                })}
                defaultValue="09:00"
              />
            </div>
            {errors.notificationTime && (
              <p className="text-sm text-red-500">{errors.notificationTime.message}</p>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Label className="text-sm font-normal min-w-[120px]">Method</Label>
              <div className="flex gap-4">
                {NOTIFICATION_METHODS.map(method => (
                  <label key={method.id} className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      value={method.id}
                      {...register('notificationMethod', {
                        required: 'Notification method is required',
                      })}
                      checked={notificationMethod === method.id}
                      onChange={() =>
                        setValue(
                          'notificationMethod',
                          method.id as OnboardingFormData['notificationMethod']
                        )
                      }
                    />
                    <span className="text-sm">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>
            {errors.notificationMethod && (
              <p className="text-sm text-red-500">{errors.notificationMethod.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button
          type="button"
          onClick={async () => {
            const isValid = await trigger(['interests', 'notificationTime', 'notificationMethod']);
            if (isValid) onSubmit();
          }}
        >
          Complete Onboarding
        </Button>
      </div>
    </div>
  );
}
