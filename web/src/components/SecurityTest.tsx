'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { testAllSecurityPolicies } from '@/db/security';
import { useRouter } from 'next/navigation';

export default function SecurityTest() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const router = useRouter();

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      setAuthChecking(true);
      const supabase = createSupabaseBrowserClient();
      
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
      } catch (err) {
        console.error('Error checking authentication:', err);
      } finally {
        setAuthChecking(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleSignIn = () => {
    router.push('/auth/sign-in?redirect=/security-test');
  };

  const runSecurityTests = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createSupabaseBrowserClient();
      
      // Check if user is authenticated before running tests
      const { data } = await supabase.auth.getUser();
      
      if (!data.user) {
        setError('You must be signed in to run security tests');
        setLoading(false);
        return;
      }
      
      const testResults = await testAllSecurityPolicies(supabase);
      setResults(testResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // If still checking authentication status, show loading
  if (authChecking) {
    return (
      <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md flex items-center justify-center">
        <p className="text-gray-600">Checking authentication status...</p>
      </div>
    );
  }

  // If not authenticated, show sign-in prompt
  if (!user) {
    return (
      <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        
        <div className="mb-6 p-4 bg-yellow-100 text-yellow-700 rounded-md">
          <p className="font-medium">You must be signed in to run security tests.</p>
          <p className="mt-2">Security tests verify that Row-Level Security (RLS) policies are working correctly, which requires an authenticated user.</p>
        </div>
        
        <button
          onClick={handleSignIn}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Sign In
        </button>
      </div>
    );
  }

  // If authenticated, show the security test UI
  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Supabase Security Policy Test</h2>
      <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
        <p className="font-medium">Authenticated as: {user.email}</p>
        <p className="text-sm mt-1">You can now run security tests to verify that Row-Level Security (RLS) policies are working correctly.</p>
      </div>
      <button
        onClick={runSecurityTests}
        disabled={loading}
        className={`mb-6 px-4 py-2 bg-blue-600 text-white rounded-md ${
          loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
        }`}
      >
        {loading ? 'Running Tests...' : 'Run Security Tests'}
      </button>
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      {results && (
        <div className={`p-4 rounded-md ${
          results.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          <p className="font-bold mb-2">{results.message}</p>
          
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Test Results:</h3>
            
            <div className="grid gap-4">
              {Object.entries(results.tests).map(([testName, testResult]: [string, any]) => (
                <div 
                  key={testName}
                  className={`p-3 rounded-md ${
                    testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <p className="font-medium">{testName.replace(/Test$/, '').replace(/([A-Z])/g, ' $1').trim()}:</p>
                  <p className="text-sm">{testResult.message}</p>
                  
                  {testResult.userData && (
                    <div className="mt-2">
                      <p className="text-xs font-medium">User Data Sample:</p>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(testResult.userData, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {testResult.childrenData && testResult.childrenData.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium">Children Data Sample:</p>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(testResult.childrenData[0], null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {testResult.promptsData && testResult.promptsData.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium">Prompts Data Sample:</p>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(testResult.promptsData[0], null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
