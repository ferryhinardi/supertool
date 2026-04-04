# 🔐 GitHub Secrets Setup Guide

This guide explains how to configure GitHub repository secrets for CI/CD.

---

## 📋 Required Secrets

### Agentic Workflows (AI Automation)

The repository uses GitHub Agentic Workflows for automated code review, issue triage, and dependency management. These **require** the following secret:

#### `COPILOT_GITHUB_TOKEN`

- **Description:** Fine-grained PAT used exclusively by the GitHub Copilot CLI engine for AI inference
- **Required permission:** `Copilot` → Read-only (**only** this permission is needed)
- **Required by:** All 4 agentic workflows (code-review, issue-triage, test-coverage-check, dependency-update-helper)
- **Symptoms when missing:** Workflows fail with "⚠️ Secret Verification Failed"
- **⚠️ Security:** This is a **private** secret — treat it like a password and never expose it in code or logs (unlike the `NEXT_PUBLIC_*` Supabase keys below, which are intentionally public)
- **How to get:** Create a Fine-grained PAT scoped to this repository with only the **Copilot (read)** permission — see [full instructions in AGENTIC_WORKFLOWS_SETUP.md](AGENTIC_WORKFLOWS_SETUP.md#2-create-personal-access-token-for-copilot_github_token)
- **How to set:**
  ```bash
  gh secret set COPILOT_GITHUB_TOKEN --body "<your-token>" --repo ferryhinardi/supertool
  # Or using gh-aw:
  gh aw secrets set COPILOT_GITHUB_TOKEN --owner ferryhinardi --repo supertool
  ```

---

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

### Agentic workflow fails with "⚠️ Secret Verification Failed"

- **Cause:** `COPILOT_GITHUB_TOKEN` secret is not configured
- **Fix:** Add the secret using the instructions in the "Required Secrets → Agentic Workflows" section above
- **Verify:** Run `gh aw secrets bootstrap --non-interactive` to check which secrets are missing

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

**Need help?** Check the [GitHub Actions logs](../../actions) for detailed error messages.
