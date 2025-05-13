import React from 'react';
import Link from 'next/link';
import AuthForm from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Sign In | ParentPrompt',
  description: 'Sign in to your ParentPrompt account',
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">Sign in to ParentPrompt</h1>
          <p className="mt-2 text-gray-600">
            Access your personalized parenting prompts
          </p>
        </div>
        
        <AuthForm type="sign-in" />
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/auth/sign-up" className="font-medium text-blue-600 hover:text-blue-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
