-- Drop the trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      name TEXT,
      child_name TEXT,
      child_age INTEGER,
      interests TEXT[],
      preferred_time TEXT
    );
    
    -- Enable Row Level Security
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    
    -- Create policy to allow users to read and update their own profile
    CREATE POLICY "Users can view their own profile"
      ON public.profiles FOR SELECT
      USING (auth.uid() = id);
    
    CREATE POLICY "Users can update their own profile"
      ON public.profiles FOR UPDATE
      USING (auth.uid() = id);
      
    RAISE NOTICE 'Created profiles table';
  ELSE
    RAISE NOTICE 'Profiles table already exists';
  END IF;
END $$;

-- Create or replace the function to handle new user signups
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

-- Create the trigger to automatically create a profile when a new user signs up
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW 
      EXECUTE FUNCTION public.handle_new_user();
    RAISE NOTICE 'Created on_auth_user_created trigger';
  ELSE
    RAISE NOTICE 'on_auth_user_created trigger already exists';
  END IF;
END $$;
