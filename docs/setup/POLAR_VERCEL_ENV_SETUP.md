# Polar Payment Integration - Vercel Environment Variables Setup

## Overview
This guide explains how to add the Polar payment integration environment variables to your Vercel project.

**⚠️ Important**: These variables must be added to Vercel **before deploying** the payment integration to production.

---

## Required Environment Variables

You need to add **6 environment variables** to Vercel:

| Variable Name | Type | Description |
|--------------|------|-------------|
| `POLAR_ACCESS_TOKEN` | Secret | Server-side API access token |
| `POLAR_WEBHOOK_SECRET` | Secret | Webhook signature verification |
| `POLAR_ORGANIZATION_ID` | Secret | Your Polar organization ID |
| `NEXT_PUBLIC_POLAR_ORGANIZATION_ID` | Public | Client-side organization ID |
| `NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID` | Public | Donation product ID |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Full database access key |

---

## Step-by-Step Instructions

### Method 1: Using Vercel Dashboard (Recommended)

1. **Go to your Vercel project**:
   - Open https://vercel.com/dashboard
   - Select your project: `supertool` (or your project name)

2. **Navigate to Environment Variables**:
   - Click **Settings** tab
   - Click **Environment Variables** in the left sidebar

3. **Add each variable**:
   
   **Variable 1: POLAR_ACCESS_TOKEN**
   - Name: `POLAR_ACCESS_TOKEN`
   - Value: `polar_oat_zTyewuRWXwV4DdrbaM70lWgylnva8CHqUSeDS2hJasu`
   - Environments: Check all boxes (Production, Preview, Development)
   - Click **Save**
   
   **Variable 2: POLAR_WEBHOOK_SECRET**
   - Name: `POLAR_WEBHOOK_SECRET`
   - Value: `polar_whs_6AcVoG4cwlJULFPpKWsYSYyIitpV60AfHWsik3kJU5c`
   - Environments: Check all boxes
   - Click **Save**
   
   **Variable 3: POLAR_ORGANIZATION_ID**
   - Name: `POLAR_ORGANIZATION_ID`
   - Value: `44fd13eb-dea6-4666-b2f4-9035e47e1c47`
   - Environments: Check all boxes
   - Click **Save**
   
   **Variable 4: NEXT_PUBLIC_POLAR_ORGANIZATION_ID**
   - Name: `NEXT_PUBLIC_POLAR_ORGANIZATION_ID`
   - Value: `44fd13eb-dea6-4666-b2f4-9035e47e1c47`
   - Environments: Check all boxes
   - Click **Save**
   
   **Variable 5: NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID**
   - Name: `NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID`
   - Value: `154cebe5-58d2-424f-bc76-c2eb114ba55f`
   - Environments: Check all boxes
   - Click **Save**
   
   **Variable 6: SUPABASE_SERVICE_ROLE_KEY**
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1renl1eXZncnFqcmhuYnRhZ3loIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTMxMzAyNiwiZXhwIjoyMDc2ODg5MDI2fQ.ll7ChaFqjAZdevDlt3Fnw20vrYo8nWx4L5G4K3QsNgE`
   - Environments: Check all boxes
   - Click **Save**

4. **Verify all variables are added**:
   - You should see 6 variables listed
   - Each should have green checkmarks for all environments

---

### Method 2: Using Vercel CLI (Alternative)

If you prefer using the command line:

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Add environment variables
vercel env add POLAR_ACCESS_TOKEN
# When prompted, paste: polar_oat_zTyewuRWXwV4DdrbaM70lWgylnva8CHqUSeDS2hJasu
# Select: Production, Preview, Development (all)

vercel env add POLAR_WEBHOOK_SECRET
# Paste: polar_whs_6AcVoG4cwlJULFPpKWsYSYyIitpV60AfHWsik3kJU5c

vercel env add POLAR_ORGANIZATION_ID
# Paste: 44fd13eb-dea6-4666-b2f4-9035e47e1c47

vercel env add NEXT_PUBLIC_POLAR_ORGANIZATION_ID
# Paste: 44fd13eb-dea6-4666-b2f4-9035e47e1c47

vercel env add NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID
# Paste: 154cebe5-58d2-424f-bc76-c2eb114ba55f

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1renl1eXZncnFqcmhuYnRhZ3loIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTMxMzAyNiwiZXhwIjoyMDc2ODg5MDI2fQ.ll7ChaFqjAZdevDlt3Fnw20vrYo8nWx4L5G4K3QsNgE

# List all environment variables to verify
vercel env ls
```

---

### Method 3: Using .env File Import (Fastest)

1. Create a file called `vercel-env.txt` with this content:

```
POLAR_ACCESS_TOKEN=polar_oat_zTyewuRWXwV4DdrbaM70lWgylnva8CHqUSeDS2hJasu
POLAR_WEBHOOK_SECRET=polar_whs_6AcVoG4cwlJULFPpKWsYSYyIitpV60AfHWsik3kJU5c
POLAR_ORGANIZATION_ID=44fd13eb-dea6-4666-b2f4-9035e47e1c47
NEXT_PUBLIC_POLAR_ORGANIZATION_ID=44fd13eb-dea6-4666-b2f4-9035e47e1c47
NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID=154cebe5-58d2-424f-bc76-c2eb114ba55f
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1renl1eXZncnFqcmhuYnRhZ3loIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTMxMzAyNiwiZXhwIjoyMDc2ODg5MDI2fQ.ll7ChaFqjAZdevDlt3Fnw20vrYo8nWx4L5G4K3QsNgE
```

2. **Manual copy-paste**:
   - Unfortunately, Vercel doesn't support bulk import from file
   - You'll need to copy each line manually into the dashboard
   - Use Method 1 above for the actual adding process

---

## Important Notes

### 🔒 Security Considerations

1. **Never commit these values to Git**:
   - `.env.local` is already in `.gitignore` ✅
   - `vercel-env.txt` should be deleted after use
   - Vercel environment variables are encrypted at rest

2. **Rotate API keys after testing**:
   - The `POLAR_ACCESS_TOKEN` in this guide was exposed in chat
   - After deploying, create a NEW token in Polar dashboard
   - Update Vercel environment variable with new token
   - Delete the old token from Polar

3. **Service Role Key has full database access**:
   - Only used server-side (webhooks)
   - Never expose to client-side code
   - Monitor Supabase logs for unauthorized access

### 📦 Environment Scope

**Which environments should I select?**

- ✅ **Production**: Required for live payments
- ✅ **Preview**: Recommended for testing PRs
- ✅ **Development**: Optional (use local `.env.local` instead)

**Tip**: For development, use your local `.env.local` file. Only use Vercel Development environment if you're using `vercel dev` locally.

### 🔄 After Adding Variables

1. **Redeploy your application**:
   - Go to **Deployments** tab
   - Click **Redeploy** on the latest deployment
   - Or push a new commit to trigger deployment

2. **Verify environment variables are loaded**:
   - Check deployment logs for any environment variable errors
   - Test the payment flow on your deployed preview/production URL

---

## Verification Steps

After adding all variables to Vercel:

### 1. Check Vercel Dashboard

Go to: `https://vercel.com/[your-team]/supertool/settings/environment-variables`

You should see:
```
✅ POLAR_ACCESS_TOKEN                        (6 characters visible)
✅ POLAR_WEBHOOK_SECRET                     (6 characters visible)
✅ POLAR_ORGANIZATION_ID                    (6 characters visible)
✅ NEXT_PUBLIC_POLAR_ORGANIZATION_ID        (Full value visible)
✅ NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID    (Full value visible)
✅ SUPABASE_SERVICE_ROLE_KEY                (6 characters visible)
```

**Note**: Secret variables only show first 6 characters. Public variables (NEXT_PUBLIC_*) show full values.

### 2. Test on Vercel Preview Deployment

After merging PR #3:

```bash
# Get preview URL from Vercel
git checkout feature/polar-payment-integration
git push origin feature/polar-payment-integration

# Vercel will deploy automatically
# Click the preview link in your PR or get it from Vercel dashboard
```

Then test:
1. Open preview URL: `https://supertool-xyz.vercel.app`
2. Click "Treat Me" button
3. Should redirect to Polar checkout page
4. Complete test payment with: `4242 4242 4242 4242`
5. Check Supabase database for payment record

### 3. Test Webhook Delivery

Update webhook URL in Polar dashboard to point to production/preview:

```
Production: https://supertool.vercel.app/api/webhooks/polar
Preview: https://supertool-[hash].vercel.app/api/webhooks/polar
```

---

## Troubleshooting

### "Environment variable not found" Error

**Symptom**: Build fails with missing environment variable error

**Solution**:
1. Verify variable name is spelled correctly (case-sensitive!)
2. Check that it's added to the correct environment (Production/Preview/Development)
3. Redeploy after adding variables

### "Invalid API key" Error

**Symptom**: Polar API returns 401 Unauthorized

**Solution**:
1. Verify `POLAR_ACCESS_TOKEN` value is correct (no spaces/newlines)
2. Check token hasn't been revoked in Polar dashboard
3. Regenerate token if needed and update Vercel

### "Webhook signature verification failed"

**Symptom**: Webhooks return 400 Bad Request

**Solution**:
1. Verify `POLAR_WEBHOOK_SECRET` matches Polar dashboard
2. Check webhook endpoint URL is correct in Polar
3. Ensure webhook secret hasn't been regenerated

### Database Errors

**Symptom**: Webhooks can't write to database

**Solution**:
1. Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
2. Check database migration has been applied
3. Verify RLS policies allow service role access

---

## Production Checklist

Before going live with payments:

- [ ] All 6 environment variables added to Vercel Production
- [ ] Database migration applied to production Supabase
- [ ] Webhook URL updated in Polar dashboard (production URL)
- [ ] Test payment completed successfully on preview deployment
- [ ] Webhook delivery verified in Polar dashboard
- [ ] Payment record appears in Supabase database
- [ ] **NEW API TOKEN CREATED** (old one exposed in chat)
- [ ] Old API token revoked in Polar dashboard
- [ ] Monitoring/alerting set up for payment errors

---

## Security Best Practices

### After This Setup

1. **Rotate the exposed API key**:
   ```
   1. Go to: https://polar.sh/dashboard/settings/api
   2. Create new token: "SuperTool Production"
   3. Scopes: products:read, checkouts:write, orders:read, subscriptions:read
   4. Copy new token
   5. Update Vercel: POLAR_ACCESS_TOKEN = <new token>
   6. Redeploy application
   7. Delete old token from Polar
   ```

2. **Regular key rotation schedule**:
   - Rotate API keys every 90 days
   - Rotate webhook secrets every 180 days
   - Update Vercel immediately after rotation

3. **Monitor access logs**:
   - Check Polar dashboard for unusual API activity
   - Review Supabase logs for unauthorized database access
   - Set up alerts for failed payment attempts

4. **Restrict API token scopes**:
   - Only grant minimum required permissions
   - Use separate tokens for development/staging/production
   - Never use tokens with `write:*` permissions

---

## Next Steps

After adding environment variables to Vercel:

1. ✅ Merge PR #3 to main branch
2. ✅ Vercel will auto-deploy to production
3. ✅ Test payment flow on production URL
4. ✅ Update webhook URL in Polar dashboard
5. ✅ Create new API token and rotate keys
6. ✅ Monitor first few payments closely
7. ✅ Set up error tracking (Sentry/LogRocket)

---

## Support

If you encounter issues:

1. **Check Vercel deployment logs**: https://vercel.com/[team]/supertool/deployments
2. **Check Polar webhook logs**: https://polar.sh/dashboard/settings/webhooks
3. **Check Supabase logs**: https://supabase.com/dashboard/project/mkzyuyvgrqjrhnbtagy/logs
4. **Review testing guide**: `docs/setup/POLAR_PAYMENT_TESTING_GUIDE.md`
5. **Review troubleshooting**: `docs/setup/POLAR_PAYMENT_TESTING_GUIDE.md#troubleshooting`

---

**Last Updated**: December 25, 2025  
**Related Docs**:
- `docs/setup/POLAR_ENV_SETUP_GUIDE.md` - Local environment setup
- `docs/setup/POLAR_PAYMENT_TESTING_GUIDE.md` - Testing procedures
- `.github/SECRETS_SETUP.md` - GitHub Secrets setup
