import React from 'react';
import Link from 'next/link';
import AuthForm from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Sign Up | ParentPrompt',
  description: 'Create a new ParentPrompt account',
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="mt-2 text-gray-600">
            Start your journey with personalized parenting prompts
          </p>
        </div>
        
        <AuthForm type="sign-up" />
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/sign-in" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
