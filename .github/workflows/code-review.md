---
# Trigger - when should this workflow run?
on:
  pull_request:
    types: [opened, synchronize]

# Permissions - what can this workflow access?
permissions:
  contents: read
  pull-requests: write

# Outputs - what APIs and tools can the AI use?
safe-outputs:
  add-comment:
    max: 1

---

# Code Review Assistant

Automated code review for SuperTool PRs following project standards and best practices.

## Instructions

1. **Review PR Changes**:
   - Read all modified files in the pull request
   - Focus on TypeScript, React 19, Next.js 15, and Panda CSS patterns

2. **Check Code Quality**:
   - Verify proper Panda CSS usage (NOT Tailwind)
   - Ensure `css()` is imported from `@/styled-system/css`
   - Check for `'use client'` directive on client components
   - Validate import order: React → 3rd party → UI → Features → Utils → Types
   - Verify no semicolons, single quotes, 2-space indentation

3. **Verify Project Standards**:
   - Analytics: Use `trackToolEvent()` - no PII logging
   - Performance: Flag bundle increases > 20KB gzipped
   - Security: Check for exposed API keys or secrets
   - TypeScript: No `any` types allowed
   - Testing: Check if tests are included for new features

4. **Check AI Tool Patterns** (if applicable):
   - Verify GPT-4o-mini integration follows patterns
   - Check error handling for 401, 429, 400, 500
   - Ensure privacy-first approach (no content logging)

5. **Provide Feedback**:
   - Leave ONE comprehensive comment summarizing:
     - ✅ What looks good
     - ⚠️ Issues that should be fixed (with code examples)
     - 💡 Suggestions for improvement
   - Be constructive and reference specific lines when possible
   - Include links to relevant docs/agents if helpful

## Context

**Tech Stack**:
- Next.js 15 (App Router)
- React 19
- Panda CSS (NOT Tailwind!)
- TypeScript
- Vitest + React Testing Library
- PostHog (privacy-first analytics)

**Key Files to Reference**:
- `docs/reference/WARP.md` - Full development guide
- `.github/agents/AGENTS.md` - Agent reference
- `panda.config.ts` - Panda CSS config

**Critical Patterns**:
```typescript
// ✅ Correct: Panda CSS
import { css } from '@/styled-system/css'
<div className={css({ px: 4, py: 6 })}>

// ❌ Wrong: Tailwind
<div className="px-4 py-6">
```
