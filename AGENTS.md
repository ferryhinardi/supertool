# SuperTool - Agent Quick Reference

Next.js 15 App Router with React 19, Panda CSS, Vitest browser testing. Dark glassmorphic theme.

## Commands
```bash
pnpm dev                          # Dev server (localhost:3000)
pnpm lint                         # Biome format + lint (auto-fix)
pnpm exec tsc --noEmit           # Type check only
pnpm test                         # Vitest watch mode
pnpm test -- path/to/test.tsx    # Run single test file
CI=true pnpm test run            # CI mode (no watch)
pnpm exec playwright install chromium  # First-time test setup
pnpm build                        # Production build check
```

## Code Style
- **Imports**: Use `@/` prefix. Order: React/Next → 3rd party → UI components → Features → Utils/libs
- **Formatting**: Biome enforces 2-space indent, single quotes, no semicolons, 100-char lines (runs on pre-commit)
- **Types**: Strict mode enabled. Never use `any`. Export interfaces with proper naming (e.g., `ButtonProps`)
- **Components**: Mark client components with `'use client'`. Use React 19 hooks directly (no external state mgmt)
- **Naming**: camelCase for functions/variables, PascalCase for components, SCREAMING_SNAKE_CASE for constants
- **Error Handling**: Always wrap async operations in try/catch, return proper HTTP status codes (400/404/409/500)

## Critical Patterns
- **Styling**: Tool pages MUST use Panda CSS `css()` from `@/styled-system/css` - NOT Tailwind utilities
- **Grid Layouts**: Always use valid values `gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }` + `w: 'full'`
- **Analytics**: Track all user actions with `trackToolEvent()` - never track PII, anonymize file names/URLs
- **Page Layout**: `<main className={css({ mx: 'auto', maxW: '7xl', w: 'full', px: { base: '4', sm: '6', md: '8' }, py: { base: '6', sm: '8', md: '10' }, spaceY: { base: '6', sm: '8', md: '10' } })}>`
- **Mobile-First**: Minimum 44px touch targets, responsive typography, stack layouts vertically on mobile

## Reference
Canonical styling example: `app/tools/unit-converter/page.tsx`  
Full guidelines: `.github/copilot-instructions.md` (1271 lines)
