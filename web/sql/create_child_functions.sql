-- Function to get a child by user ID (bypasses RLS)
CREATE OR REPLACE FUNCTION get_child_by_user_id(user_id UUID)
RETURNS SETOF children AS $$
BEGIN
  RETURN QUERY SELECT * FROM children WHERE children.user_id = $1 LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a new child (bypasses RLS)
CREATE OR REPLACE FUNCTION create_child(child_data JSONB)
RETURNS children AS $$
DECLARE
  new_child children;
BEGIN
  INSERT INTO children (
    user_id,
    name,
    birthdate,
    interests
  ) VALUES (
    (child_data->>'user_id')::UUID,
    child_data->>'name',
    (child_data->>'birthdate')::TIMESTAMPTZ,
    (SELECT ARRAY(SELECT jsonb_array_elements_text(child_data->'interests')))
  )
  RETURNING * INTO new_child;
  
  RETURN new_child;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update an existing child (bypasses RLS)
CREATE OR REPLACE FUNCTION update_child(child_id UUID, child_data JSONB)
RETURNS void AS $$
BEGIN
  UPDATE children
  SET 
    name = COALESCE(child_data->>'name', name),
    birthdate = COALESCE((child_data->>'birthdate')::TIMESTAMPTZ, birthdate),
    interests = COALESCE((SELECT ARRAY(SELECT jsonb_array_elements_text(child_data->'interests'))), interests),
    updated_at = NOW()
  WHERE id = child_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
