-- Security migration: Ensure only anapsousa@gmail.com has admin access
-- This removes all existing admin roles to prevent unauthorized access
-- and re-grants admin role only to the primary admin account

-- Remove all admin roles for security
DELETE FROM public.user_roles WHERE role = 'admin';

-- Re-grant admin only to primary admin
DO $$
BEGIN
  PERFORM public.ensure_admin_role('anapsousa@gmail.com');
END $$;