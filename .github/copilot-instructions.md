# SuperTool - AI Coding Agent Instructions

Modern Next.js 16 developer toolkit with React 19, Tailwind CSS v4, and Vitest browser testing. Focus on glassmorphic dark theme aesthetics and type-safe development.

## Architecture Overview

**App Router Structure**: All pages use Next.js App Router (`app/` directory). Tools are namespaced under `app/tools/[tool-name]/page.tsx`. Each tool is a self-contained client component with analytics tracking.

**Styling System Duality**: This project uses a **hybrid styling approach** with BOTH Panda CSS AND Tailwind CSS v4:

- **Panda CSS + Ark UI** - For UI components in `components/ui/` (Button, Card, Dialog, etc.). Provides type-safe styling with recipes and variants.
- **Tailwind CSS v4** - For app pages, layouts, and utility needs. Fast prototyping with utility classes.
- **Integration** - Both systems work together seamlessly. Import both `globals.css` and `panda.css` in `app/layout.tsx`.

The design system is dark-themed with purple/pink/blue gradients and glassmorphism effects (backdrop-blur, transparent borders).

**State Management**: Use React 19 hooks directly. No external state management. The React Compiler is enabled - avoid manual `useMemo`/`useCallback` unless profiling shows benefit. Mark interactive components with `'use client'` directive.

**Backend**: Supabase for database/storage (`lib/supabaseClient.ts`). API routes in `app/api/` follow Next.js route handlers pattern (`export async function POST/GET`). Example: `app/api/shorten/route.ts` for URL shortener.

## Critical Developer Workflows

### Testing (Vitest + Browser Mode)

```bash
pnpm test              # Watch mode
pnpm test:ui           # Visual UI
pnpm test:browser      # Playwright-powered browser tests
```

**Test Location**: Tests live in `__tests__/` directories alongside components (e.g., `components/ui/__tests__/button.test.tsx`). Use `describe/it/expect` from Vitest. Browser mode required for component tests - first run needs `pnpm exec playwright install chromium`.

**Test Patterns**: Logic tests separate from component tests (see `app/tools/upload/__tests__/logic.test.ts`). Test tool configurations and data structures (see `app/__tests__/page.test.tsx` for validation patterns).

### Code Quality Automation

```bash
pnpm format            # Prettier auto-fix (REQUIRED before commits)
pnpm lint:fix          # ESLint auto-fix
```

**Pre-commit**: Husky runs Prettier on staged files automatically. ESLint configured with React Compiler rules (`react-compiler/react-compiler: error`). Ignore patterns include `.mcp/**` and `scripts/**`.

### Development

```bash
pnpm dev               # http://localhost:3000
pnpm build             # Production build check
```

**Hot Reload**: All file changes hot-reload except `globals.css` and config files. After Tailwind config changes, restart dev server.

## Project-Specific Conventions

### File Organization Pattern

- **Tool pages**: `app/tools/[tool-name]/page.tsx` (must export default function)
- **UI components**: `components/ui/[component].tsx` (shadcn/ui based, export named + variants)
- **Feature components**: `components/features/[Feature].tsx` (complex, reusable logic)
- **Layout components**: `components/layout/[Layout].tsx` (Sidebar, Header)
- **Imports**: Always use `@/` prefix for absolute imports

### Import Order Convention

```tsx
'use client'

// 1. React/Next.js
import { useState } from 'react'

// 2. Third-party libraries
import { toast } from 'sonner'

// 3. UI components
import { Button } from '@/components/ui/button'

// 4. Feature components
import { DragDropZone } from '@/components/features/DragDropZone'

// 5. Utils/libs
import { cx, css } from '@/styled-system/css'
import { trackToolEvent } from '@/lib/analytics'
```

### Styling Guidelines (Non-Negotiable)

- **Use Panda CSS**: Type-safe styling with `css()` and `cx()` from `@/styled-system/css`
- **Primary gradient**: Use `backgroundImage` token with purple-to-pink-to-blue gradient
- **Glassmorphism**: `backdropFilter: 'blur(16px)'` with gradient backgrounds
- **Cards**: Use Panda CSS recipes from `@/styled-system/recipes`
- **Animations**: Framer Motion for complex animations, Panda CSS tokens for simple ones
- **No inline styles**: Use Panda CSS styled system
- **Class merging**: Use `cx()` utility from `@/lib/utils` or `@/styled-system/css`

### Component Patterns

**UI Components** (in `components/ui/`):

- Use Panda CSS recipes for variants (see `button.tsx`, `card.tsx`)
- Use Ark UI primitives for interactions (Dialog, Tooltip, Progress)
- Forward refs with `React.forwardRef`
- Include TypeScript prop interfaces
- Import styles: `import { button } from '@/styled-system/recipes'`
- Merge classes: `import { cx } from '@/lib/utils'`

**Tool Pages** (in `app/tools/`):

```tsx
'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { trackToolEvent } from '@/lib/analytics'

export default function ToolPage() {
  // Tool logic with analytics tracking
  const handleAction = () => {
    trackToolEvent('tool_action', {
      /* metadata */
    })
    toast.success('Action completed 🎉')
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold">Tool Name</h1>
      {/* Tool implementation */}
    </main>
  )
}
```

### Analytics Integration

Every user action must call `trackToolEvent()` from `@/lib/analytics`. Never track PII - anonymize file names, URLs, and inputs. Events are type-safe (see `ToolEvent` union type). Google Analytics 4 configured conditionally based on `NEXT_PUBLIC_GA_MEASUREMENT_ID`.

### Adding New Tools Checklist

1. Create `app/tools/[tool-name]/page.tsx` with default export
2. Add route to Sidebar navigation array (`components/layout/Sidebar.tsx`) with Lucide icon
3. Add tool card to homepage (`app/page.tsx`) with category, tags, and gradient
4. Create `__tests__/` directory with logic and component tests
5. Add analytics events for all user interactions
6. Update this instructions file if new patterns emerge

## Code Formatting (Prettier)

- **No semicolons**
- **Single quotes** for strings
- **100-char line width**
- **2-space indentation**
- **Trailing commas** in multiline
- **Panda CSS**: Type-safe styling with zero runtime overhead

## Integration Points

**Supabase**: Initialize client with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` env vars. Single client instance exported from `lib/supabaseClient.ts`. Used for file uploads and URL shortener storage.

**MCP (Model Context Protocol)**: GitHub, filesystem, git, and sequential-thinking servers configured. Validate with `pnpm mcp:validate`. Requires `GITHUB_TOKEN` env var for GitHub integration. MCP config enables AI-enhanced development workflows.

**Framer Motion**: Reduced motion detection via `useReducedMotion()` hook. Stagger animations on homepage tool cards (see `app/page.tsx` for container/item animation variants pattern).

**CodeMirror**: JSON tool uses `@uiw/react-codemirror` with `@codemirror/lang-json` extension. Dark theme with purple accent colors matching app aesthetic.

## Common Pitfalls

❌ **Don't** manually memoize with `useMemo`/`useCallback` - React Compiler handles it  
❌ **Don't** use `any` types - TypeScript strict mode is enabled  
❌ **Don't** use inline styles - use Panda CSS styled system  
❌ **Don't** forget `'use client'` directive for interactive components  
❌ **Don't** skip analytics tracking on user actions  
❌ **Don't** use semicolons (Prettier will remove them)

✅ **Do** run `pnpm format` before every commit  
✅ **Do** test in browser mode for component tests  
✅ **Do** use `cx()` for conditional class merging  
✅ **Do** follow import order convention  
✅ **Do** maintain glassmorphic dark theme aesthetic

## Key Files Reference

- `app/layout.tsx` - Root layout with Sidebar, gradient background orbs, and Toaster
- `components/layout/Sidebar.tsx` - Navigation array for all tools
- `app/page.tsx` - Homepage with searchable/filterable tool cards
- `lib/analytics.ts` - Type-safe GA4 event tracking
- `vitest.config.ts` - Browser mode test configuration
- `eslint.config.mjs` - React Compiler rules enabled
- `panda.config.ts` - Panda CSS design tokens and configuration
- `app/globals.css` - Global CSS with custom theme tokens

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
