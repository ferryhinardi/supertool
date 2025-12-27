# SuperTool - AI Coding Agent Instructions

Modern Next.js 16 developer toolkit with React 19, Panda CSS, and Vitest browser testing. Focus on glassmorphic dark theme aesthetics and type-safe development.

## Architecture Overview

**App Router Structure**: All pages use Next.js App Router (`app/` directory). Tools are namespaced under `app/tools/[tool-name]/page.tsx`. Each tool is a self-contained client component with analytics tracking.

**Styling System Duality**: This project uses **BOTH Panda CSS AND Tailwind CSS v4**:

- **Panda CSS + Ark UI** - Type-safe UI components in `components/ui/` using recipes from `panda.recipes.ts`. Import with `import { button } from '@/styled-system/recipes'`
- **Tailwind CSS v4** - Utility classes for app pages and layouts. Used alongside Panda CSS.
- **Integration** - Both `globals.css` and `panda.css` are imported in `app/layout.tsx`. Use `.glass` class for glassmorphism effects.

The design system is dark-themed with purple/pink/blue gradients (see `app/globals.css` CSS variables) and glassmorphism effects (backdrop-blur, transparent borders).

**State Management**: Use React 19 hooks directly. No external state management. **React Compiler is enabled** - avoid manual `useMemo`/`useCallback` unless profiling shows benefit. Mark interactive components with `'use client'` directive.

**Backend**: Supabase for database/storage (`lib/supabaseClient.ts`). API routes in `app/api/` follow Next.js route handlers pattern (`export async function POST/GET`).

**API Route Pattern**: Routes use a dual-mode approach:

- **In-memory Map** for demo/development (e.g., `urlStore = new Map()` in `app/api/shorten/route.ts`)
- **Supabase** for production persistence (when environment variables are configured)
- Pattern: Start with Map-based demo, add Supabase migration path with env var checks
- All routes return `NextResponse.json()` with proper HTTP status codes (400, 404, 409, 500)

## Critical Developer Workflows

### Testing (Vitest + Browser Mode)

```bash
CI=true pnpm test              # Watch mode
CI=true pnpm test:ui           # Visual UI
CI=true pnpm test:browser      # Playwright-powered browser tests
CI=true pnpm test run --coverage  # Run tests with coverage report
```

**First Time Setup**: Run `pnpm exec playwright install chromium` to install browser dependencies.

**Test Location**: Tests live in `__tests__/` directories alongside components (e.g., `components/ui/__tests__/button.test.tsx`). Use `describe/it/expect` from Vitest. Browser mode required for component tests.

**Test Patterns**:

- Logic tests separate from component tests (see `app/tools/upload/__tests__/logic.test.ts`)
- Test tool configurations and data structures (see `app/__tests__/page.test.tsx`)
- Setup file: `vitest.setup.ts` imports `@testing-library/jest-dom/vitest`

### Test Coverage Requirements (CRITICAL)

**MANDATORY**: All new code MUST achieve **>= 95% test coverage** for:
- Lines
- Functions
- Branches
- Statements

**Coverage Enforcement**:
- CI/CD pipeline automatically fails if coverage drops below 95%
- Coverage reports generated on every push and PR
- Coverage badge updated automatically in README.md
- Coverage reports available as GitHub Actions artifacts

**Writing Comprehensive Tests**:

1. **API Routes** (`app/api/**/route.ts`):
   - Test all HTTP methods (POST, GET, PUT, DELETE)
   - Test request validation (missing fields, invalid types)
   - Test error scenarios (400, 401, 404, 409, 429, 500, 503)
   - Test successful responses with correct data
   - Test edge cases (empty data, malformed JSON, rate limits)
   - Mock external API calls (OpenAI, Supabase, etc.)

2. **Component Tests** (`app/tools/**/page.tsx`, `components/**/*.tsx`):
   - Test initial render and DOM elements
   - Test user interactions (clicks, form inputs, file uploads)
   - Test state changes and side effects
   - Test conditional rendering based on props/state
   - Test error states and loading states
   - Test keyboard navigation and accessibility
   - Mock dependencies (toast, analytics, fetch)

3. **Utility Functions** (`lib/**/*.ts`):
   - Test all function branches and edge cases
   - Test error handling and validation
   - Test with various input types (valid, invalid, edge cases)
   - Test async operations with mocked promises

4. **Hooks** (`hooks/**/*.ts`):
   - Test hook initialization and state
   - Test hook updates and side effects
   - Test cleanup functions
   - Use `@testing-library/react-hooks` for hook testing

**Example Test Structure**:

```typescript
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

// Mock all external dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/lib/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    it('should render component with all elements', () => {
      render(<ComponentName />)
      expect(screen.getByText('Expected Text')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should handle button click', async () => {
      render(<ComponentName />)
      const button = screen.getByRole('button', { name: /click me/i })
      await userEvent.click(button)
      expect(mockFunction).toHaveBeenCalled()
    })
  })

  describe('Error Scenarios', () => {
    it('should show error message on failure', async () => {
      mockFunction.mockRejectedValueOnce(new Error('Test error'))
      render(<ComponentName />)
      // ... test error handling
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty input', () => {
      // Test with empty/null/undefined values
    })
  })
})
```

**Coverage Viewing**:
```bash
# Generate and view coverage report
CI=true pnpm test run --coverage
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
```

**Pre-commit Coverage Check**:
All code must pass coverage thresholds before committing. The CI pipeline will reject PRs that don't meet the 95% threshold.

### Code Quality Automation

```bash
pnpm format            # Prettier auto-fix (REQUIRED before commits)
pnpm lint:fix          # ESLint auto-fix
pnpm build             # Production build check (runs Panda codegen first)
```

**Pre-commit**: Husky runs Prettier on staged files automatically via `lint-staged`.

**ESLint**: React Compiler rules enabled (`react-compiler/react-compiler: error`). Ignore patterns include `.mcp/**` and `scripts/**`.

**Prettier**: No semicolons, single quotes, 100-char line width, 2-space indentation (see `.prettierrc`).

### CI/CD Pipeline Debugging

**CRITICAL**: Always verify CI checks pass before pushing to ensure deployment succeeds.

#### GitHub Actions CI Workflow

The CI pipeline runs 3 parallel jobs (see `.github/workflows/ci.yml`):

1. **Lint & Type Check** - Code quality validation
2. **Unit & Integration Tests** - Test suite execution  
3. **Build** - Production build verification

#### Local CI Verification (Run Before Pushing)

**Run these commands locally to catch issues before CI:**

```bash
# 1. Lint Check (matches CI lint job)
pnpm lint
# Expected: "Checked X files. No fixes applied." or "Found X warnings"
# Warnings are non-blocking (continue-on-error: true)

# 2. Type Check (matches CI type check)
pnpm exec tsc --noEmit
# Expected: No output = success
# Any "error TS" output = failure

# 3. Build Check (matches CI build job)
pnpm build
# Expected: "✓ Compiled successfully" and route table
# Watch for: Build errors, FFmpeg accessibility, route generation

# 4. Test Suite (matches CI test job - OPTIONAL)
CI=true pnpm test run
# Expected: "X passed" with no failures
# First time: Run `pnpm exec playwright install chromium`
```

#### Debugging Build Failures

**Common build issues and solutions:**

1. **TypeScript Errors**
   ```bash
   # Check for type errors
   pnpm exec tsc --noEmit
   
   # Common fixes:
   # - Add missing type imports
   # - Fix unused variables (prefix with _)
   # - Remove `any` types
   # - Add proper return types
   ```

2. **Lint Warnings**
   ```bash
   # Run lint with auto-fix
   pnpm lint
   
   # Common fixes:
   # - Unused variables: prefix with _ (e.g., _accessError)
   # - Array index keys: use unique IDs instead
   # - Non-null assertions: add proper null checks
   # - Optional chain: use ?. instead of && checks
   ```

3. **Build Errors**
   ```bash
   # Clean build and retry
   rm -rf .next
   pnpm build
   
   # Common issues:
   # - Invalid gridTemplateColumns (use '1fr' not '1')
   # - Missing imports or components
   # - Server component using client hooks
   # - Invalid Panda CSS syntax
   ```

4. **FFmpeg/Binary Dependencies**
   ```bash
   # Verify FFmpeg is accessible
   pnpm build 2>&1 | grep -i ffmpeg
   
   # Should see: "✅ FFmpeg binary accessible at: [path]"
   # Check next.config.ts has: serverExternalPackages: ['ffmpeg-static']
   ```

#### Checking CI Status on GitHub

**Using GitHub CLI (`gh`):**

```bash
# View latest CI run status
gh run list --limit 1

# Watch current CI run
gh run watch

# View specific run details
gh run view [RUN_ID]

# Check job status with JSON output
gh run view [RUN_ID] --json conclusion,status,jobs

# View failed job logs
gh run view --job=[JOB_ID] --log-failed
```

**Expected successful output:**
```json
{
  "conclusion": "success",
  "status": "completed",
  "jobs": [
    {"name": "Lint & Type Check", "conclusion": "success"},
    {"name": "Unit & Integration Tests", "conclusion": "success"},
    {"name": "Build", "conclusion": "success"}
  ]
}
```

**Using GitHub Web UI:**

1. Go to repository → **Actions** tab
2. Click on latest workflow run
3. Verify all 3 jobs show green checkmarks ✓
4. Check individual job logs for errors/warnings

**CI Status Badges:**
- ✓ Green = All checks passed
- ✗ Red = At least one check failed
- ○ Yellow/Orange = In progress

#### CI Pipeline Expected Results

**Lint & Type Check Job (≈1-2 minutes):**
```
✓ Approve build scripts for ffmpeg-static
✓ Install dependencies
✓ Run ESLint (warnings allowed)
✓ Type check (no errors)
```

**Unit & Integration Tests Job (≈3-4 minutes):**
```
✓ Install dependencies
✓ Install Playwright browsers
✓ Run unit tests
  - Test Files: 100+ passed
  - Tests: 2500+ passed
✓ Run tests with coverage
✓ Upload coverage reports (may warn if Codecov token missing)
```

**Build Job (≈2-3 minutes):**
```
✓ Install dependencies
✓ Build project
  - Compiled successfully
  - Static pages generated (100+)
  - FFmpeg binary accessible
✓ Upload build artifacts
```

#### Common CI Failures and Fixes

| Failure | Cause | Solution |
|---------|-------|----------|
| Type check fails | TypeScript errors | Run `tsc --noEmit` locally, fix type errors |
| Build fails | Invalid syntax/imports | Run `pnpm build` locally, check error output |
| Tests timeout | Infinite loops/hangs | Check test files for async issues, add timeouts |
| FFmpeg not found | Missing serverExternalPackages | Add to `next.config.ts` and `vercel.json` |
| Out of memory | Large builds | Reduce bundle size or increase Vercel memory in `vercel.json` |

#### Pre-Push Checklist

Before pushing code, ensure:

- [ ] `pnpm lint` runs without errors (warnings OK)
- [ ] `pnpm exec tsc --noEmit` shows no type errors
- [ ] `pnpm build` completes successfully
- [ ] All new/modified tests pass with `CI=true pnpm test run`
- [ ] Husky pre-commit hooks pass (runs automatically on `git commit`)
- [ ] CI workflow file (`.github/workflows/ci.yml`) is not modified unless intentional

**Quick CI Pre-flight Script:**
```bash
# Run all CI checks locally
pnpm lint && \
pnpm exec tsc --noEmit && \
pnpm build && \
echo "✅ All CI checks passed locally!"
```

#### Post-Push CI/CD Monitoring (CRITICAL)

**ALWAYS monitor CI/CD pipeline after pushing to ensure all checks pass.**

When you push to `origin/main`, immediately monitor the CI/CD pipeline to completion:

```bash
# Method 1: Watch latest CI run interactively
gh run watch

# Method 2: Watch specific run ID
RUN_ID=$(gh run list --limit 1 --json databaseId --jq '.[0].databaseId')
gh run watch $RUN_ID

# Method 3: Check status and wait for completion
gh run list --limit 1 --json status,conclusion,displayTitle
```

**Expected workflow completion:**
- ✓ Lint & Type Check (1-2 minutes)
- ✓ Unit & Integration Tests (3-4 minutes)  
- ✓ Build (2-3 minutes)

**If ANY check fails:**
1. View failure logs: `gh run view --log-failed`
2. Fix the issues immediately
3. Commit and push the fix
4. Monitor the new CI run until all checks pass

**Do NOT leave failing CI checks unresolved.** The pipeline must be green before moving to the next task.

**Example monitoring session:**
```bash
# After git push origin main
git push origin main

# Immediately start monitoring
gh run watch

# Expected output: All 3 jobs show ✓ green checkmarks
# ✓ Lint & Type Check
# ✓ Unit & Integration Tests  
# ✓ Build
```

**Common CI failures and quick fixes:**
- TypeScript errors → Run `pnpm exec tsc --noEmit` locally and fix
- Build errors → Run `pnpm build` locally and fix syntax/import issues
- Test failures → Run `CI=true pnpm test run` locally and fix failing tests
- Lint warnings → Run `pnpm lint` and address issues (warnings allowed but failures block)

#### Troubleshooting CI on Vercel/Deployment

If CI passes but deployment fails:

1. **Check environment variables** - Ensure `NEXT_PUBLIC_*` vars are set in Vercel
2. **Check build logs** - Vercel dashboard → Deployments → View build logs
3. **Verify vercel.json** - Function timeout and memory limits
4. **Check serverExternalPackages** - Native binaries require special handling
5. **Test production build locally** - `pnpm build && pnpm start`

For production issues, check:
- Vercel function logs for runtime errors
- Browser console for client-side errors  
- Network tab for API failures
- Supabase logs for database issues

### Development

```bash
pnpm dev               # http://localhost:3000
pnpm prepare           # Run Panda codegen + Husky setup
```

**Hot Reload**: All file changes hot-reload except `globals.css` and config files. After Panda config changes, restart dev server or run `pnpm prepare`.

## Project-Specific Conventions

### File Organization Pattern

- **Tool pages**: `app/tools/[tool-name]/page.tsx` (must export default function)
- **UI components**: `components/ui/[component].tsx` (Ark UI based, export named + variants)
- **Feature components**: `components/features/[Feature].tsx` (complex, reusable logic like DragDropZone)
- **Layout components**: `components/layout/[Layout].tsx` (Sidebar, Header)
- **API routes**: `app/api/[route]/route.ts` (export async POST/GET functions)
- **Imports**: Always use `@/` prefix for absolute imports (configured in `tsconfig.json`)

### Import Order Convention

```tsx
"use client";

// 1. React/Next.js
import { useState } from "react";

// 2. Third-party libraries
import { toast } from "sonner";

// 3. UI components
import { Button } from "@/components/ui/button";

// 4. Feature components
import { DragDropZone } from "@/components/features/DragDropZone";

// 5. Utils/libs
import { cx } from "@/lib/utils";
import { trackToolEvent } from "@/lib/analytics";
```

### Styling Guidelines (Non-Negotiable)

- **UI Components**: Use Panda CSS recipes from `@/styled-system/recipes` (see `panda.recipes.ts`)
- **Tool Pages**: Use Panda CSS `css()` function from `@/styled-system/css` for all layouts and styling
- **Glassmorphism**: Use `.glass` class from `globals.css` or `backdrop-blur-*` utilities
- **Gradients**: Use `bgGradient: 'to-r', gradientFrom: 'purple.500', gradientVia: 'pink.500', gradientTo: 'blue.500'` pattern for brand consistency
- **Class merging**: Use `cx()` utility from `@/lib/utils` for conditional classes
- **No inline styles**: All styling must use Panda CSS - never use inline `style` objects or Tailwind utilities in tool pages

**CRITICAL: Tool pages MUST use Panda CSS `css()` exclusively, NOT Tailwind utility classes.**

**❌ WRONG - Using Tailwind utilities directly:**

```tsx
<div className="space-y-4 text-center">
  <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2">
    <Network className="h-5 w-5 text-blue-400" />
    <span className="text-sm font-semibold text-blue-300">Badge Text</span>
  </div>
</div>
```

**✅ CORRECT - Using Panda CSS `css()` function:**

```tsx
<div className={css({ textAlign: "center", spaceY: "4" })}>
  <div
    className={css({
      display: "inline-flex",
      alignItems: "center",
      gap: "2",
      rounded: "full",
      border: "1px solid",
      borderColor: "blue.500/20",
      bg: "blue.500/10",
      px: "4",
      py: "2",
    })}
  >
    <Network className={css({ h: "5", w: "5", color: "blue.400" })} />
    <span
      className={css({
        fontSize: "sm",
        fontWeight: "semibold",
        color: "blue.300",
      })}
    >
      Badge Text
    </span>
  </div>
</div>
```

**Reference**: Always look at `app/tools/unit-converter/page.tsx` as the canonical example of correct Panda CSS usage in tool pages. **DO NOT reference `app/tools/password-generator/page.tsx`, `app/tools/hash-generator/page.tsx`, or any other tool page** - many other pages have inconsistent or outdated styling patterns that don't follow the established conventions.

**Common Mistakes to Avoid:**

- ❌ Using `className="glass"` with inline `style={{ padding: '24px' }}` on Card components
- ❌ Using non-responsive padding like `px: '4', py: '8'` instead of responsive objects like `px: { base: '4', sm: '6', md: '8' }`
- ❌ Using Tailwind utility classes directly like `className="space-y-4 text-center"` instead of `className={css({ spaceY: '4', textAlign: 'center' })}`
- ❌ Using template literals with conditional classes like `className={\`flex gap-2 \${condition ? 'bg-green-500' : 'bg-red-500'}\`}` instead of Panda CSS
- ❌ Missing `w: 'full'` on main container
- ❌ Using plain `<h2>` tags instead of `<CardTitle>` in Card headers
- ❌ Wrapping Card content in extra `<div className={css({ spaceY: '6' })}>` when `CardContent` has built-in padding

**CRITICAL Grid Layout Bug - Invalid gridTemplateColumns Syntax:**

This is a **high-severity** bug pattern that breaks responsive layouts. It has affected 10+ tool pages in the codebase.

❌ **WRONG - Invalid base value breaks grid rendering:**

```tsx
<div
  className={css({
    display: "grid",
    gridTemplateColumns: {
      base: "1", // ❌ INVALID - This breaks the grid completely
      sm: "repeat(2, 1fr)",
      lg: "repeat(3, 1fr)",
    },
  })}
>
```

**Why this fails**: Panda CSS interprets `"1"` as an invalid grid-template-columns value. The grid collapses and items don't render properly. The correct base value must be a valid CSS grid value like `"1fr"`.

✅ **CORRECT - Valid base value with full width:**

```tsx
<div
  className={css({
    display: "grid",
    w: "full", // ✅ REQUIRED - Ensures grid takes full container width
    gap: "4",
    gridTemplateColumns: {
      base: "1fr", // ✅ VALID - Single column on mobile
      sm: "repeat(2, 1fr)", // 2 columns on small screens
      lg: "repeat(3, 1fr)", // 3 columns on large screens
    },
  })}
>
```

**Key Rules for Grid Layouts:**

1. **Always use valid CSS grid values** - `"1fr"`, `"repeat(2, 1fr)"`, `"minmax(0, 1fr)"` - NEVER just `"1"`
2. **Always add `w: 'full'`** to grid containers - Without it, grids may not take full width
3. **Test responsive breakpoints** - Verify grid renders correctly at base, sm, md, lg breakpoints
4. **Single column on mobile** - Use `base: "1fr"` for mobile-first single column layouts

**Common Grid Patterns:**

```tsx
// 1-2-3 column responsive grid (most common)
gridTemplateColumns: {
  base: "1fr",           // Mobile: single column
  sm: "repeat(2, 1fr)",  // Tablet: 2 columns
  lg: "repeat(3, 1fr)",  // Desktop: 3 columns
}

// 1-2 column responsive grid
gridTemplateColumns: {
  base: "1fr",           // Mobile: single column
  md: "repeat(2, 1fr)",  // Tablet+: 2 columns
}

// Auto-fit responsive grid (advanced)
gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))"
```

**Historical Context**: This bug was discovered during systematic reviews in October 2025. Fixed across 10 tool pages (commits a1c9631, 7b1c2d3). Pages affected: unit-converter, password-generator, qr-code, json-to-csv, hash-generator, upload, image-optimizer, video-converter, prompt-formatter, pdf-tools.

### Component Patterns

**UI Components** (in `components/ui/`):

```tsx
import * as React from "react";
import { ark } from "@ark-ui/react";
import { Slot } from "@radix-ui/react-slot";
import { button } from "@/styled-system/recipes";
import { cx } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : ark.button;
    return (
      <Comp
        className={cx(button({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
```

**Tool Pages** (in `app/tools/`):

```tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { trackToolEvent } from "@/lib/analytics";
import { css } from "@/styled-system/css";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function ToolPage() {
  const handleAction = () => {
    trackToolEvent("tool_action", { success: true });
    toast.success("Action completed 🎉");
  };

  return (
    <main
      className={css({
        mx: "auto",
        maxW: "7xl",
        w: "full",
        px: { base: "4", sm: "6", md: "8" },
        py: { base: "6", sm: "8", md: "10" },
        spaceY: { base: "6", sm: "8", md: "10" },
      })}
    >
      {/* Header with gradient title */}
      <div className={css({ textAlign: "center", spaceY: "4" })}>
        <h1
          className={css({
            fontSize: { base: "4xl", sm: "5xl", md: "6xl" },
            fontWeight: "extrabold",
            bgGradient: "to-r",
            gradientFrom: "blue.400",
            gradientVia: "cyan.400",
            gradientTo: "teal.400",
            bgClip: "text",
          })}
          style={{
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Tool Name
        </h1>
      </div>

      {/* Card with proper structure */}
      <Card
        className={css({
          border: "1px solid",
          borderColor: "blue.500/20",
          bg: "gray.900/50",
          backdropFilter: "blur(16px)",
        })}
      >
        <CardHeader>
          <CardTitle>Section Title</CardTitle>
          <CardDescription>Section description</CardDescription>
        </CardHeader>
        <CardContent className={css({ spaceY: "6" })}>
          {/* Card content - CardContent already has padding */}
        </CardContent>
      </Card>
    </main>
  );
}
```

### Page Layout Pattern (REQUIRED)

**All tool pages MUST follow this standardized layout structure using Panda CSS:**

```tsx
import { css } from "@/styled-system/css";

export default function ToolPage() {
  return (
    <main
      className={css({
        mx: "auto",
        maxW: "7xl", // or '1400px' for wider layouts
        w: "full",
        px: { base: "4", sm: "6", md: "8" },
        py: { base: "6", sm: "8", md: "10" },
        spaceY: { base: "6", sm: "8", md: "10" },
      })}
    >
      {/* Page content */}
    </main>
  );
}
```

**Layout Breakdown:**

- `<main>` - Semantic HTML5 main element (required)
- `mx: 'auto'` - Center content horizontally
- `maxW: '7xl'` - Maximum width 80rem (1280px) or use `'1400px'` for wider layouts
- `w: 'full'` - Full width up to max width
- `px: { base: '4', sm: '6', md: '8' }` - Responsive horizontal padding
  - base (mobile): 1rem (16px)
  - sm (640px+): 1.5rem (24px)
  - md (768px+): 2rem (32px)
- `py: { base: '6', sm: '8', md: '10' }` - Responsive vertical padding
  - base: 1.5rem (24px)
  - sm: 2rem (32px)
  - md: 2.5rem (40px)
- `spaceY: { base: '6', sm: '8', md: '10' }` - Vertical spacing between sections

**Section Spacing Guidelines:**

- Between major sections: `spaceY: { base: '6', sm: '8', md: '10' }`
- Within cards/panels: `spaceY: '4'` or `spaceY: '6'`
- Card internal padding: `p: '4'` to `p: '6'`
- Grid gaps: `gap: '4'` to `gap: '6'`

**Do NOT use:**

- ❌ Tailwind utility classes in tool pages (use Panda CSS `css()` instead)
- ❌ Inline `style` objects for margin/padding
- ❌ Custom pixel values in `style` attributes
- ❌ `<div>` as the root wrapper (use `<main>`)
- ❌ Inconsistent spacing patterns across tools

**Common Layout Patterns:**

**Header Section:**

```tsx
<div className={css({ textAlign: "center", spaceY: "4" })}>
  <div
    className={css({
      display: "inline-flex",
      alignItems: "center",
      gap: "2",
      rounded: "full",
      border: "1px solid",
      borderColor: "purple.500/20",
      bg: "purple.500/10",
      px: "4",
      py: "2",
    })}
  >
    {/* Badge content */}
  </div>
  <h1
    className={css({
      fontSize: { base: "4xl", sm: "5xl", md: "6xl" },
      fontWeight: "bold",
      bgGradient: "to-r",
      gradientFrom: "purple.400",
      gradientVia: "pink.400",
      gradientTo: "blue.400",
      bgClip: "text",
    })}
    style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
  >
    {/* Gradient title */}
  </h1>
  <p
    className={css({
      mx: "auto",
      maxW: "2xl",
      fontSize: "lg",
      color: "gray.400",
    })}
  >
    {/* Description */}
  </p>
</div>
```

**Card Grid:**

```tsx
<div
  className={css({
    display: "grid",
    gap: "4",
    gridTemplateColumns: {
      base: "1",
      sm: "repeat(2, 1fr)",
      lg: "repeat(3, 1fr)",
    },
  })}
>
  {items.map((item) => (
    <Card key={item.id}>{/* Card content */}</Card>
  ))}
</div>
```

**Full-Width Card:**

```tsx
<Card
  className={css({
    border: "1px solid",
    borderColor: "gray.800",
    bg: "gray.900/50",
  })}
>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent className={css({ spaceY: "6" })}>
    {/* Card content with consistent vertical spacing */}
  </CardContent>
</Card>
```

**Responsive Breakpoints:**

- **base** (< 640px): Mobile - tighter spacing, single column
- **sm** (640px+): Small tablet - medium spacing, 2 columns
- **md** (768px+): Tablet - generous spacing
- **lg** (1024px+): Desktop - 3-4 columns

### Analytics Integration

Every user action must call `trackToolEvent()` from `@/lib/analytics`. Never track PII - anonymize file names, URLs, and inputs. Events are type-safe (see `ToolEvent` union type in `lib/analytics.ts`). Google Analytics 4 configured conditionally based on `NEXT_PUBLIC_GA_MEASUREMENT_ID` env var.

**Event Pattern**: `trackToolEvent('json_beautify', { success: true, input_length: 100 })`

### SEO & Structured Data

**Metadata**: Use `generateToolMetadata()` from `@/lib/metadata` in tool layouts. It handles OpenGraph, Twitter cards, and JSON-LD structured data automatically.

**Breadcrumbs & FAQs**: Add breadcrumb navigation and FAQ structured data to tool layouts for rich snippets in search results:

```tsx
import type { Metadata } from "next";
import Script from "next/script";
import { generateToolMetadata, generateToolBreadcrumbs } from "@/lib/metadata";
import {
  generateBreadcrumbSchema,
  generateFAQSchema,
} from "@/lib/structured-data";

export const metadata: Metadata = generateToolMetadata({
  title: "Tool Name",
  description: "SEO-optimized description",
  keywords: ["keyword1", "keyword2"],
  category: "development",
  path: "/tools/tool-name",
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://supertool.id";
const breadcrumbs = generateToolBreadcrumbs("Tool Name");

const faqs = [
  {
    question: "What is this tool?",
    answer: "Comprehensive answer with keywords for SEO.",
  },
  // Add 3-4 FAQs per tool
];

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe usage for JSON-LD structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema(breadcrumbs, baseUrl)
          ),
        }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe usage for JSON-LD structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFAQSchema(faqs)),
        }}
      />
    </>
  );
}
```

**Important**: Always add `biome-ignore` comment before `dangerouslySetInnerHTML` when used for JSON-LD structured data. This is a safe use case and the comment suppresses false-positive security warnings.

### Adding New Tools Checklist

**IMPORTANT**: Always read this checklist before creating a plan for adding new tools.

1. Create `app/tools/[tool-name]/page.tsx` with default export
2. **Follow the Page Layout Pattern** (use `<main>` with standardized Panda CSS classes)
3. **Check if reusable components are needed**:
   - Extract UI logic only when used in 2+ tools or for standard patterns
   - Create components in `components/ui/` with TypeScript interfaces
   - Use Panda CSS (never Tailwind utilities in components)
   - Meet accessibility requirements (ARIA, keyboard nav, semantic HTML)
   - Write tests achieving >= 95% coverage for new components
   - See `.github/skills/ui-components-creation/SKILL.md` for detailed guide
4. Add route to `navigation` array in `components/layout/Sidebar.tsx` with Lucide icon
5. Add tool card to `tools` array in `lib/tools.ts` with category, tags, gradient, and features
6. **Create SEO-optimized metadata and layout** (`app/tools/[tool-name]/layout.tsx`):
   - Use `generateToolMetadata()` from `@/lib/metadata` with proper title, description, and keywords
   - Include structured data (breadcrumbs and FAQs) using `generateBreadcrumbSchema()` and `generateFAQSchema()`
   - Ensure descriptions are 150-160 characters for optimal snippet length
   - Include relevant keywords naturally in title and description
   - Add 3-4 SEO-focused FAQs that answer common user questions
7. **Optimize tool page content for SEO**:
   - Use semantic HTML5 elements (`<main>`, `<section>`, `<h1>`, `<h2>`)
   - Include primary keyword in H1 title with natural gradient styling
   - Add descriptive subheadings (H2) for major sections
   - Include help/usage section with keyword-rich content
   - Use descriptive alt text for icons and images
   - Ensure content is at least 300 words when including help sections
8. **Mobile-first responsive design**:
   - **Touch-friendly UI**: Minimum 44px touch targets for buttons and interactive elements
   - **Responsive typography**: Use responsive font sizes with base/sm/md/lg breakpoints
   - **Mobile navigation**: Ensure sidebar/navigation works properly on mobile devices
   - **Viewport optimization**: Add proper viewport meta tags and test on mobile devices
   - **Performance**: Optimize for mobile bandwidth with lazy loading and efficient assets
   - **Accessibility**: Ensure keyboard navigation and screen reader compatibility
9. **URL and routing optimization**:
   - Use kebab-case for tool names (e.g., `/tools/json-beautify`)
   - Keep URLs short and descriptive (avoid deep nesting)
   - Include primary keyword in URL path when possible
10. **Create comprehensive tests with >= 95% coverage** (`__tests__/` directory):
   - **Unit tests**: Test all functions, utilities, and logic in isolation
   - **Integration tests**: Test component rendering, user interactions, and workflows
   - **API tests**: Test all API routes with request validation and error scenarios
   - **Edge case tests**: Test boundary conditions, empty states, error states
   - **Mock external dependencies**: Mock toast, analytics, fetch, external APIs
   - Run `CI=true pnpm test run --coverage` to verify coverage meets 95% threshold
11. Add analytics events for all user interactions
12. Update `ToolEvent` type in `lib/analytics.ts` if needed
13. **Create comprehensive documentation** in `docs/` with numbered prefix (e.g., `15_TOOL_NAME.md`):
    - Explain how the tool works and its purpose
    - Include creation date and last updated timestamp
    - Document key features, usage instructions, and technical implementation
    - Add analytics events, UI/UX details, and future enhancements
    - Make each documentation unique with different structure and focus areas
14. **Update tool documentation** whenever implementation changes to keep docs current
15. **Run local CI checks** to ensure CI pipeline won't break (matches `.github/workflows/ci.yml`):
    - `pnpm lint` - ESLint validation
    - `pnpm exec tsc --noEmit` - Type checking
    - `CI=true pnpm test run` - Unit & integration tests (requires Playwright: `pnpm exec playwright install chromium`)
    - `pnpm build` - Production build verification

#### SEO Tool Layout Example

```tsx
// app/tools/example-tool/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import { generateToolMetadata, generateToolBreadcrumbs } from "@/lib/metadata";
import {
  generateBreadcrumbSchema,
  generateFAQSchema,
} from "@/lib/structured-data";

export const metadata: Metadata = generateToolMetadata({
  title: "Example Tool - Free Online Utility",
  description:
    "Professional example tool for developers. Convert, format, and optimize your data with this free online utility. No registration required.",
  keywords: [
    "example tool",
    "online utility",
    "free converter",
    "developer tools",
  ],
  category: "development",
  path: "/tools/example-tool",
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://supertool.id";
const breadcrumbs = generateToolBreadcrumbs("Example Tool");

const faqs = [
  {
    question: "What is the Example Tool?",
    answer:
      "The Example Tool is a free online utility that helps developers convert and format data quickly. It works entirely in your browser without requiring registration or file uploads.",
  },
  {
    question: "Is the Example Tool free to use?",
    answer:
      "Yes, the Example Tool is completely free to use. There are no hidden costs, registration requirements, or usage limits.",
  },
  {
    question: "Does the tool work offline?",
    answer:
      "Yes, all processing happens locally in your browser. Your data never leaves your device, ensuring complete privacy and security.",
  },
];

export default function ExampleToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe usage for JSON-LD structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema(breadcrumbs, baseUrl)
          ),
        }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe usage for JSON-LD structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFAQSchema(faqs)),
        }}
      />
    </>
  );
}
```

#### SEO Tool Page Structure (Mobile-First)

```tsx
// app/tools/example-tool/page.tsx
// Reference: unit-converter/page.tsx for mobile-first patterns
export default function ExampleTool() {
  return (
    <main
      className={css({
        mx: "auto",
        maxW: "7xl",
        w: "full",
        px: { base: "4", sm: "6", md: "8" },
        py: { base: "6", sm: "8", md: "10" },
        spaceY: { base: "6", sm: "8", md: "10" },
      })}
    >
      {/* SEO-optimized header with badge - Mobile responsive */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={css({ textAlign: "center", spaceY: "4" })}
      >
        <div
          className={css({
            display: "inline-flex",
            alignItems: "center",
            gap: "3",
            rounded: "full",
            border: "1px solid",
            borderColor: "purple.500/30",
            bg: "purple.500/10",
            px: "5",
            py: "2",
            backdropFilter: "blur(8px)",
          })}
        >
          <Sparkles className={css({ h: "5", w: "5", color: "purple.400" })} />
          <span className={css({ fontSize: "sm", fontWeight: "semibold", color: "purple.300" })}>
            Professional Tool • Free Forever
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: "4xl", sm: "5xl", md: "6xl" },
            fontWeight: "extrabold",
            bgGradient: "to-r",
            gradientFrom: "purple.400",
            gradientVia: "pink.400",
            gradientTo: "blue.400",
            bgClip: "text",
          })}
          style={{
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Example Tool
        </h1>

        <p
          className={css({
            mx: "auto",
            maxW: "3xl",
            fontSize: { base: "lg", sm: "xl" },
            color: "gray.400",
          })}
        >
          Convert and format your data with this professional online tool. Fast,
          secure, and completely free - no registration required.
        </p>
      </motion.div>

      {/* Category/Options selection - Advanced responsive grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Card
          className={css({
            border: "1px solid",
            borderColor: "purple.500/20",
            bg: "gray.900/50",
            backdropFilter: "blur(16px)",
          })}
        >
          <CardHeader>
            <CardTitle>Select Options</CardTitle>
            <CardDescription>Choose your conversion or processing options</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={css({
                display: "grid",
                gridTemplateColumns: {
                  base: "repeat(2, 1fr)",      // 2 columns on mobile
                  sm: "repeat(3, 1fr)",        // 3 columns on small screens
                  md: "repeat(4, 1fr)",        // 4 columns on medium
                  lg: "repeat(6, 1fr)",        // 6 columns on large screens
                },
                gap: "3",
              })}
            >
              {options.map((option) => (
                <Button
                  key={option.id}
                  onClick={() => handleOptionChange(option.id)}
                  className={css({
                    h: "auto",
                    flexDirection: "column",
                    gap: "2",
                    py: "4",
                    px: "3",
                    bg: isActive ? "purple.500/20" : "gray.800/50",
                    border: "1px solid",
                    borderColor: isActive ? "purple.500/50" : "gray.700/50",
                    color: isActive ? "purple.300" : "gray.400",
                    transition: "all 0.2s",
                    _hover: {
                      bg: isActive ? "purple.500/30" : "gray.800",
                      borderColor: isActive ? "purple.500/70" : "gray.600",
                      transform: "translateY(-2px)",
                    },
                  })}
                >
                  <span className={css({ fontSize: "sm", fontWeight: "semibold" })}>
                    {option.name}
                  </span>
                  <span className={css({ fontSize: "xs", color: "gray.500" })}>
                    {option.description}
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main tool functionality - Mobile optimized forms */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card
          className={css({
            border: "1px solid",
            borderColor: "purple.500/20",
            bg: "gray.900/50",
            backdropFilter: "blur(16px)",
          })}
        >
          <CardHeader>
            <CardTitle>Convert Your Data</CardTitle>
            <CardDescription>Enter your input and get instant results</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: "6" })}>
            {/* Input section with mobile-friendly grid layout */}
            <div className={css({ spaceY: "3" })}>
              <label
                htmlFor="input-data"
                className={css({ fontSize: "sm", fontWeight: "medium", color: "gray.300" })}
              >
                Input Data
              </label>
              <div className={css({ display: "grid", gridTemplateColumns: "1fr auto", gap: "3" })}>
                <Input
                  id="input-data"
                  type="text"
                  inputMode="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter your data here..."
                  className={css({
                    h: "14", // 56px - good touch target
                    fontSize: "xl",
                    bg: "gray.800/50",
                    border: "1px solid",
                    borderColor: "gray.700",
                    _focus: { borderColor: "purple.500", ring: "2px", ringColor: "purple.500/20" },
                  })}
                />
                <select
                  value={inputFormat}
                  onChange={(e) => setInputFormat(e.target.value)}
                  className={css({
                    h: "14",
                    minW: "40",
                    rounded: "lg",
                    border: "1px solid",
                    borderColor: "gray.700",
                    bg: "gray.800/50",
                    px: "4",
                    fontSize: "base",
                    color: "gray.200",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    _hover: { bg: "gray.800", borderColor: "gray.600" },
                    _focus: {
                      outline: "none",
                      borderColor: "purple.500",
                      ring: "2px",
                      ringColor: "purple.500/20",
                    },
                  })}
                >
                  {inputFormats.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action button - Mobile touch-friendly */}
            <div className={css({ display: "flex", justifyContent: "center" })}>
              <Button
                onClick={handleConvert}
                size="lg"
                className={css({
                  gap: "2",
                  minH: "12", // 48px minimum touch target
                  px: "8",
                  bg: "purple.500/20",
                  border: "1px solid",
                  borderColor: "purple.500/50",
                  color: "purple.300",
                  _hover: {
                    bg: "purple.500/30",
                    transform: "translateY(-1px)",
                    transition: "all 0.2s",
                  },
                })}
              >
                <ArrowRight className={css({ h: "5", w: "5" })} />
                Convert Data
              </Button>
            </div>

            {/* Result section with proper mobile styling */}
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={css({
                  rounded: "lg",
                  border: "1px solid",
                  borderColor: "purple.500/20",
                  bg: "purple.500/5",
                  p: "4",
                })}
              >
                <div className={css({ display: "flex", alignItems: "center", gap: "2", mb: "2" })}>
                  <CheckCircle className={css({ h: "4", w: "4", color: "purple.400" })} />
                  <span
                    className={css({ fontSize: "sm", fontWeight: "medium", color: "purple.300" })}
                  >
                    Conversion Result
                  </span>
                </div>
                <pre className={css({ fontSize: "sm", color: "gray.300", wordBreak: "break-all" })}>
                  {result}
                </pre>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
          {/* Input section */}
          <div className={css({ spaceY: { base: "3", sm: "4" } })}>
            {/* Mobile-friendly input controls */}
          </div>

          {/* Output/result section */}
          <div className={css({ spaceY: { base: "3", sm: "4" } })}>
            {/* Mobile-optimized results display */}
          </div>
        </div>

        {/* Mobile-friendly action buttons */}
        <div
          className={css({
            display: "flex",
            flexDirection: { base: "column", sm: "row" },
            gap: { base: "2", sm: "3" },
            mt: { base: "4", sm: "6" },
            justifyContent: { base: "stretch", sm: "center" },
          })}
        >
          <Button
            size="lg"
            className={css({
              minH: "11", // 44px minimum touch target
              fontSize: { base: "sm", sm: "base" },
              px: { base: "6", sm: "8" },
            })}
          >
            Primary Action
          </Button>
          <Button
            variant="outline"
            size="lg"
            className={css({
              minH: "11", // 44px minimum touch target
              fontSize: { base: "sm", sm: "base" },
              px: { base: "6", sm: "8" },
            })}
          >
            Secondary Action
          </Button>
        </div>
      </section>

      {/* Pro Tips section - Better pattern than generic "How to use" */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card
          className={css({
            border: "1px solid",
            borderColor: "cyan.500/20",
            bg: "cyan.500/5",
            backdropFilter: "blur(16px)",
          })}
        >
          <CardContent className={css({ py: "6" })}>
            <div className={css({ display: "flex", alignItems: "start", gap: "4" })}>
              <Sparkles className={css({ h: "6", w: "6", color: "cyan.400", flexShrink: "0" })} />
              <div className={css({ spaceY: "2" })}>
                <h3 className={css({ fontSize: "lg", fontWeight: "semibold", color: "cyan.300" })}>
                  Pro Tips
                </h3>
                <ul className={css({ spaceY: "2", fontSize: "sm", color: "gray.400" })}>
                  <li>• Use keyboard shortcuts for faster processing</li>
                  <li>• Save frequently used formats as presets for quick access</li>
                  <li>• All conversions work offline and process locally</li>
                  <li>• Supports drag-and-drop for file inputs</li>
                  <li>• Copy results with one click using the copy button</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
```

#### Mobile-Friendly Component Guidelines

**Touch Targets:**

```tsx
// Minimum 44px (11 in Tailwind) for touch elements
<Button className={css({ minH: "11", minW: "11" })}>
  Touch Me
</Button>

// Interactive areas with proper spacing
<div className={css({
  p: { base: "3", sm: "4" }, // More padding on mobile for easier tapping
  gap: { base: "3", sm: "2" }, // Larger gaps on mobile
})}>
```

**Responsive Typography:**

```tsx
// Scalable text that's readable on all devices
<h1 className={css({
  fontSize: { base: "2xl", sm: "3xl", md: "4xl", lg: "5xl" },
  lineHeight: { base: "1.3", sm: "1.2" }, // Tighter line height on larger screens
})}>

// Body text with proper mobile spacing
<p className={css({
  fontSize: { base: "sm", sm: "base" },
  lineHeight: { base: "1.6", sm: "1.5" },
  px: { base: "2", sm: "0" }, // Add padding on mobile for edge readability
})}>
```

**Layout Stacking:**

```tsx
// Stack vertically on mobile, grid on desktop
<div className={css({
  display: "grid",
  gap: { base: "4", sm: "6" },
  gridTemplateColumns: {
    base: "1fr", // Single column on mobile
    md: "repeat(2, 1fr)", // Two columns on medium screens and up
    lg: "repeat(3, 1fr)", // Three columns on large screens
  },
})}>

// Flex direction changes for mobile
<div className={css({
  display: "flex",
  flexDirection: { base: "column", sm: "row" },
  gap: { base: "2", sm: "4" },
})}>
```

### Tool Categories System

Tools are organized into 5 categories (defined in `app/page.tsx`):

- **`data`** - Data manipulation and formatting (JSON, CSV, XML)
- **`media`** - Image/video/audio processing and optimization
- **`development`** - Developer utilities (diff viewer, regex tester, cron builder)
- **`productivity`** - General productivity tools (text transform, URL shortener, markdown editor)
- **`security`** - Security and cryptography (Base64, hash generator, encryption)

**Tool Card Properties**:

```tsx
interface Tool {
  title: string; // Display name
  description: string; // Detailed description for SEO
  icon: React.ElementType; // Lucide icon component
  href: string; // Route path (e.g., '/tools/json-beautify')
  gradient: string; // Tailwind gradient (e.g., 'from-purple-500 to-pink-500')
  features: string[]; // 4 key features for card display
  category: ToolCategory; // One of the 5 categories
  comingSoon?: boolean; // Gray out and disable link
  popular?: boolean; // Show star badge
  new?: boolean; // Show "NEW" badge
}
```

**Gradient Patterns** - Maintain visual consistency:

- Purple/Pink: `from-purple-500 to-pink-500` (data tools)
- Blue/Cyan: `from-blue-500 to-cyan-500` (cloud/storage)
- Green/Emerald: `from-green-500 to-emerald-500` (markdown/docs)
- Orange/Red: `from-orange-500 to-red-500` (comparison/diff)
- Teal/Cyan: `from-teal-500 to-cyan-500` (media processing)

### API Route Pattern Example

All API routes follow this dual-mode structure (see `app/api/shorten/route.ts`):

```tsx
import { NextRequest, NextResponse } from "next/server";

// In-memory storage for demo (replace with Supabase for production)
const dataStore = new Map<string, DataType>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!body.requiredField) {
      return NextResponse.json({ error: "Field is required" }, { status: 400 });
    }

    // Check for conflicts
    if (dataStore.has(body.id)) {
      return NextResponse.json({ error: "Already exists" }, { status: 409 });
    }

    // Store data
    dataStore.set(body.id, { ...body, createdAt: new Date().toISOString() });

    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  const data = dataStore.get(id);
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
```

## Integration Points

**Supabase**: Initialize client with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` env vars. Single client instance exported from `lib/supabaseClient.ts`.

**MCP (Model Context Protocol)**: Multiple AI-enhanced development servers configured in `.mcp/mcp.json`:

- **Ark UI MCP** (`@ark-ui/mcp`) - **PRIMARY UI DESIGN SYSTEM**. Query Ark UI component documentation, examples, and patterns directly. Use this for component architecture decisions.
- **GitHub** - Issues, PRs, workflows, repository operations (requires `GITHUB_TOKEN`)
- **Filesystem** - Read/write files, search, directory tree (project root access)
- **Git** - Status, diff, log, commit history
- **Memory** - Persist context between sessions with entity/relation graphs
- **Sequential Thinking** - Multi-step reasoning for complex problems
- **Fetch** - HTTP requests for external APIs

**Validation**: Run `pnpm mcp:validate` to check MCP configuration. Ark UI MCP provides instant access to component APIs, props, composition patterns, and styling examples without needing to search docs.

**Framer Motion**: Use `useReducedMotion()` hook for accessibility. Stagger animations on homepage tool cards (see `app/page.tsx` for container/item animation variants pattern).

**CodeMirror**: JSON tool uses `@uiw/react-codemirror` with `@codemirror/lang-json` extension. Dark theme with purple accent colors.

**Toast Notifications**: Use `toast` from `sonner`. Configured in `app/layout.tsx` with glassmorphic styling.

## Common Pitfalls

❌ **Don't** manually memoize with `useMemo`/`useCallback` - React Compiler handles it  
❌ **Don't** use `any` types - TypeScript strict mode is enabled  
❌ **Don't** use inline styles - use Panda CSS `css()` function  
❌ **Don't** use Tailwind utilities in tool pages - use Panda CSS `css()` exclusively (e.g., `className="flex gap-4"` is WRONG, use `className={css({ display: 'flex', gap: '4' })}`)  
❌ **Don't** forget `'use client'` directive for interactive components  
❌ **Don't** skip analytics tracking on user actions  
❌ **Don't** use semicolons (Prettier will remove them)  
❌ **Don't** use invalid grid syntax like `gridTemplateColumns: { base: '1' }` - use `'1fr'` instead (see Styling Guidelines section)

✅ **Do** run `pnpm format` before every commit (Husky enforces this)  
✅ **Do** test in browser mode for component tests  
✅ **Do** use `cx()` for conditional class merging  
✅ **Do** follow import order convention  
✅ **Do** maintain glassmorphic dark theme aesthetic  
✅ **Do** use Panda CSS `css()` for all tool page layouts and styling  
✅ **Do** reference `app/tools/unit-converter/page.tsx` as the canonical styling example  
✅ **Do** add `w: 'full'` to all grid containers and use valid CSS grid values

## Key Files Reference

- `app/layout.tsx` - Root layout with Sidebar, gradient background orbs, Toaster config
- `components/layout/Sidebar.tsx` - Navigation array for all tools
- `app/page.tsx` - Homepage with searchable/filterable tool cards
- `lib/analytics.ts` - Type-safe GA4 event tracking
- `vitest.config.ts` - Browser mode test configuration
- `eslint.config.mjs` - React Compiler rules enabled
- `panda.config.ts` - Panda CSS design tokens (purple/pink/blue theme)
- `panda.recipes.ts` - Component recipes (button, card, badge, etc.)
- `app/globals.css` - CSS variables and `.glass` utility class

## Environment Variables

```bash
# Required for Supabase features
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Optional analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=

# MCP integration (in shell config, not .env)
export GITHUB_TOKEN=
```
