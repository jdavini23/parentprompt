import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number; // 1-based step number
  totalSteps: number;  // Total number of steps including the review step
}

export default function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  // Calculate the progress percentage (0-100%)
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          Step {currentStep > totalSteps - 1 ? totalSteps - 1 : currentStep} of {totalSteps - 1}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}
