import React from 'react';
import { useFormContext } from 'react-hook-form';
import type { OnboardingFormData } from '../../types/onboarding';

export default function Step1({ nextStep }: { nextStep: () => void }) {
  const { register, formState: { errors }, trigger } = useFormContext<OnboardingFormData>();
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Child Information</h2>
      <label className="block mb-2">Name
        <input {...register('childName', { required: 'Name is required' })} className="input input-bordered w-full" />
        {errors.childName && <span className="text-red-500 text-sm">{errors.childName.message}</span>}
      </label>
      <label className="block mb-2">Birthdate
        <input type="date" {...register('childBirthdate', { required: 'Birthdate is required' })} className="input input-bordered w-full" />
        {errors.childBirthdate && <span className="text-red-500 text-sm">{errors.childBirthdate.message}</span>}
      </label>
      <button type="button" onClick={async () => { if (await trigger(['childName', 'childBirthdate'])) nextStep(); }} className="btn btn-primary mt-4">Next</button>
    </div>
  );
}
