-- Manual Migration for Profiles Table
-- Copy and paste this into the Supabase SQL Editor at: https://supabase.com/dashboard/project/YOUR_PROJECT_REF/sql

-- 1. Create the profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT,
  child_name TEXT,
  child_age INTEGER,
  interests TEXT[],
  preferred_time TEXT
);

-- 2. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for the profiles table
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 4. Create or replace the function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert if the profile doesn't already exist
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    INSERT INTO public.profiles (
      id, 
      name, 
      child_name, 
      child_age, 
      interests, 
      preferred_time
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', ''),
      '', -- Default empty child name
      0,  -- Default age
      '{}', -- Empty interests array
      ''   -- Default empty preferred time
    );
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW; -- Always return NEW to prevent signup failure
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create the trigger to automatically create a profile when a new user signs up
DO $$
BEGIN
  -- Drop the trigger if it exists
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  
  -- Create the trigger
  EXECUTE 'CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()';
    
  RAISE NOTICE 'Created on_auth_user_created trigger';
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error creating trigger: %', SQLERRM;
END $$;
