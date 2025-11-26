-- Create helper function to grant admin role
CREATE OR REPLACE FUNCTION public.ensure_admin_role(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id_var UUID;
BEGIN
  -- Look up user by email
  SELECT id INTO user_id_var
  FROM auth.users
  WHERE email = user_email;

  -- If user not found, return false (they need to sign up first)
  IF user_id_var IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Insert admin role if not already present (idempotent due to unique constraint)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (user_id_var, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Return success
  RETURN TRUE;
END;
$$;

-- Grant admin access to primary admin account: anapsousa@gmail.com
-- This is the only intended admin user for security purposes
DO $$
BEGIN
  -- Attempt to grant admin role; safe to run even if user hasn't signed up yet
  IF NOT public.ensure_admin_role('anapsousa@gmail.com') THEN
    RAISE NOTICE 'User anapsousa@gmail.com not found in auth.users. Admin role will be granted after they sign up.';
  END IF;
END $$;