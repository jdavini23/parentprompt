import React from 'react';
import { useFormContext } from 'react-hook-form';
import type { OnboardingFormData } from '../../types/onboarding';

export default function Step3({ prevStep }: { prevStep: () => void }) {
  const { register, formState: { errors }, trigger } = useFormContext<OnboardingFormData>();
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Notification Preferences</h2>
      <label className="block mb-2">Preferred Notification Time
        <input type="time" {...register('notificationTime', { required: 'Preferred time is required' })} className="input input-bordered w-full" />
        {errors.notificationTime && <span className="text-red-500 text-sm">{errors.notificationTime.message}</span>}
      </label>
      <label className="block mb-2">Notification Method
        <select {...register('notificationMethod', { required: 'Method is required' })} className="select select-bordered w-full">
          <option value="">Select a method</option>
          <option value="email">Email</option>
          <option value="push">Push Notification</option>
        </select>
        {errors.notificationMethod && <span className="text-red-500 text-sm">{errors.notificationMethod.message}</span>}
      </label>
      <div className="flex gap-2 mt-4">
        <button type="button" onClick={prevStep} className="btn btn-secondary">Back</button>
        <button type="submit" className="btn btn-success ml-auto">Finish</button>
      </div>
    </div>
  );
}
