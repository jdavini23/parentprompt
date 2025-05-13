'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function SupabaseTest() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Testing Supabase connection...');

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Check if Supabase URL and key are properly set
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || supabaseUrl === 'your-supabase-project-url') {
          setStatus('error');
          setMessage('Error: NEXT_PUBLIC_SUPABASE_URL is not properly configured in .env.local');
          return;
        }
        
        if (!supabaseKey || supabaseKey === 'your-supabase-anon-key') {
          setStatus('error');
          setMessage('Error: NEXT_PUBLIC_SUPABASE_ANON_KEY is not properly configured in .env.local');
          return;
        }
        
        // Simple query to test the connection - just check if we can connect
        // Use a simple query that doesn't use aggregate functions
        const { data, error } = await supabase.from('users').select('*').limit(1);
        
        if (error) {
          throw error;
        }
        
        setStatus('success');
        setMessage('Successfully connected to Supabase! The database is properly configured.');
      } catch (error) {
        console.error('Supabase connection error:', error);
        setStatus('error');
        setMessage(`Error connecting to Supabase: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex flex-col items-center space-y-4 mt-10">
      <h2 className="text-xl font-bold">Supabase Connection Test</h2>
      
      <div className={`p-4 rounded-md w-full ${
        status === 'loading' ? 'bg-blue-100 text-blue-700' :
        status === 'success' ? 'bg-green-100 text-green-700' :
        'bg-red-100 text-red-700'
      }`}>
        <p>{message}</p>
      </div>
      
      {status === 'error' && (
        <div className="text-sm text-gray-600">
          <p>Please check:</p>
          <ul className="list-disc pl-5">
            <li>Your Supabase URL and anon key in .env.local</li>
            <li>That your Supabase project is running</li>
            <li>That the database tables have been created</li>
            <li>Network connectivity to Supabase</li>
          </ul>
        </div>
      )}
    </div>
  );
}
