# Supabase Setup Guide for ParentPrompt

This guide will walk you through setting up Supabase for the ParentPrompt application.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign in or create an account
2. Create a new project
3. Choose a name for your project (e.g., "parentprompt")
4. Set a secure database password
5. Choose the region closest to your users
6. Wait for your project to be created (this may take a few minutes)

## 2. Get Your API Keys

1. Once your project is created, go to the project dashboard
2. In the left sidebar, click on "Project Settings"
3. Click on "API" in the settings menu
4. You'll find two keys:
   - `anon public`: This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `URL`: This is your `NEXT_PUBLIC_SUPABASE_URL`

## 3. Update Environment Variables

1. Open the `.env.local` file in the root of the project
2. Update the Supabase environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
3. Replace `your-supabase-project-url` with your actual Supabase URL
4. Replace `your-supabase-anon-key` with your actual Supabase anon key

## 4. Create Database Tables

Run the following SQL in the Supabase SQL Editor to create the necessary tables:

```sql
-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create children table
CREATE TABLE public.children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  name TEXT NOT NULL,
  birthdate DATE NOT NULL,
  interests TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prompts table
CREATE TABLE public.prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  age_range TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_prompts table
CREATE TABLE public.user_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  prompt_id UUID REFERENCES public.prompts(id) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  favorited BOOLEAN DEFAULT FALSE,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  preferred_time TIME NOT NULL,
  notification_method TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Row Level Security (RLS) policies
-- Users can only access their own data
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Children table policies
CREATE POLICY "Users can view their own children" ON public.children
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own children" ON public.children
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own children" ON public.children
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete their own children" ON public.children
  FOR DELETE USING (auth.uid() = user_id);

-- User prompts table policies
CREATE POLICY "Users can view their own prompts" ON public.user_prompts
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own prompts" ON public.user_prompts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own prompts" ON public.user_prompts
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete their own prompts" ON public.user_prompts
  FOR DELETE USING (auth.uid() = user_id);

-- User preferences table policies
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete their own preferences" ON public.user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Prompts are public for all authenticated users
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view prompts" ON public.prompts
  FOR SELECT USING (auth.role() = 'authenticated');
```

## 5. Enable Email Authentication

1. In the Supabase dashboard, go to "Authentication" in the left sidebar
2. Go to "Providers" tab
3. Make sure "Email" is enabled
4. Configure any additional settings as needed (password strength, etc.)

## 6. Test Your Integration

1. Start the development server: `npm run dev`
2. Navigate to `/supabase-test` in your browser
3. You should see a success message if the connection is working properly

## Troubleshooting

If you encounter issues:

1. Check that your environment variables are correctly set
2. Verify that your Supabase project is up and running
3. Make sure your database tables are created correctly
4. Check the browser console for any error messages
5. Ensure your Supabase URL and anon key are correct
