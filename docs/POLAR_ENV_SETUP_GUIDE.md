# Polar.sh Environment Variables Setup Guide

Complete step-by-step guide to get all required Polar environment variables for the payment integration.

## Prerequisites

1. A Polar.sh account (Sign up at https://polar.sh)
2. Access to your Supabase project dashboard
3. Your production domain deployed (or use localhost for testing)

---

## Step 1: Create Polar Account & Organization

### 1.1 Sign Up / Login to Polar
1. Go to **https://polar.sh**
2. Click "Sign In" or "Get Started"
3. Sign in with GitHub (recommended) or email

### 1.2 Create an Organization
1. After logging in, you'll be prompted to create an organization
2. Or go to **https://polar.sh/dashboard/settings**
3. Click "Create Organization"
4. Fill in:
   - **Organization Name**: Your company/project name (e.g., "SuperTool")
   - **Slug**: URL-friendly name (e.g., "supertool")
   - **Description**: Brief description of your project

---

## Step 2: Get Organization ID

### Location
Navigate to: **https://polar.sh/dashboard/settings**

### Steps
1. In your Polar dashboard, click "Settings" in the sidebar
2. Go to "Organization" tab
3. Look for "Organization ID" field
4. Copy the ID (format: `org_xxxxxxxxxxxxxxxxxxxxxxxx`)

### Environment Variable
```bash
POLAR_ORGANIZATION_ID=org_xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_POLAR_ORGANIZATION_ID=org_xxxxxxxxxxxxxxxxxxxxxxxx
```

**Note**: You need BOTH variables:
- `POLAR_ORGANIZATION_ID` - Server-side usage
- `NEXT_PUBLIC_POLAR_ORGANIZATION_ID` - Client-side usage (for frontend)

---

## Step 3: Create API Access Token

### Location
Navigate to: **https://polar.sh/dashboard/settings/api**

### Steps
1. In Polar dashboard, click "Settings" → "API Keys"
2. Click "Create Access Token" button
3. Fill in:
   - **Name**: "SuperTool Production" (or "SuperTool Development")
   - **Description**: "Server-side API access for payment processing"
   - **Scopes**: Select the following:
     - ✅ `products:read` - Read product information
     - ✅ `checkouts:write` - Create checkout sessions
     - ✅ `orders:read` - Read order information
     - ✅ `subscriptions:read` - Read subscription information
     - ✅ `webhooks:read` - Verify webhook signatures
4. Click "Create Token"
5. **IMPORTANT**: Copy the token immediately - you won't see it again!

### Token Format
The token will look like: `polar_at_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Environment Variable
```bash
POLAR_ACCESS_TOKEN=polar_at_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Security Notes
- ⚠️ **NEVER commit this token to Git**
- ⚠️ **Keep it secret** - it has full access to your Polar account
- ⚠️ **Store it in `.env.local`** (already in `.gitignore`)
- ⚠️ **Use different tokens** for development and production

---

## Step 4: Create Donation Product

### Location
Navigate to: **https://polar.sh/dashboard/products**

### Steps
1. In Polar dashboard, click "Products" in sidebar
2. Click "Create Product" button
3. Fill in product details:

   **Basic Information**:
   - **Name**: "Support SuperTool" (or "Donation")
   - **Description**: "Help keep SuperTool free and ad-free for everyone!"
   - **Type**: Select "Pay What You Want" (allows custom amounts)

   **Pricing**:
   - **Currency**: USD
   - **Suggested Amount**: $5.00 (optional default)
   - **Minimum Amount**: $1.00
   - **Maximum Amount**: $10,000.00 (or your preferred limit)

   **Settings**:
   - ✅ Enable "One-time payment"
   - ✅ Enable "Recurring subscription" (optional)
   - ✅ Set "Thank you page" to your site URL

4. Click "Create Product"
5. After creation, you'll see the product page
6. Copy the **Product ID** (format: `prod_xxxxxxxxxxxxxxxxxxxxxxxx`)

### Environment Variable
```bash
NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID=prod_xxxxxxxxxxxxxxxxxxxxxxxx
```

**Note**: This is a public variable (prefixed with `NEXT_PUBLIC_`) because it's used in the frontend to initiate checkouts.

---

## Step 5: Setup Webhook Endpoint

### Location
Navigate to: **https://polar.sh/dashboard/settings/webhooks**

### Steps

#### 5.1 Determine Your Webhook URL

**For Production**:
```
https://your-production-domain.com/api/webhooks/polar
```

**For Local Testing**:
You need to expose your localhost to the internet. Options:
- Use **ngrok**: `ngrok http 3000` → gives you a public URL
- Use **localtunnel**: `npx localtunnel --port 3000`
- Use **Polar's test mode** (recommended for initial testing)

Example with ngrok:
```bash
# Install ngrok (if not installed)
brew install ngrok  # macOS
# or download from https://ngrok.com

# Start your dev server
pnpm dev

# In another terminal, expose it
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Your webhook URL: https://abc123.ngrok.io/api/webhooks/polar
```

#### 5.2 Create Webhook Endpoint

1. In Polar dashboard, go to "Settings" → "Webhooks"
2. Click "Create Endpoint" button
3. Fill in:

   **Endpoint URL**:
   ```
   https://your-domain.com/api/webhooks/polar
   ```

   **Description**:
   ```
   Payment webhooks for SuperTool
   ```

   **Events to Subscribe** (select these):
   - ✅ `order.created` - New one-time payment
   - ✅ `subscription.created` - New recurring subscription
   - ✅ `subscription.updated` - Subscription changes
   - ✅ `subscription.canceled` - Subscription canceled
   - ✅ `subscription.revoked` - Subscription revoked

4. Click "Create Endpoint"
5. After creation, you'll see the webhook details
6. **Copy the Webhook Signing Secret** (format: `whsec_xxxxxxxxxxxxxxxxxxxxxxxx`)

### Environment Variable
```bash
POLAR_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx
```

### Security Notes
- ⚠️ The webhook secret is used to verify that webhook requests are truly from Polar
- ⚠️ **NEVER commit this to Git**
- ⚠️ Each webhook endpoint has its own unique secret

---

## Step 6: Get Supabase Service Role Key

### Location
Navigate to: **https://app.supabase.com/project/YOUR_PROJECT_ID/settings/api**

### Steps
1. Open your Supabase project dashboard
2. Go to "Settings" → "API"
3. Scroll down to "Project API keys" section
4. Find the **service_role** key (NOT the anon key!)
5. Click the "eye" icon to reveal the key
6. Copy the full key

### Environment Variable
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Security Notes
- ⚠️ **CRITICAL**: This key bypasses Row Level Security (RLS)
- ⚠️ **NEVER expose this on the client side**
- ⚠️ **NEVER commit to Git**
- ⚠️ Only use this in webhook handlers and server-side operations

### Why We Need This
The webhook handler needs to write to the database without user authentication (since webhooks come from Polar's servers, not from a logged-in user).

---

## Step 7: Setup Environment Variables

### For Development (`.env.local`)

Create or update `.env.local` file in your project root:

```bash
# ========================================
# POLAR PAYMENT CONFIGURATION
# ========================================

# Polar API Access (REQUIRED)
POLAR_ACCESS_TOKEN=polar_at_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
POLAR_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx
POLAR_ORGANIZATION_ID=org_xxxxxxxxxxxxxxxxxxxxxxxx

# Public Polar Configuration (exposed to client)
NEXT_PUBLIC_POLAR_ORGANIZATION_ID=org_xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID=prod_xxxxxxxxxxxxxxxxxxxxxxxx

# ========================================
# SUPABASE SERVICE ROLE (REQUIRED)
# ========================================
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ========================================
# EXISTING SUPABASE CONFIG (already set)
# ========================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### For Production (Vercel/Your Hosting)

Add these as environment variables in your hosting dashboard:

**Vercel**:
1. Go to https://vercel.com/your-project/settings/environment-variables
2. Add each variable:
   - Name: `POLAR_ACCESS_TOKEN`
   - Value: `polar_at_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Environment: Production, Preview, Development (select as needed)
3. Repeat for all variables above
4. Redeploy your application

**Other Hosting Platforms**:
- **Netlify**: Settings → Build & Deploy → Environment
- **Railway**: Settings → Variables
- **Render**: Environment → Environment Variables
- **AWS/Docker**: Use secrets management or `.env` files

---

## Step 8: Verify Configuration

### 8.1 Check Environment Variables

Run this command to verify all required variables are set:

```bash
# In your project root
node -e "
const required = [
  'POLAR_ACCESS_TOKEN',
  'POLAR_WEBHOOK_SECRET',
  'POLAR_ORGANIZATION_ID',
  'NEXT_PUBLIC_POLAR_ORGANIZATION_ID',
  'NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID',
  'SUPABASE_SERVICE_ROLE_KEY'
];

console.log('Checking required environment variables:');
required.forEach(key => {
  const value = process.env[key];
  if (value) {
    console.log(\`✅ \${key}: Set (\${value.substring(0, 15)}...)\`);
  } else {
    console.log(\`❌ \${key}: Missing\`);
  }
});
"
```

### 8.2 Test the Configuration

```bash
# Start your dev server
pnpm dev

# In another terminal, test the checkout API
curl -X POST http://localhost:3000/api/payment/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500,
    "currency": "USD"
  }'

# Expected response: JSON with checkout URL
# {"url": "https://polar.sh/checkout/..."}
```

### 8.3 Test Webhook Endpoint

```bash
# Check if webhook endpoint is accessible
curl -X POST http://localhost:3000/api/webhooks/polar \
  -H "Content-Type: application/json" \
  -d '{"test": "payload"}'

# Expected response: Error about invalid signature (this is good!)
# {"error": "Invalid signature"}
```

---

## Quick Reference

### All Required Environment Variables

| Variable | Type | Where to Get | Purpose |
|----------|------|--------------|---------|
| `POLAR_ACCESS_TOKEN` | Secret | Polar Dashboard → API Keys | Server-side API access |
| `POLAR_WEBHOOK_SECRET` | Secret | Polar Dashboard → Webhooks | Verify webhook signatures |
| `POLAR_ORGANIZATION_ID` | Secret | Polar Dashboard → Settings | Your organization identifier |
| `NEXT_PUBLIC_POLAR_ORGANIZATION_ID` | Public | Same as above | Client-side organization ID |
| `NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID` | Public | Polar Dashboard → Products | Your donation product ID |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Supabase → Settings → API | Webhook database access |

### Variable Formats

```bash
POLAR_ACCESS_TOKEN=polar_at_XXXXXXXXXXXXXXXXXXXXXXXXXXXX
POLAR_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXX
POLAR_ORGANIZATION_ID=org_XXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_POLAR_ORGANIZATION_ID=org_XXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID=prod_XXXXXXXXXXXXXXXXXXXXXXXX
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.XXXXX...
```

---

## Troubleshooting

### "Missing POLAR_ACCESS_TOKEN" Error

**Cause**: Environment variable not loaded

**Solutions**:
1. Make sure `.env.local` exists in project root
2. Restart your dev server after adding env vars
3. Check for typos in variable names
4. Verify the file is not named `.env.local.txt`

### "Invalid signature" Webhook Error

**Cause**: Webhook secret mismatch

**Solutions**:
1. Double-check `POLAR_WEBHOOK_SECRET` matches Polar dashboard
2. Make sure you copied the complete secret (starts with `whsec_`)
3. Recreate the webhook endpoint in Polar if needed

### "Organization not found" Error

**Cause**: Organization ID mismatch

**Solutions**:
1. Verify `POLAR_ORGANIZATION_ID` in Polar settings
2. Make sure you're using the organization ID, not the slug
3. Check both variables are set (public and private)

### "Product not found" Error

**Cause**: Product ID is incorrect or product doesn't exist

**Solutions**:
1. Verify product exists in Polar dashboard
2. Check `NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID`
3. Make sure product is published (not draft)

### Webhook Not Receiving Events

**Possible Causes & Solutions**:

1. **Webhook URL not accessible**:
   - Test URL in browser: `https://your-domain.com/api/webhooks/polar`
   - Should return method not allowed (GET not supported)
   - For localhost, use ngrok or similar tunneling service

2. **Wrong events subscribed**:
   - Check Polar webhook configuration
   - Make sure `order.created` and `subscription.*` are enabled

3. **Firewall blocking requests**:
   - Check your hosting firewall settings
   - Allow incoming requests from Polar's IP ranges

4. **Check Polar webhook logs**:
   - Go to Polar Dashboard → Webhooks → Your Endpoint
   - Click "Recent Deliveries" to see status codes
   - Look for failed deliveries and error messages

---

## Security Checklist

Before going to production, verify:

- [ ] All secret keys are in `.env.local` (NOT committed to Git)
- [ ] `.env.local` is in `.gitignore`
- [ ] Service role key is NEVER exposed to client
- [ ] Webhook signature verification is enabled
- [ ] HTTPS is used in production (not HTTP)
- [ ] Environment variables are set in hosting platform
- [ ] Access token has minimal required scopes
- [ ] Different tokens used for dev/staging/prod

---

## Next Steps

After setting up all environment variables:

1. **Apply Database Migration**:
   ```bash
   # Make sure Supabase CLI is installed
   supabase db push
   ```

2. **Test the Complete Flow**:
   - Follow `docs/POLAR_PAYMENT_TESTING_GUIDE.md`
   - Test checkout creation
   - Make a test payment
   - Verify webhook delivery
   - Check database records

3. **Deploy to Production**:
   - Add all env vars to hosting platform
   - Deploy the application
   - Update webhook URL in Polar to production URL
   - Run production tests

---

## Support

### Polar Documentation
- **Main Docs**: https://docs.polar.sh
- **API Reference**: https://docs.polar.sh/api
- **Webhooks Guide**: https://docs.polar.sh/webhooks

### Polar Support
- **Email**: support@polar.sh
- **Discord**: https://discord.gg/polar
- **Status Page**: https://status.polar.sh

### Common Issues
- Check Polar's status page for service outages
- Review webhook delivery logs in Polar dashboard
- Enable debug logging in development

---

## Summary

You now have all the information needed to get your Polar environment variables:

1. ✅ **Polar Access Token** - API authentication
2. ✅ **Polar Webhook Secret** - Webhook verification
3. ✅ **Polar Organization ID** - Your organization
4. ✅ **Polar Product ID** - Donation product
5. ✅ **Supabase Service Role Key** - Database access

**Total time**: ~15-20 minutes

**Ready to test?** Follow the testing guide at `docs/POLAR_PAYMENT_TESTING_GUIDE.md`
