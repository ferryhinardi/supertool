# 🔐 GitHub Secrets Setup Guide

This guide explains how to configure GitHub repository secrets for CI/CD.

---

## 📋 Required Secrets

### CI/CD Pipeline (Supabase Features)

#### 1. `NEXT_PUBLIC_SUPABASE_URL`

- **Description:** Your Supabase project URL
- **Example:** `https://abcdefghijklmnop.supabase.co`
- **Where to find:** Supabase Dashboard → Project Settings → API

#### 2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- **Description:** Your Supabase anonymous/public key
- **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Where to find:** Supabase Dashboard → Project Settings → API

---

## 🚀 How to Add Secrets

### Via GitHub Web UI:

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Your Supabase URL
   - Click **Add secret**
5. Repeat for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Via GitHub CLI:

```bash
# Set Supabase URL
gh secret set NEXT_PUBLIC_SUPABASE_URL -b "https://your-project.supabase.co"

# Set Supabase Anon Key
gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY -b "your-anon-key-here"
```

---

## ⚠️ Important Notes

### Placeholder Values

If secrets are **not set**, the CI will use placeholder values to allow the build to complete:

- `NEXT_PUBLIC_SUPABASE_URL`: `https://placeholder.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `placeholder-anon-key`

This means:

- ✅ Build will succeed
- ⚠️ Upload feature will not work in production
- ⚠️ `/dev/test` page will show "credentials not configured"

### Security

- These are **public** environment variables (prefixed with `NEXT_PUBLIC_`)
- They are safe to expose in client-side code
- They are designed to be public (rate-limited by Supabase)
- For sensitive operations, use Row Level Security (RLS) in Supabase

---

## 🔍 Verifying Secrets

### Check if secrets are set:

```bash
gh secret list
```

### Test the CI build:

1. Push code to `main` or create a PR
2. Go to **Actions** tab on GitHub
3. Watch the "Build" job
4. If secrets are set correctly, build should pass ✅

---

## 🛠️ Local Development

For local development, create a `.env.local` file:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Note:** This file is gitignored and won't be committed.

---

## 📚 Resources

- [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Supabase API Settings](https://supabase.com/docs/guides/api#api-url-and-keys)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

## 🐛 Troubleshooting

### Build fails with "supabaseUrl is required"

- **Cause:** Secrets not set in GitHub
- **Fix:** Follow steps above to add secrets, or wait for placeholder fix

### Secrets not working after adding

- **Cause:** GitHub Actions cache
- **Fix:** Re-run the workflow or push a new commit

### Local development works but CI fails

- **Cause:** Different env variables (`.env.local` vs GitHub Secrets)
- **Fix:** Ensure GitHub secrets match your local `.env.local`

---

**Need help?** Check the [GitHub Actions logs](https://github.com/ferryhinardi/supertool/actions) for detailed error messages.
