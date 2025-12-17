-- Rename 'moderator' to 'creator' in the app_role enum
ALTER TYPE public.app_role RENAME VALUE 'moderator' TO 'creator';

-- Create or replace function to assign role based on user metadata during signup
CREATE OR REPLACE FUNCTION public.handle_user_role_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  selected_role text;
  role_to_assign app_role;
BEGIN
  -- Get the user_type from raw_user_meta_data (defaults to 'user' if not set)
  selected_role := COALESCE(NEW.raw_user_meta_data->>'user_type', 'user');
  
  -- Determine which role to assign
  IF selected_role = 'creator' THEN
    role_to_assign := 'creator';
  ELSE
    role_to_assign := 'user';
  END IF;
  
  -- Insert the role into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, role_to_assign)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically assign roles on user creation
DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_role_assignment();

-- Assign admin roles to specified email addresses
-- First, get the user IDs for the admin emails and insert admin roles
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- For anapsousa@gmail.com
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'anapsousa@gmail.com';
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  -- For dr3amtorprint@gmail.com
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'dr3amtorprint@gmail.com';
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;