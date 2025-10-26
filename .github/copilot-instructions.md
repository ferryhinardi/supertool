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
pnpm test              # Watch mode
pnpm test:ui           # Visual UI
pnpm test:browser      # Playwright-powered browser tests
```

**First Time Setup**: Run `pnpm exec playwright install chromium` to install browser dependencies.

**Test Location**: Tests live in `__tests__/` directories alongside components (e.g., `components/ui/__tests__/button.test.tsx`). Use `describe/it/expect` from Vitest. Browser mode required for component tests.

**Test Patterns**:

- Logic tests separate from component tests (see `app/tools/upload/__tests__/logic.test.ts`)
- Test tool configurations and data structures (see `app/__tests__/page.test.tsx`)
- Setup file: `vitest.setup.ts` imports `@testing-library/jest-dom/vitest`

### Code Quality Automation

```bash
pnpm format            # Prettier auto-fix (REQUIRED before commits)
pnpm lint:fix          # ESLint auto-fix
pnpm build             # Production build check (runs Panda codegen first)
```

**Pre-commit**: Husky runs Prettier on staged files automatically via `lint-staged`.

**ESLint**: React Compiler rules enabled (`react-compiler/react-compiler: error`). Ignore patterns include `.mcp/**` and `scripts/**`.

**Prettier**: No semicolons, single quotes, 100-char line width, 2-space indentation (see `.prettierrc`).

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
import { cx } from '@/lib/utils'
import { trackToolEvent } from '@/lib/analytics'
```

### Styling Guidelines (Non-Negotiable)

- **UI Components**: Use Panda CSS recipes from `@/styled-system/recipes` (see `panda.recipes.ts`)
- **Tool Pages**: Use Tailwind CSS utility classes
- **Glassmorphism**: Use `.glass` class from `globals.css` or `backdrop-blur-*` utilities
- **Gradients**: Use `from-purple-500 via-pink-500 to-blue-500` pattern for brand consistency
- **Class merging**: Use `cx()` utility from `@/lib/utils` for conditional classes
- **No inline styles**: Prefer Panda CSS or Tailwind utilities

### Component Patterns

**UI Components** (in `components/ui/`):

```tsx
import * as React from 'react'
import { ark } from '@ark-ui/react'
import { Slot } from '@radix-ui/react-slot'
import { button } from '@/styled-system/recipes'
import { cx } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : ark.button
    return <Comp className={cx(button({ variant, size }), className)} ref={ref} {...props} />
  }
)
Button.displayName = 'Button'

export { Button }
```

**Tool Pages** (in `app/tools/`):

```tsx
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { trackToolEvent } from '@/lib/analytics'

export default function ToolPage() {
  const handleAction = () => {
    trackToolEvent('tool_action', { success: true })
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

Every user action must call `trackToolEvent()` from `@/lib/analytics`. Never track PII - anonymize file names, URLs, and inputs. Events are type-safe (see `ToolEvent` union type in `lib/analytics.ts`). Google Analytics 4 configured conditionally based on `NEXT_PUBLIC_GA_MEASUREMENT_ID` env var.

**Event Pattern**: `trackToolEvent('json_beautify', { success: true, input_length: 100 })`

### Adding New Tools Checklist

1. Create `app/tools/[tool-name]/page.tsx` with default export
2. Add route to `navigation` array in `components/layout/Sidebar.tsx` with Lucide icon
3. Add tool card to `tools` array in `app/page.tsx` with category, tags, gradient, and features
4. Create `__tests__/` directory with logic and component tests
5. Add analytics events for all user interactions
6. Update `ToolEvent` type in `lib/analytics.ts` if needed
7. **Create comprehensive documentation** in `docs/` with numbered prefix (e.g., `15_TOOL_NAME.md`):
   - Explain how the tool works and its purpose
   - Include creation date and last updated timestamp
   - Document key features, usage instructions, and technical implementation
   - Add analytics events, UI/UX details, and future enhancements
   - Make each documentation unique with different structure and focus areas
8. **Update tool documentation** whenever implementation changes to keep docs current

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
  title: string // Display name
  description: string // Detailed description for SEO
  icon: React.ElementType // Lucide icon component
  href: string // Route path (e.g., '/tools/json-beautify')
  gradient: string // Tailwind gradient (e.g., 'from-purple-500 to-pink-500')
  features: string[] // 4 key features for card display
  category: ToolCategory // One of the 5 categories
  comingSoon?: boolean // Gray out and disable link
  popular?: boolean // Show star badge
  new?: boolean // Show "NEW" badge
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
import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for demo (replace with Supabase for production)
const dataStore = new Map<string, DataType>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    if (!body.requiredField) {
      return NextResponse.json({ error: 'Field is required' }, { status: 400 })
    }

    // Check for conflicts
    if (dataStore.has(body.id)) {
      return NextResponse.json({ error: 'Already exists' }, { status: 409 })
    }

    // Store data
    dataStore.set(body.id, { ...body, createdAt: new Date().toISOString() })

    return NextResponse.json({ success: true, data: body })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 })
  }

  const data = dataStore.get(id)
  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(data)
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
❌ **Don't** use inline styles - use Panda CSS or Tailwind utilities  
❌ **Don't** forget `'use client'` directive for interactive components  
❌ **Don't** skip analytics tracking on user actions  
❌ **Don't** use semicolons (Prettier will remove them)

✅ **Do** run `pnpm format` before every commit (Husky enforces this)  
✅ **Do** test in browser mode for component tests  
✅ **Do** use `cx()` for conditional class merging  
✅ **Do** follow import order convention  
✅ **Do** maintain glassmorphic dark theme aesthetic

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
