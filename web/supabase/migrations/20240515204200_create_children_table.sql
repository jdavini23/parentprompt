-- Create children table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.children (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birthdate DATE,
  interests TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

-- Create policies for the children table if they don't exist
DO $$
BEGIN
  -- Check if the select policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'children' 
    AND policyname = 'Users can view their own children'
  ) THEN
    CREATE POLICY "Users can view their own children"
      ON public.children FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  -- Check if the update policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'children' 
    AND policyname = 'Users can update their own children'
  ) THEN
    CREATE POLICY "Users can update their own children"
      ON public.children FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  -- Check if the insert policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'children' 
    AND policyname = 'Users can insert their own children'
  ) THEN
    CREATE POLICY "Users can insert their own children"
      ON public.children FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create a function to get a child by user_id
CREATE OR REPLACE FUNCTION public.get_child_by_user_id(user_id_param UUID)
RETURNS SETOF public.children
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.children WHERE user_id = user_id_param LIMIT 1;
$$;

-- Create a function to update a child
-- First drop the function if it exists to avoid return type conflicts
DROP FUNCTION IF EXISTS public.update_child(UUID, JSONB);

CREATE OR REPLACE FUNCTION public.update_child(
  child_id_param UUID,
  child_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  updated_child public.children;
  user_id_check UUID;
BEGIN
  -- Verify the child belongs to the current user
  SELECT user_id INTO user_id_check 
  FROM public.children 
  WHERE id = child_id_param;
  
  IF user_id_check IS NULL THEN
    RETURN jsonb_build_object('error', 'Child not found');
  END IF;
  
  IF user_id_check != auth.uid() THEN
    RETURN jsonb_build_object('error', 'Not authorized to update this child');
  END IF;
  
  -- Update the child
  UPDATE public.children
  SET 
    name = COALESCE(child_data->>'name', name),
    birthdate = COALESCE((child_data->>'birthdate')::DATE, birthdate),
    interests = COALESCE((child_data->'interests')::TEXT[], interests),
    updated_at = NOW()
  WHERE id = child_id_param
  RETURNING * INTO updated_child;
  
  RETURN jsonb_build_object('success', true, 'child', to_jsonb(updated_child));
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$;

-- Create a function to create a child
-- First drop the function if it exists to avoid return type conflicts
DROP FUNCTION IF EXISTS public.create_child(JSONB);

CREATE OR REPLACE FUNCTION public.create_child(
  child_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_child public.children;
  user_id_param UUID;
BEGIN
  -- Get user_id from child_data or use current user
  user_id_param := COALESCE((child_data->>'user_id')::UUID, auth.uid());
  
  -- Verify the user is creating for themselves
  IF user_id_param != auth.uid() THEN
    RETURN jsonb_build_object('error', 'Not authorized to create a child for this user');
  END IF;
  
  -- Insert the new child
  INSERT INTO public.children (
    user_id,
    name,
    birthdate,
    interests
  ) VALUES (
    user_id_param,
    child_data->>'name',
    (child_data->>'birthdate')::DATE,
    (child_data->'interests')::TEXT[]
  )
  RETURNING * INTO new_child;
  
  RETURN jsonb_build_object('success', true, 'child', to_jsonb(new_child));
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$;
