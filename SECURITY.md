# Security Documentation

## Table of Contents

- [Overview](#overview)
- [Security Measures Implemented](#security-measures-implemented)
  - [1. Rate Limiting](#1-rate-limiting)
  - [2. Input Sanitization](#2-input-sanitization)
  - [3. Audit Logging](#3-audit-logging)
  - [4. GDPR Compliance](#4-gdpr-compliance)
  - [5. HTTP Security Headers](#5-http-security-headers)
  - [6. Authentication & Authorization](#6-authentication--authorization)
  - [7. Data Protection](#7-data-protection)
- [Security Considerations & Limitations](#security-considerations--limitations)
  - [Known Limitations](#known-limitations)
  - [Threat Model](#threat-model)
  - [Recommendations](#recommendations)
- [Maintenance Tasks](#maintenance-tasks)
  - [Daily](#daily)
  - [Weekly](#weekly)
  - [Monthly](#monthly)
  - [Quarterly](#quarterly)
- [Incident Response](#incident-response)
  - [Data Breach](#data-breach)
  - [Suspected Fraud](#suspected-fraud)
- [Contact](#contact)
- [References](#references)

## Overview

This document outlines the security architecture of our e-commerce system, with a focus on guest checkout functionality. The system implements multiple layers of defense to protect against common web vulnerabilities while maintaining usability for both authenticated and guest users. Key principles include defense in depth, fail-safe defaults, and compliance with GDPR regulations.

## Security Measures Implemented

### 1. Rate Limiting

- **Strategy:** Sliding window of 1 hour, 10 requests per IP per endpoint
- **Implementation:** Table `rate_limit_log` + function `check_rate_limit()`
- **Endpoints protected:** `/create-product-checkout`
- **Response:** HTTP 429 with clear message
- **Bypass:** Stripe webhooks do not have rate limiting (already protected by signature)
- **Maintenance:** Old logs (>24h) are cleaned automatically by the function
- **Limitations:** IP-based rate limiting may affect users behind NAT/proxy; consider adding browser fingerprinting in the future

### 2. Input Sanitization

- **Fields sanitized:** name, address, city, postalCode, country, phone
- **Techniques:** Removal of control characters, HTML escaping, truncation, trim
- **Validation:** Email regex, phone format (via libphonenumber-js on frontend), postal code patterns
- **Location:** `_shared/security.ts` (backend) + `src/lib/validation.ts` (frontend)
- **Defense in depth:** Validation on both sides (frontend UX + backend security)

Example sanitization function:

```typescript
function sanitizeString(input: string, maxLength: number = 255): string {
  return input
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control chars
    .trim()
    .substring(0, maxLength)
    .replace(/[&<>"']/g, (match) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[match]));
}
```

### 3. Audit Logging

- **Table:** `guest_order_audit_log`
- **Events tracked:** order created, paid, shipped, data_deleted
- **Data captured:** order_id, guest_email, IP, user-agent, metadata (JSONB), timestamp
- **Access:** Admin-only via RLS
- **Retention:** Undefined (compliance); consider 7-year retention policy for fiscal data
- **Purpose:** GDPR compliance, fraud detection, customer support, debugging

### 4. GDPR Compliance

- **Right to Erasure (Article 17):** Function `delete_guest_data(email)`
- **Anonymization:** guest_email → 'deleted@privacy.local', guest_name → '[DELETED]', shipping_address → '{}'
- **Data maintained:** order_id, total_amount, created_at (accounting requirements)
- **Audit trail:** Deletion action is logged before anonymizing
- **Process:** Customer requests via email → Admin executes `SELECT delete_guest_data('email@example.com')` → Confirmation sent
- **Note:** Stripe data must be deleted separately via Stripe Dashboard

Example usage:

```sql
SELECT delete_guest_data('user@example.com');
```

### 5. HTTP Security Headers

- **Content-Security-Policy:** Restricts scripts/frames to Stripe and self
- **X-Frame-Options:** DENY (prevents clickjacking)
- **X-Content-Type-Options:** nosniff (prevents MIME sniffing)
- **X-XSS-Protection:** Enables browser XSS protection
- **Referrer-Policy:** strict-origin-when-cross-origin
- **Permissions-Policy:** Disables sensitive APIs (geolocation, camera, mic)
- **Implementation:** Function `getSecurityHeaders()` applied to all Edge Functions

Example headers:

```javascript
{
  "Content-Security-Policy": "default-src 'self'; script-src 'self' https://js.stripe.com; frame-src https://js.stripe.com; connect-src 'self' https://api.stripe.com",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
}
```

### 6. Authentication & Authorization

- **Checkout:** Optional (supports guest and authenticated)
- **RLS Policies:** Users access only their data; guests access via session_id
- **Admin access:** Function `has_role(auth.uid(), 'admin')` for privileged operations
- **Webhook verification:** Stripe signature validation mandatory (STRIPE_WEBHOOK_SECRET)

### 7. Data Protection

- **Encryption at rest:** Supabase PostgreSQL (AES-256)
- **Encryption in transit:** HTTPS mandatory (TLS 1.2+)
- **Sensitive data:** Stripe tokens never stored; only session_id and customer_id
- **PII minimization:** Only data necessary for fulfillment is collected

## Security Considerations & Limitations

### Known Limitations

1. **IP-based rate limiting:** May affect multiple users on same network (offices, cafes)
2. **Session hijacking:** session_id in localStorage vulnerable to XSS; consider httpOnly cookies
3. **Fraud detection:** Basic system; consider integration with Stripe Radar for advanced detection
4. **Email verification:** Guests do not verify email; fraudulent orders possible
5. **Cart abandonment:** Anonymous carts cleaned after 30 days; no recovery

### Threat Model

- **Mitigated:** SQL injection (prepared statements), XSS (sanitization), CSRF (SameSite cookies), clickjacking (X-Frame-Options)
- **Partially mitigated:** Rate limiting (IP-based), fraud (basic Stripe)
- **Not mitigated:** Advanced DDoS (consider Cloudflare), account takeover (no 2FA), insider threats

### Recommendations

1. **Monitoring:** Set up alerts for rate limit exceeded, failed payments, audit log anomalies
2. **Backups:** Test restore of `guest_order_audit_log` regularly
3. **Penetration testing:** Perform annually
4. **Dependency updates:** Keep Stripe SDK, Supabase client, Deno std updated
5. **Incident response:** Document process for data breaches (72h GDPR notification)

## Maintenance Tasks

### Daily

- Run `cleanup_abandoned_carts()` via cron (e.g., `0 2 * * * psql -c 'SELECT cleanup_abandoned_carts()'`)

### Weekly

- Review `rate_limit_log` for suspicious patterns
- Check `guest_order_audit_log` for anomalies

### Monthly

- Audit RLS policies
- Review Edge Function error logs
- Test `delete_guest_data()` function in staging

### Quarterly

- Review and update this document
- Train team on security practices
- Review admin accesses

## Incident Response

### Data Breach

1. Isolate affected system
2. Identify scope (what data, how many users)
3. Notify data protection authority (72h)
4. Notify affected users
5. Document in audit log
6. Implement fixes
7. Post-mortem

### Suspected Fraud

1. Check `guest_order_audit_log` for IP/email
2. Check Stripe Dashboard for chargebacks
3. Block email/IP if confirmed (add to blacklist table - TODO)
4. Refund if necessary
5. Document patterns for future detection

## Contact

- **Security issues:** security@pompousweek.com
- **GDPR requests:** privacy@pompousweek.com

## References

- [GDPR Article 17](https://gdpr-info.eu/art-17-gdpr/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Stripe Security](https://stripe.com/docs/security)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)