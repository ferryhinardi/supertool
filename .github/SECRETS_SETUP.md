# 🔐 GitHub Secrets Setup Guide

This guide explains how to configure GitHub repository secrets for CI/CD.

---

## 📋 Required Secrets

### For CI/CD Pipeline (Supabase Features)

#### 1. `NEXT_PUBLIC_SUPABASE_URL`

- **Description:** Your Supabase project URL
- **Example:** `https://abcdefghijklmnop.supabase.co`
- **Where to find:** Supabase Dashboard → Project Settings → API

#### 2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- **Description:** Your Supabase anonymous/public key
- **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Where to find:** Supabase Dashboard → Project Settings → API

### For AI-Powered Agentic Workflows

The following secret is **required** for all AI-powered GitHub Agentic Workflows (Code Review Assistant, Test Coverage Analysis, Issue Triage Assistant, Dependency Update Helper) to function:

#### 3. `COPILOT_GITHUB_TOKEN` ⚠️ **REQUIRED for AI workflows**

- **Description:** A Personal Access Token (PAT) that grants access to GitHub Copilot for AI-powered automation
- **Why needed:** The Code Review Assistant, Test Coverage Analysis, Issue Triage, and Dependency Update Helper all use GitHub Copilot CLI as the AI engine. Without this token, these workflows will be skipped with a warning.
- **Requirements:**
  - The GitHub account associated with the token must have a **GitHub Copilot subscription** (Individual, Business, or Enterprise)
  - Token must have the following scopes: `repo` (full repository access), `workflow`, `read:org`
- **How to generate:**
  1. Go to [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
  2. Click "Generate new token (classic)"
  3. Set a descriptive name (e.g., "SuperTool Copilot Workflows")
  4. Select expiration (90 days recommended, or no expiration)
  5. Select scopes: ✅ `repo`, ✅ `workflow`, ✅ `read:org`
  6. Click "Generate token" and **copy the token immediately** (it won't be shown again)
  7. Add it as `COPILOT_GITHUB_TOKEN` in your repository secrets (see instructions below)

> **Note:** If `COPILOT_GITHUB_TOKEN` is not configured, the AI workflows will gracefully skip (not fail) with a warning message. Other CI/CD workflows will continue to work normally.

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
6. Repeat for `COPILOT_GITHUB_TOKEN` (if you have a GitHub Copilot subscription)

### Via GitHub CLI:

```bash
# Set Supabase URL
gh secret set NEXT_PUBLIC_SUPABASE_URL -b "https://your-project.supabase.co"

# Set Supabase Anon Key
gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY -b "your-anon-key-here"

# Set Copilot token (required for AI-powered agentic workflows)
gh secret set COPILOT_GITHUB_TOKEN -b "your-pat-token-here"
```

---

## ⚠️ Important Notes

### Placeholder Values

If Supabase secrets are **not set**, the CI will use placeholder values to allow the build to complete:

- `NEXT_PUBLIC_SUPABASE_URL`: `https://placeholder.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `placeholder-anon-key`

This means:

- ✅ Build will succeed
- ⚠️ Upload feature will not work in production
- ⚠️ `/dev/test` page will show "credentials not configured"

### COPILOT_GITHUB_TOKEN Behavior

If `COPILOT_GITHUB_TOKEN` is **not set**:

- ✅ CI/CD build, tests, and lint will still pass
- ⚠️ All AI-powered agentic workflows will be **skipped** (not failed) with a warning

### Security

- Supabase keys are **public** environment variables (prefixed with `NEXT_PUBLIC_`)
- They are safe to expose in client-side code
- They are designed to be public (rate-limited by Supabase)
- For sensitive operations, use Row Level Security (RLS) in Supabase
- `COPILOT_GITHUB_TOKEN` is a **private** token and should never be exposed in code

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

### Verify AI workflows are working:

1. Create a PR
2. Check the **Code Review Assistant** and **Test Coverage Analysis** workflow runs
3. If `COPILOT_GITHUB_TOKEN` is set correctly, both workflows should run and add comments to your PR
4. If not set, you'll see a warning in the workflow logs but no failure

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
- [GitHub Copilot Subscription](https://github.com/features/copilot)
- [Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [Supabase API Settings](https://supabase.com/docs/guides/api#api-url-and-keys)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

## 🐛 Troubleshooting

### Build fails with "supabaseUrl is required"

- **Cause:** Secrets not set in GitHub
- **Fix:** Follow steps above to add secrets, or wait for placeholder fix

### Code Review Assistant is skipped with warning

- **Cause:** `COPILOT_GITHUB_TOKEN` not set or account doesn't have Copilot subscription
- **Fix:** Generate a PAT with a Copilot-enabled account and add it as `COPILOT_GITHUB_TOKEN`
- **Check:** Verify the token account has an active GitHub Copilot subscription

### Secrets not working after adding

- **Cause:** GitHub Actions cache
- **Fix:** Re-run the workflow or push a new commit

### Local development works but CI fails

- **Cause:** Different env variables (`.env.local` vs GitHub Secrets)
- **Fix:** Ensure GitHub secrets match your local `.env.local`

### Agentic workflow fails with "Secret Verification Failed"

- **Error message:** `Error: None of the following secrets are set: COPILOT_GITHUB_TOKEN`
- **Cause:** `COPILOT_GITHUB_TOKEN` secret is not configured
- **Fix:**
  1. Create a GitHub PAT with `repo`, `workflow`, `read:org`, and `copilot` scopes
  2. Go to **Settings** → **Secrets and variables** → **Actions**
  3. Add `COPILOT_GITHUB_TOKEN` with the PAT value
  4. Re-run the failed workflow
- **Affected workflows:** Issue Triage Assistant, Code Review Assistant, Test Coverage Analysis, Dependency Update Helper

---

**Need help?** Check the [GitHub Actions logs](../../actions) for detailed error messages.
