# Quick Start - Vitest Browser Testing

## Setup

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Install Playwright browsers (required for browser mode):**
   ```bash
   pnpm exec playwright install chromium
   ```

## Commands

| Command                   | Description               |
| ------------------------- | ------------------------- |
| `pnpm test`               | Run tests in watch mode   |
| `pnpm test:ui`            | Open Vitest UI dashboard  |
| `pnpm test:browser`       | Run tests in browser mode |
| `pnpm test -- --coverage` | Generate coverage report  |
| `pnpm test -- --run`      | Run tests once (no watch) |

## Quick Test

Run the example button test:

```bash
pnpm test button.test
```

## Browser Mode

Browser mode runs tests in a real Chromium browser using Playwright. This provides:

✅ Real browser environment  
✅ Browser DevTools for debugging  
✅ Visual testing capabilities  
✅ Screenshot on failure

## Creating a New Test

1. Create a test file next to your component:

   ```
   components/ui/your-component.tsx
   components/ui/__tests__/your-component.test.tsx
   ```

2. Write your test:

   ```tsx
   import { describe, it, expect } from 'vitest'
   import { render, screen } from '@testing-library/react'
   import { YourComponent } from '../your-component'

   describe('YourComponent', () => {
     it('renders correctly', () => {
       render(<YourComponent />)
       expect(screen.getByRole('...')).toBeInTheDocument()
     })
   })
   ```

3. Run your test:
   ```bash
   pnpm test your-component
   ```

## Troubleshooting

### Playwright browsers not installed

```bash
pnpm exec playwright install chromium
```

### Port already in use

Kill the process using the port or change the port in `vitest.config.ts`

### Tests not found

Make sure your test files match: `**/*.{test,spec}.{ts,tsx}`

## Learn More

- [Vitest Documentation](https://vitest.dev/)
- [Vitest Browser Mode](https://vitest.dev/guide/browser)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright](https://playwright.dev/)
