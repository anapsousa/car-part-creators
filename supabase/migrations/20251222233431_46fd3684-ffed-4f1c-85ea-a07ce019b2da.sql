-- Fix rate_limit_requests RLS policy to restrict access to service role only
-- Current policy allows any authenticated user to read all IP addresses (GDPR violation)

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limit_requests;

-- Create restrictive policy - only service role can access this table
-- Regular users and anon role should have no access
CREATE POLICY "Service role only access" ON public.rate_limit_requests
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);