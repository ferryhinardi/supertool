# SuperTool - Agent Quick Reference

Next.js 15 App Router with React 19, Panda CSS, Vitest browser testing. Dark glassmorphic theme.

## Commands
```bash
pnpm dev                          # Dev server (localhost:3000)
pnpm lint                         # Biome format + lint (auto-fix)
pnpm lint:check                   # Biome check only (no auto-fix)
pnpm exec tsc --noEmit           # Type check only
pnpm test                         # Vitest watch mode
pnpm test -- path/to/test.tsx    # Run single test file
pnpm test -- --grep "test name"  # Run tests matching pattern
CI=true pnpm test run            # CI mode (no watch)
pnpm exec playwright install chromium  # First-time test setup
pnpm build                        # Production build check
pnpm mcp:validate                 # Validate MCP tool definitions
```

## Code Style
- **Imports**: Use `@/` prefix. Order: React/Next → 3rd party → UI components → Features → Utils/libs
- **Formatting**: Biome enforces 2-space indent, single quotes, no semicolons, 100-char lines (runs on pre-commit)
- **Types**: Strict mode enabled. Never use `any`. Export interfaces with proper naming (e.g., `ButtonProps`)
- **Components**: Mark client components with `'use client'`. Use React 19 hooks directly (no external state mgmt)
- **Naming**: camelCase for functions/variables, PascalCase for components, SCREAMING_SNAKE_CASE for constants
- **Error Handling**: Always wrap async operations in try/catch, return proper HTTP status codes (400/404/409/500)
- **Files**: One component per file. Test files in `__tests__/` directories adjacent to source

## Critical Patterns

### Styling (Panda CSS)
- Tool pages MUST use Panda CSS `css()` from `@/styled-system/css` - NOT Tailwind utilities
- Grid Layouts: Always use valid values + `w: 'full'`:
  ```tsx
  gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }
  ```
- Page Layout standard:
  ```tsx
  <main className={css({ mx: 'auto', maxW: '7xl', w: 'full', px: { base: '4', sm: '6', md: '8' }, py: { base: '6', sm: '8', md: '10' }, spaceY: { base: '6', sm: '8', md: '10' } })}>
  ```

### Analytics
- Track all user actions with `trackToolEvent()` - never track PII
- Anonymize file names, URLs, and user content before tracking
- Required events: tool_used, feature_interaction, error_occurred

### Mobile-First Design
- Minimum 44px touch targets for all interactive elements
- Responsive typography: Use Panda CSS responsive values
- Stack layouts vertically on mobile, grid on larger screens

## Testing
- **Framework**: Vitest + Playwright browser mode
- **Coverage**: 95% threshold required
- **Location**: Tests in `__tests__/` directories adjacent to source files
- **Mocking**: Mock external dependencies, API calls, and browser APIs
- **Patterns**:
  ```tsx
  // Component test example
  import { render, screen } from '@testing-library/react'
  import { describe, it, expect } from 'vitest'
  
  describe('ComponentName', () => {
    it('renders correctly', () => {
      render(<ComponentName />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })
  ```

## API Routes
- Use Next.js 15 App Router route handlers in `app/api/` directory
- Return proper status codes: 200 (success), 400 (bad request), 404 (not found), 409 (conflict), 500 (server error)
- Always validate input and return typed responses
- Example pattern:
  ```tsx
  export async function POST(request: Request) {
    try {
      const body = await request.json()
      // validate and process
      return Response.json({ data }, { status: 200 })
    } catch (error) {
      return Response.json({ error: 'message' }, { status: 500 })
    }
  }
  ```

## Copilot CLI
Source aliases: `source scripts/copilot-aliases.sh`

| Alias | Purpose |
|-------|---------|
| `cop` | Quick explain - `cop "what does this do"` |
| `copg` | Git help - `copg "undo last commit"` |
| `cop-lint` | Fix lint errors with AI guidance |
| `cop-test` | Generate/fix tests |
| `cop-commit` | Generate commit message |
| `cop-new-tool` | Scaffold new tool page |

Full docs: `docs/COPILOT_CLI.md`

## CI/CD Workflow
Primary workflow: `.github/workflows/copilot-review.yml`

| Job | Purpose |
|-----|---------|
| `commit-validation` | Validates conventional commit format |
| `security-scan` | Audit, secret scanning, anti-pattern detection |
| `ai-review` | Lint, typecheck, MCP validation, code analysis |
| `suggest-fixes` | AI-powered fix suggestions when issues found |

MCP validation: `pnpm mcp:validate` (runs `scripts/validate-mcp.js`)

## Reference
- Canonical styling example: `app/tools/unit-converter/page.tsx`
- Full guidelines: `.github/copilot-instructions.md` (1743 lines)
- Contributing guide: `CONTRIBUTING.md`
