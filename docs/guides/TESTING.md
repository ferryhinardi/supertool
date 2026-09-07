# Testing with Vitest Browser Mode

This project uses Vitest with browser mode for testing React components.

## Installation

Install the dependencies with pnpm:

```bash
pnpm install
```

## Running Tests

### Run tests in watch mode

```bash
pnpm test
```

### Run tests with UI

```bash
pnpm test:ui
```

### Run tests in browser mode

```bash
pnpm test:browser
```

## Test Structure

Tests are located in `__tests__` directories next to the components they test:

```
components/
  ui/
    button.tsx
    __tests__/
      button.test.tsx
```

## Writing Tests

Example test:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })
})
```

## Browser Mode

Browser mode runs tests in a real browser environment using Playwright. This provides:

- Real browser APIs
- Better debugging with browser DevTools
- More accurate testing of browser-specific features
- Visual testing capabilities

## Configuration

- `vitest.config.ts` - Main Vitest configuration
- `vitest.setup.ts` - Test setup and global configurations
- Browser: Chromium (via Playwright)
- Environment: jsdom for unit tests, browser for integration tests

## Available Matchers

This project uses `@testing-library/jest-dom` matchers:

- `toBeInTheDocument()`
- `toHaveTextContent()`
- `toHaveClass()`
- `toBeVisible()`
- And more...

## Coverage

Generate coverage report:

```bash
pnpm test -- --coverage
```

Coverage reports will be generated in the `coverage/` directory.

## Continuous Integration

The project uses GitHub Actions for CI/CD with the following workflow:

### CI Pipeline (`.github/workflows/ci.yml`)

1. **Lint & Type Check** - Runs ESLint and TypeScript compiler
2. **Unit & Integration Tests** - Runs all tests in parallel with:
   - Vitest browser mode with Playwright Chromium
   - Coverage reporting (uploaded to Codecov)
   - Screenshot capture on test failures
3. **Build** - Verifies the Next.js build succeeds

### Running Locally

To simulate CI environment locally:

```bash
# Lint and type check
pnpm lint
pnpm exec tsc --noEmit

# Run tests with coverage
pnpm test run --coverage

# Build
pnpm build
```

### Test Artifacts

On test failures, the CI will automatically upload:

- Test screenshots from Vitest browser mode
- Coverage reports to Codecov (if configured)

### Environment Variables for CI

The build step uses the following environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

For CI, these can be set as repository secrets or will use placeholder values for build validation.
