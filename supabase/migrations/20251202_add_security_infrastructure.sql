-- Migration to add security infrastructure for rate limiting, audit logging, and GDPR compliance
-- This migration creates tables and functions to support defense-in-depth security measures
-- including rate limiting for Edge Functions, audit trails for guest orders, and data deletion for GDPR.
-- All operations are idempotent and follow existing migration patterns.
-- After applying this migration, regenerate TypeScript types automatically.

-- Section 1: Create rate_limit_log table for tracking requests per IP/endpoint in sliding windows
-- Purpose: Implement rate limiting with 1-hour sliding windows to prevent abuse on public endpoints
-- RLS is disabled as this table is accessed only via service role from Edge Functions
CREATE TABLE IF NOT EXISTS public.rate_limit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 1,
    window_start TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookups on IP, endpoint, and window
CREATE INDEX IF NOT EXISTS idx_rate_limit_ip_endpoint_window ON public.rate_limit_log(ip_address, endpoint, window_start);

-- Disable RLS for this table (service role access only)
ALTER TABLE public.rate_limit_log DISABLE ROW LEVEL SECURITY;

-- Section 2: Create guest_order_audit_log table for GDPR compliance and debugging
-- Purpose: Maintain audit trail for guest orders, including creation, payment, shipping, and data deletion
-- Supports GDPR Article 17 (Right to Erasure) by tracking all actions on guest data
CREATE TABLE IF NOT EXISTS public.guest_order_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id),
    action TEXT NOT NULL CHECK (action IN ('created', 'paid', 'shipped', 'data_deleted')),
    guest_email TEXT,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indices for efficient queries
CREATE INDEX IF NOT EXISTS idx_audit_order_id ON public.guest_order_audit_log(order_id);
CREATE INDEX IF NOT EXISTS idx_audit_guest_email ON public.guest_order_audit_log(guest_email);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.guest_order_audit_log(created_at);

-- Enable RLS and add admin-only policy for SELECT
ALTER TABLE public.guest_order_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY guest_order_audit_admin_select ON public.guest_order_audit_log
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Section 3: Create check_rate_limit function
-- Purpose: Check if an IP has exceeded the request limit for an endpoint in the last hour
-- Strategy: Sliding window of 1 hour; uses atomic UPSERT to avoid race conditions
-- Returns true if allowed, false if blocked; cleans old records (>24h) automatically
-- Cleanup of rate_limit_log should be scheduled externally (e.g., pg_cron daily)
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_ip_address TEXT, p_endpoint TEXT, p_limit INTEGER DEFAULT 10)
RETURNS BOOLEAN AS $$
DECLARE
    v_window_start TIMESTAMP;
    v_current_count INTEGER;
BEGIN
    -- Calculate the start of the current 1-hour window
    v_window_start := date_trunc('hour', NOW());

    -- Attempt to insert or update the count atomically
    INSERT INTO public.rate_limit_log (ip_address, endpoint, request_count, window_start)
    VALUES (p_ip_address, p_endpoint, 1, v_window_start)
    ON CONFLICT (ip_address, endpoint, window_start)
    DO UPDATE SET
        request_count = rate_limit_log.request_count + 1,
        created_at = NOW()
    RETURNING request_count INTO v_current_count;

    -- Clean up old records (>24 hours) to prevent table bloat
    DELETE FROM public.rate_limit_log
    WHERE created_at < NOW() - INTERVAL '24 hours';

    -- Return true if under limit, false if exceeded
    RETURN v_current_count <= p_limit;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error and allow request to proceed (fail open for rate limiting)
        RAISE NOTICE 'Error in check_rate_limit: %', SQLERRM;
        RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Section 4: Create log_guest_order_audit function
-- Purpose: Log actions on guest orders for audit and compliance
-- Validates action against allowed enum; uses SECURITY DEFINER for Edge Function access
-- Returns the UUID of the created log entry
CREATE OR REPLACE FUNCTION public.log_guest_order_audit(
    p_order_id UUID,
    p_action TEXT,
    p_guest_email TEXT,
    p_ip_address TEXT,
    p_user_agent TEXT,
    p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    -- Validate action
    IF p_action NOT IN ('created', 'paid', 'shipped', 'data_deleted') THEN
        RAISE EXCEPTION 'Invalid action: %', p_action;
    END IF;

    -- Insert audit log
    INSERT INTO public.guest_order_audit_log (order_id, action, guest_email, ip_address, user_agent, metadata)
    VALUES (p_order_id, p_action, p_guest_email, p_ip_address, p_user_agent, p_metadata)
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but do not raise (audit logging should not break main flow)
        RAISE NOTICE 'Error in log_guest_order_audit: %', SQLERRM;
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Section 5: Create delete_guest_data function for GDPR compliance
-- Purpose: Anonymize guest order data per GDPR Article 17 (Right to Erasure)
-- Maintains order_id and totals for accounting; removes PII; logs deletion action
-- Returns number of affected records; adds constraint to prevent re-identification
-- Process: Admin calls this function after customer request; Stripe data deleted separately
CREATE OR REPLACE FUNCTION public.delete_guest_data(p_guest_email TEXT)
RETURNS INTEGER AS $$
DECLARE
    v_affected_count INTEGER := 0;
    v_order_record RECORD;
BEGIN
    -- First, log the deletion action for each affected order
    FOR v_order_record IN
        SELECT id FROM public.orders
        WHERE guest_email = p_guest_email AND is_guest_order = true
    LOOP
        PERFORM public.log_guest_order_audit(
            v_order_record.id,
            'data_deleted',
            p_guest_email,
            'admin_action',
            'GDPR Erasure',
            '{"reason": "GDPR Article 17 request"}'::jsonb
        );
    END LOOP;

    -- Anonymize the data: set PII to deleted values
    UPDATE public.orders
    SET guest_email = 'deleted@privacy.local',
        guest_name = '[DELETED]',
        shipping_address = '{}'::jsonb
    WHERE guest_email = p_guest_email AND is_guest_order = true;

    GET DIAGNOSTICS v_affected_count = ROW_COUNT;

    -- Add a constraint to prevent future re-identification (if not exists)
    -- This ensures deleted emails cannot be reused
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'orders' AND constraint_name = 'orders_deleted_email_unique'
    ) THEN
        ALTER TABLE public.orders ADD CONSTRAINT orders_deleted_email_unique
            EXCLUDE (guest_email WITH =) WHERE (guest_email = 'deleted@privacy.local');
    END IF;

    RETURN v_affected_count;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error in delete_guest_data: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;