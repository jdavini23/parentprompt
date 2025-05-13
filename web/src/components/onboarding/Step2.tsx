import React from 'react';
import { useFormContext } from 'react-hook-form';
import type { OnboardingFormData } from '../../types/onboarding';

const INTERESTS = ['Music', 'Sports', 'Reading', 'Art', 'Science', 'Nature', 'Games'];

export default function Step2({ nextStep, prevStep }: { nextStep: () => void, prevStep: () => void }) {
  const { register, formState: { errors }, trigger } = useFormContext<OnboardingFormData>();
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Child Interests</h2>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {INTERESTS.map((interest) => (
          <label key={interest} className="flex items-center gap-2">
            <input type="checkbox" value={interest} {...register('childInterests')} />
            {interest}
          </label>
        ))}
      </div>
      {errors.childInterests && <span className="text-red-500 text-sm">{errors.childInterests.message}</span>}
      <div className="flex gap-2 mt-4">
        <button type="button" onClick={prevStep} className="btn btn-secondary">Back</button>
        <button type="button" onClick={async () => { if (await trigger('childInterests')) nextStep(); }} className="btn btn-primary ml-auto">Next</button>
      </div>
    </div>
  );
}
