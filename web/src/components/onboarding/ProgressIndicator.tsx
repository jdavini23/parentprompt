import React from 'react';

export default function ProgressIndicator({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) {
  return (
    <div className="flex items-center justify-center mb-6">
      {Array.from({ length: totalSteps }).map((_, idx) => (
        <div
          key={idx}
          className={`w-3 h-3 rounded-full mx-1 ${idx === currentStep ? 'bg-blue-600' : 'bg-gray-300'}`}
        />
      ))}
    </div>
  );
}
