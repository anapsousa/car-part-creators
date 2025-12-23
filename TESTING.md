# Testing the Stripe Checkout Flow

This document provides test commands to verify the Stripe checkout edge functions are working correctly.

## Prerequisites

- The edge functions must be deployed to Supabase
- The `STRIPE_SECRET_KEY` must be configured in Supabase secrets

## Environment

- **Supabase Project ID**: `khdczrzplqssygwoyjte`
- **Functions URL Base**: `https://khdczrzplqssygwoyjte.supabase.co/functions/v1`

## 1. CORS Preflight Tests

These tests verify that CORS is properly configured for cross-origin requests.

### Test `create-product-checkout` CORS

```bash
curl -i -X OPTIONS "https://khdczrzplqssygwoyjte.supabase.co/functions/v1/create-product-checkout" \
  -H "Origin: https://dr3amtoreal.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type,authorization,apikey,x-client-info"
```

**Expected Response:**
- Status: `200 OK`
- Headers should include:
  - `Access-Control-Allow-Origin: https://dr3amtoreal.com`
  - `Access-Control-Allow-Methods: POST, OPTIONS`
  - `Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type`

### Test `create-checkout` CORS

```bash
curl -i -X OPTIONS "https://khdczrzplqssygwoyjte.supabase.co/functions/v1/create-checkout" \
  -H "Origin: https://dr3amtoreal.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type,authorization,apikey,x-client-info"
```

**Expected Response:**
- Status: `200 OK`
- Same headers as above

## 2. Product Checkout Test (Guest)

This tests the product checkout flow for guest users.

```bash
curl -i -X POST "https://khdczrzplqssygwoyjte.supabase.co/functions/v1/create-product-checkout" \
  -H "Content-Type: application/json" \
  -H "Origin: https://dr3amtoreal.com" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZGN6cnpwbHFzc3lnd295anRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NzE0MzIsImV4cCI6MjA3ODQ0NzQzMn0.hy7utgt29ZpLHyMyz-Tx7h3rNhWAJKDvZw13jR_oyUM" \
  -d '{
    "cartItems": [
      {
        "product_id": "cae340f4-02bc-4ef9-8214-7201be3cf3db",
        "quantity": 1
      }
    ],
    "shippingInfo": {
      "email": "test@example.com",
      "name": "Test User",
      "phone": "+351912345678",
      "address": "Test Street 123, Apartment 4",
      "city": "Lisbon",
      "postalCode": "1000-001",
      "country": "Portugal"
    },
    "guestInfo": {
      "email": "test@example.com",
      "name": "Test User",
      "phone": "+351912345678",
      "address": "Test Street 123, Apartment 4",
      "city": "Lisbon",
      "postalCode": "1000-001",
      "country": "Portugal"
    }
  }'
```

**Expected Response:**
- Status: `200 OK`
- Body: `{"url": "https://checkout.stripe.com/..."}`

## 3. Design Checkout Test (Authenticated)

This requires a valid JWT token from an authenticated user.

```bash
curl -i -X POST "https://khdczrzplqssygwoyjte.supabase.co/functions/v1/create-checkout" \
  -H "Content-Type: application/json" \
  -H "Origin: https://dr3amtoreal.com" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZGN6cnpwbHFzc3lnd295anRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NzE0MzIsImV4cCI6MjA3ODQ0NzQzMn0.hy7utgt29ZpLHyMyz-Tx7h3rNhWAJKDvZw13jR_oyUM" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{"designId": "YOUR_DESIGN_ID_HERE"}'
```

**Expected Response:**
- Status: `200 OK`
- Body: `{"sessionId": "cs_...", "url": "https://checkout.stripe.com/..."}`

## 4. Common Error Responses

### Missing designId
```json
{"error": "Missing designId"}
```

### Cart Empty
```json
{"error": "Cart is empty"}
```

### Rate Limited
```json
{"error": "Rate limit exceeded. Please try again later."}
```

### Missing Stripe Configuration
```json
{"error": "STRIPE_SECRET_KEY is not configured"}
```

## 5. Checking Edge Function Logs

View logs in the Lovable Cloud dashboard or use:

```bash
# If using Supabase CLI
supabase functions logs create-product-checkout --project-ref khdczrzplqssygwoyjte
supabase functions logs create-checkout --project-ref khdczrzplqssygwoyjte
```

## 6. Deployed Function Names

| Function Name | Purpose | Auth Required |
|--------------|---------|---------------|
| `create-product-checkout` | Product/cart checkout | No (guest allowed) |
| `create-checkout` | Design generation checkout | Yes (JWT required) |
| `stripe-webhook` | Stripe webhook handler | No |
| `buy-credits` | Buy credits checkout | Yes |

## 7. Frontend Integration

The frontend uses `supabase.functions.invoke()` which automatically:
- Adds the correct Authorization header (if user is logged in)
- Adds the apikey header
- Sets the correct Content-Type
- Handles CORS automatically

Example:
```typescript
const { data, error } = await supabase.functions.invoke('create-product-checkout', {
  body: { cartItems, shippingInfo, guestInfo }
});

if (data?.url) {
  window.location.href = data.url;
}
```
