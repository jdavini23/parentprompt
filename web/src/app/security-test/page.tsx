import SecurityTest from '@/components/SecurityTest';

export const metadata = {
  title: 'Security Policy Test | ParentPrompt',
  description: 'Test the Row Level Security policies for the ParentPrompt application',
};

export default function SecurityTestPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold text-center mb-6">Supabase Security Policy Test</h1>
      <SecurityTest />
    </div>
  );
}
