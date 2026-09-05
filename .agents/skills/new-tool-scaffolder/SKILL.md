---
name: new-tool-scaffolder
description: Scaffolds a complete new tool page for SuperTool. Use this skill when asked to add a new tool — it creates the page component, layout with SEO metadata, test files, docs, and registers the tool in the tools registry.
---

# new-tool-scaffolder

## Project Context
SuperTool is a Next.js 16 (React 19) developer toolkit with 110+ browser-based tools. Uses Panda CSS for styling, Vitest + Playwright for testing, and deploys to Vercel.

## Tool Structure
Each tool lives under `app/tools/<category>/<tool-slug>/` where category is one of: `data`, `media`, `development`, `productivity`, `security`, `finance`, `design`.

### Required files per tool:
1. **`page.tsx`** — Main tool component (use `'use client'`). Copy patterns from `scripts/templates/TOOL_PAGE_TEMPLATE.tsx`:
   - Panda CSS via `css()` from `@/styled-system/css` (NOT Tailwind)
   - Respect `prefers-reduced-motion` for any animation (no Framer Motion; it is not a dependency)
   - `trackToolEvent()` from `@/lib/services/analytics` for analytics
   - 44px minimum touch targets
   - Mobile-first responsive layout with `maxW: '7xl'`
   - Loading states, error handling with `toast` from `sonner`
   - UI components from `@/components/ui/` (Button, Card, Input, etc.)

2. **`layout.tsx`** — SEO metadata using `generateToolMetadata()` from `@/lib/data/metadata` and structured data schemas from `@/lib/data/structured-data` (`generateBreadcrumbSchema`, `generateFAQSchema`, `generateHowToSchema`).

3. **`__tests__/page.test.tsx`** — Vitest + Testing Library test file:
   ```tsx
   import { render, screen } from '@testing-library/react'
   import { describe, it, expect } from 'vitest'
4. __tests__/logic.test.ts — Unit tests for pure logic/utility functions.
5. docs/tools/<category>/<NUMBER>_<TOOL_NAME>.md — Documentation with: Overview, Purpose, Key Features, Technical Details sections. Number sequentially after the last existing doc.

Tool Registration
Add the tool entry to lib/data/tools.ts in the tools array with:
•  title, description, icon (from lucide-react), href (/tools/<category>/<slug>)
•  gradient (Tailwind gradient string like 'from-purple-500 to-pink-500')
•  features (array of 4 short feature strings)
•  category (matching the directory category)
•  new: true flag for newly added tools

Code Style
•  Biome enforces: 2-space indent, single quotes, no semicolons, 100-char lines
•  Imports use @/ prefix. Order: React/Next → 3rd party → UI → Features → Utils
•  Strict TypeScript: never use any
•  One component per file

Validation Steps (run after scaffolding)
1. pnpm exec tsc --noEmit — Type check
2. pnpm lint:check — Lint check
3. pnpm test -- --run <path-to-tests> — Run new tests
4. pnpm build — Ensure production build succeeds

Reference Files
•  Template: scripts/templates/TOOL_PAGE_TEMPLATE.tsx
•  Canonical example: app/tools/data/json-beautify/page.tsx
•  Layout example: app/tools/data/json-beautify/layout.tsx
•  Tools registry: lib/data/tools.ts
•  Agent reference: AGENTS.md
