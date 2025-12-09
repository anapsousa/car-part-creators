// /Volumes/Backup/Documents/Pompousweek/3D/website/car-part-creators/supabase/functions/_shared/security.ts

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Interface for guest information used in checkout.
 */
export interface GuestInfo {
  name: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

/**
 * Type for security headers object.
 */
export type SecurityHeaders = Record<string, string>;

/**
 * Returns an object containing security headers for HTTP responses.
 * These headers help protect against common web vulnerabilities.
 * @returns {SecurityHeaders} Object with security headers.
 */
export function getSecurityHeaders(): SecurityHeaders {
  return {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' https://js.stripe.com; frame-src https://js.stripe.com; connect-src 'self' https://api.stripe.com",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  };
}

/**
 * Sanitizes a string by removing control characters, trimming whitespace,
 * truncating to maxLength, and escaping HTML entities.
 * @param input - The input string to sanitize.
 * @param maxLength - Maximum length of the output string (default: 255).
 * @returns The sanitized string.
 */
export function sanitizeString(input: string, maxLength: number = 255): string {
  if (typeof input !== 'string') return '';
  // Remove control characters
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');
  // Trim whitespace
  sanitized = sanitized.trim();
  // Truncate
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  // Escape HTML entities
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  return sanitized;
}

/**
 * Sanitizes guest information by applying sanitizeString to fields,
 * validating email, and normalizing phone.
 * @param guestInfo - The guest info object to sanitize.
 * @returns The sanitized GuestInfo object.
 * @throws Error if required fields are empty after sanitization or email is invalid.
 */
export function sanitizeGuestInfo(guestInfo: GuestInfo): GuestInfo {
  const sanitized: GuestInfo = {
    name: sanitizeString(guestInfo.name, 100),
    email: sanitizeString(guestInfo.email, 255),
    address: sanitizeString(guestInfo.address, 200),
    city: sanitizeString(guestInfo.city, 100),
    postalCode: sanitizeString(guestInfo.postalCode, 20),
    country: sanitizeString(guestInfo.country, 2),
    phone: guestInfo.phone ? sanitizeString(guestInfo.phone, 20) : undefined,
  };

  // Validate required fields
  if (!sanitized.name || !sanitized.email || !sanitized.address || !sanitized.city || !sanitized.postalCode || !sanitized.country) {
    throw new Error('Required fields cannot be empty after sanitization');
  }

  // Validate email with regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized.email)) {
    throw new Error('Invalid email format');
  }

  // Normalize phone (remove extra spaces)
  if (sanitized.phone) {
    sanitized.phone = sanitized.phone.replace(/\s+/g, ' ').trim();
  }

  return sanitized;
}

/**
 * Checks if the request is within the rate limit for the given identifier and action.
 * @param supabase - The Supabase client.
 * @param identifier - The client's identifier (e.g., IP address).
 * @param action - The action being performed (e.g., endpoint name).
 * @param maxRequests - The maximum number of requests allowed (default: 10).
 * @param windowSeconds - The time window in seconds (default: 3600).
 * @returns Promise<boolean> - True if allowed, false if rate limited.
 */
export async function checkRateLimit(
  supabase: SupabaseClient,
  identifier: string,
  action: string,
  maxRequests: number = 10,
  windowSeconds: number = 3600
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_action: action,
      p_max_requests: maxRequests,
      p_window_seconds: windowSeconds,
    });
    if (error) {
      console.error('Rate limit check error:', error);
      return true; // Fail open to not block service
    }
    if (!data) {
      console.warn('Rate limit exceeded:', { identifier, action });
      return false;
    }
    return true;
  } catch (err) {
    console.error('Unexpected error in checkRateLimit:', err);
    return true; // Fail open
  }
}

/**
 * Logs an audit entry for guest orders (best-effort, does not fail on error).
 * @param supabase - The Supabase client.
 * @param orderId - The order ID.
 * @param action - The action performed (e.g., 'created', 'paid').
 * @param guestEmail - The guest's email.
 * @param req - The request object to extract IP and user-agent.
 * @param metadata - Optional metadata as JSON object.
 */
export async function logAudit(
  supabase: any,
  orderId: string,
  action: string,
  guestEmail: string | undefined,
  req: Request,
  metadata?: object
): Promise<void> {
  try {
    // Best-effort logging - currently just console log
    // A full audit table can be added later if needed
    const ipAddress = extractClientIp(req);
    console.log('Audit:', { orderId, action, guestEmail, ipAddress, metadata });
  } catch (err) {
    console.error('Unexpected error in logAudit:', err);
  }
}

/**
 * Extracts the client IP address from the request headers.
 * @param req - The request object.
 * @returns The extracted IP address or 'unknown'.
 */
export function extractClientIp(req: Request): string {
  let ip = req.headers.get('x-forwarded-for');
  if (ip) {
    // Take the first IP if it's a list
    ip = ip.split(',')[0].trim();
  } else {
    ip = req.headers.get('x-real-ip') || 'unknown';
  }
  // Sanitize IP (basic check for valid IP format)
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  if (!ipRegex.test(ip)) {
    return 'unknown';
  }
  return ip;
}