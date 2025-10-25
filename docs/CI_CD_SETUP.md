# CI/CD Setup Guide

This guide explains the Continuous Integration and Continuous Deployment setup for SuperTool.

## Overview

The project uses GitHub Actions for automated testing, linting, and building on every push and pull request to the `main` branch.

## Workflow Jobs

### 1. Lint & Type Check

- Runs ESLint to check code quality
- Runs TypeScript compiler to verify type safety
- Must pass before other jobs run

### 2. Unit & Integration Tests

- Installs Playwright Chromium browser
- Runs all 83 unit and integration tests
- Generates code coverage reports
- Uploads coverage to Codecov (optional)
- Captures and uploads screenshots on test failures

### 3. Build

- Verifies Next.js production build succeeds
- Uses environment variables (with fallbacks for testing)
- Uploads build artifacts for deployment

## Jobs Run In Parallel

After the lint job passes, both `test` and `build` jobs run in parallel to save time.

```
lint (required) ──┬──→ test (parallel)
                  └──→ build (parallel)
```

## Setting Up Repository Secrets

### Required for Full CI/CD

1. Go to your GitHub repository → Settings → Secrets and variables → Actions
2. Add the following secrets:

#### For Build (Optional - has fallback)

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

#### For Code Coverage (Optional)

- `CODECOV_TOKEN` - Your Codecov upload token

### How to Get Codecov Token

1. Sign up at [codecov.io](https://codecov.io) with your GitHub account
2. Add your repository
3. Copy the upload token from repository settings
4. Add it as `CODECOV_TOKEN` in GitHub secrets

## Local Testing Before Push

Run these commands locally to catch issues before pushing:

```bash
# Full CI simulation
pnpm lint                    # ESLint check
pnpm exec tsc --noEmit       # Type check
pnpm test run                # Run all tests
pnpm test run --coverage     # Generate coverage
pnpm build                   # Production build
```

Or use the automated lint-staged hook (runs on `git commit`):

```bash
git add .
git commit -m "Your commit message"
# Husky will automatically run lint-staged
```

## Viewing CI Results

### On GitHub

1. Go to your repository on GitHub
2. Click the "Actions" tab
3. View workflow runs for each push/PR

### Status Badges

Add to your README to show CI status:

```markdown
![CI/CD](https://github.com/ferryhinardi/supertool/workflows/CI%2FCD/badge.svg)
```

### Pull Request Checks

- All jobs must pass before merging
- Failed tests will show error details
- Failed tests upload screenshots for debugging

## Workflow Triggers

The CI runs on:

- Every push to `main` branch
- Every pull request targeting `main` branch

## Performance

Typical workflow duration:

- Lint & Type Check: ~30-45 seconds
- Tests: ~1-2 minutes (parallel with build)
- Build: ~1-2 minutes (parallel with tests)

**Total time: ~2-3 minutes** (thanks to parallel execution)

## Troubleshooting

### Tests Failing on CI but Passing Locally

1. Check Node.js version matches (20.x)
2. Run `pnpm install --frozen-lockfile` locally
3. Check for environment-specific code
4. Review test screenshots in CI artifacts

### Build Failing

1. Ensure all environment variables are set correctly
2. Check build logs in GitHub Actions
3. Try building locally with `pnpm build`

### Playwright Browser Issues

If Playwright installation fails:

```bash
pnpm exec playwright install --with-deps chromium
```

## Artifact Retention

- Build artifacts: 7 days
- Test screenshots: 7 days (on failure only)
- Coverage reports: Permanent on Codecov

## Customization

To modify the workflow:

1. Edit `.github/workflows/ci.yml`
2. Refer to [GitHub Actions docs](https://docs.github.com/en/actions)
3. Test changes by pushing to a branch

## Best Practices

✅ **Do:**

- Run tests locally before pushing
- Keep tests fast (< 5 seconds each)
- Write meaningful test descriptions
- Update tests when changing code
- Review CI logs on failures

❌ **Don't:**

- Skip CI checks with `[skip ci]`
- Commit broken tests
- Ignore TypeScript errors
- Push without running lint

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vitest Documentation](https://vitest.dev)
- [Playwright Documentation](https://playwright.dev)
- [Codecov Documentation](https://docs.codecov.com)
