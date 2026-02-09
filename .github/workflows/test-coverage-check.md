---
# Trigger - when should this workflow run?
on:
  pull_request:
    types: [opened, synchronize]

# Permissions - what can this workflow access?
permissions:
  contents: read
  issues: read
  pull-requests: read

# Outputs - what APIs and tools can the AI use?
safe-outputs:
  add-comment:
    max: 1

---

# Test Coverage Analysis

Analyzes test coverage for new and modified code in pull requests.

## Instructions

1. **Analyze PR Changes**:
   - Identify all new or modified `.tsx`, `.ts` files (excluding test files)
   - Check if corresponding test files exist in `__tests__/` directories
   - Look for test patterns: `*.test.tsx`, `*.test.ts`

2. **Check Test Coverage Requirements**:
   - **New Tools**: Must have tests at page level (`app/tools/[tool]/__tests__/page.test.tsx`)
   - **New Components**: Should have unit tests in `components/*/__tests__/`
   - **API Routes**: Should have integration tests
   - **Critical Features**: Aim for >80% coverage

3. **Evaluate Test Quality**:
   - Tests should use React Testing Library patterns
   - Check for proper assertions (`expect(...).toBeInTheDocument()`)
   - Look for user interaction testing (`userEvent.click`, `userEvent.type`)
   - Verify mocking of external dependencies (Supabase, APIs)

4. **Provide Feedback**:
   - Leave ONE comment with:
     - 📊 Coverage Summary: What files have/need tests
     - ✅ Well-tested: Files with good test coverage
     - ⚠️ Missing Tests: Files that need test coverage
     - 📝 Example: Provide a test template for the most critical missing test
   - Be specific about which files need tests
   - Reference `docs/reference/WARP.md` testing section

5. **Coverage Thresholds**:
   - Report if coverage falls below 70% (target: >70%)
   - Flag critical paths below 80% (target: >80%)

## Context

**Testing Stack**:
- Vitest + React Testing Library
- Browser mode with Playwright
- Coverage reporting with Istanbul

**Test Location Patterns**:
```
app/tools/my-tool/
  page.tsx
  __tests__/
    page.test.tsx       # Integration tests

components/ui/
  button.tsx
  __tests__/
    button.test.tsx     # Unit tests

components/features/
  DragDropZone.tsx
  __tests__/
    DragDropZone.test.tsx
```

**Example Test Template**:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import MyComponent from '../page'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText(/Expected Text/i)).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    render(<MyComponent />)
    await userEvent.click(screen.getByRole('button'))
    expect(screen.getByText(/Result/i)).toBeInTheDocument()
  })
})
```

**Commands**:
```bash
pnpm test                        # Watch mode
CI=true pnpm test run           # CI mode
pnpm test run --coverage        # Generate coverage
```
