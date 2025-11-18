-- Add first_name and last_name columns to profiles table with default values
ALTER TABLE public.profiles 
ADD COLUMN first_name TEXT DEFAULT '',
ADD COLUMN last_name TEXT DEFAULT '';

-- Migrate existing full_name data to first_name and last_name
UPDATE public.profiles 
SET first_name = COALESCE(SPLIT_PART(full_name, ' ', 1), 'User'),
    last_name = CASE 
      WHEN full_name IS NOT NULL AND POSITION(' ' IN full_name) > 0 
      THEN SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
      ELSE 'Name'
    END
WHERE first_name = '' OR last_name = '';

-- Now make them NOT NULL after ensuring all rows have values
ALTER TABLE public.profiles 
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL,
ALTER COLUMN first_name DROP DEFAULT,
ALTER COLUMN last_name DROP DEFAULT;

-- Drop the old full_name column
ALTER TABLE public.profiles 
DROP COLUMN full_name;

-- Update the handle_new_user function to use first_name and last_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    new.id, 
    new.email,
    COALESCE(NULLIF(TRIM(new.raw_user_meta_data->>'first_name'), ''), 'User'),
    COALESCE(NULLIF(TRIM(new.raw_user_meta_data->>'last_name'), ''), 'Name')
  );
  RETURN new;
END;
$$;