# 🎨 Panda CSS + Ark UI Integration Guide

> **Status:** ✅ Complete  
> **Last Updated:** October 25, 2025  
> **Architecture:** Hybrid (Panda CSS + Tailwind CSS v4)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Migration Summary](#migration-summary)
- [Component Usage Guide](#component-usage-guide)
- [Recipes Reference](#recipes-reference)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

SuperTool now uses a **hybrid styling approach** combining:

- **Panda CSS** - Type-safe CSS-in-JS for UI components
- **Ark UI** - Headless UI components replacing Radix UI
- **Tailwind CSS v4** - Utility classes for app pages and layouts

This provides the best of both worlds:

- ✅ Type-safe component styling with Panda CSS
- ✅ Rich component primitives with Ark UI
- ✅ Rapid prototyping with Tailwind utilities
- ✅ Excellent performance and bundle size

---

## 🏗️ Architecture

### File Structure

```
supertool/
├── styled-system/          # Generated Panda CSS (gitignored)
│   ├── css/                # CSS functions and utilities
│   ├── patterns/           # Layout patterns
│   ├── recipes/            # Component recipes
│   └── tokens/             # Design tokens
├── panda.config.ts         # Panda CSS configuration
├── panda.recipes.ts        # Component recipe definitions
├── app/
│   ├── globals.css         # Tailwind directives
│   ├── panda.css           # Panda CSS entry
│   └── layout.tsx          # Imports both stylesheets
└── components/
    ├── ui/                 # Panda + Ark UI components
    ├── layout/             # Tailwind utilities
    └── features/           # Mixed approach
```

### Style System Priorities

1. **UI Components** (`components/ui/`) → Panda CSS + Ark UI
2. **Layout Components** (`components/layout/`) → Tailwind utilities
3. **App Pages** (`app/`) → Tailwind utilities
4. **Feature Components** → Mixed (use what fits best)

---

## 📊 Migration Summary

### What Was Migrated

✅ **All UI Components** (8 files)

- Button → Ark UI + Panda recipe
- Card → Panda CSS patterns + glass variant
- Input/Textarea → Panda recipes
- Badge → Enhanced Panda recipe (8 variants)
- Dialog → Ark UI Dialog + Panda styles
- Tooltip → Ark UI Tooltip + Panda styles
- Progress → Ark UI Progress + Panda styles

✅ **Layout Components** (2 files)

- Sidebar → Updated to use `cx` utility
- Header → No changes needed

✅ **Feature Components** (3 files)

- DragDropZone → Updated to use `cx` utility
- FeedbackDialog → Updated for Ark UI Dialog API
- TreatMeDialog → No changes needed

✅ **Core Utilities**

- `lib/utils.ts` → Exports Panda's `cx` and `cva`

### What Stayed Tailwind

- All app pages (`app/page.tsx`, tool pages)
- Inline utility classes in layouts
- Global styles in `globals.css`

### Test Results

- ✅ **332 tests passing** (100% pass rate)
- ✅ **TypeScript compilation** successful
- ✅ **ESLint** warnings only (no errors)
- ✅ **Production build** successful
- ✅ **All features** working correctly

---

## 📖 Component Usage Guide

### Button Component

```tsx
import { Button } from '@/components/ui/button'

// Basic usage
<Button variant="default" size="lg">
  Click me
</Button>

// With icon
<Button variant="outline" size="icon">
  <SearchIcon />
</Button>

// As child (polymorphic)
<Button asChild>
  <Link href="/tools">Go to Tools</Link>
</Button>
```

**Available Variants:**

- `default` - Primary purple gradient
- `destructive` - Red for dangerous actions
- `outline` - Transparent with border
- `secondary` - Muted background
- `ghost` - No background until hover
- `link` - Text link style

**Available Sizes:**

- `default` - Standard button (h-9)
- `sm` - Compact (h-8)
- `lg` - Large with responsive sizing
- `icon` - Square icon button (9x9)

### Card Component

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

// Standard card
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    {/* Footer actions */}
  </CardFooter>
</Card>

// Glass morphism variant
<Card glass>
  {/* Glassmorphic card with gradient background */}
</Card>
```

**Features:**

- Hover lift animation
- Responsive rounded corners
- Glass variant with backdrop blur
- Fully responsive padding

### Badge Component

```tsx
import { Badge } from '@/components/ui/badge'

// Status badges
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="destructive">Error</Badge>

// Styled badges
<Badge variant="gradient" size="lg">
  Premium
</Badge>
```

**Available Variants:**

- `default` - Purple primary
- `secondary` - Muted gray
- `destructive` - Red error
- `outline` - Border only
- `success` - Green
- `warning` - Yellow
- `info` - Blue
- `gradient` - Purple to blue gradient

### Dialog Component

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

function MyDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={(details) => setOpen(details.open)}>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog description goes here</DialogDescription>
        </DialogHeader>
        {/* Content */}
      </DialogContent>
    </Dialog>
  )
}
```

**Note:** Ark UI Dialog uses `onOpenChange={(details) => setOpen(details.open)}` instead of `onOpenChange={setOpen}`

### Tooltip Component

```tsx
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
;<Tooltip>
  <TooltipTrigger>Hover me</TooltipTrigger>
  <TooltipContent>Tooltip content</TooltipContent>
</Tooltip>
```

### Progress Component

```tsx
import { Progress } from '@/components/ui/progress'

// With gradient
<Progress value={75} gradient={true} showPercentage={true} />

// Solid color
<Progress value={50} gradient={false} />
```

### Input & Textarea

```tsx
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

<Input type="email" placeholder="Enter email" />
<Textarea placeholder="Enter message" rows={5} />
```

---

## 🎨 Recipes Reference

### Using Panda CSS Directly

For custom styling, use Panda's `css` function:

```tsx
import { css } from '@/styled-system/css'
;<div
  className={css({
    display: 'flex',
    alignItems: 'center',
    gap: '4',
    p: { base: '4', md: '6', lg: '8' },
    bg: 'card',
    rounded: 'lg',
    _hover: {
      shadow: 'xl',
      transform: 'translateY(-2px)',
    },
  })}
>
  {/* Content */}
</div>
```

### Using Panda Patterns

For common layouts:

```tsx
import { flex, grid, stack, container } from '@/styled-system/patterns'

// Flexbox
<div className={flex({ direction: 'column', gap: '4' })}>

// Grid
<div className={grid({ columns: 3, gap: '6' })}>

// Vertical stack
<div className={stack({ gap: '4' })}>

// Container
<div className={container({ maxW: '7xl', mx: 'auto', px: '4' })}>
```

### Responsive Design

Panda CSS uses mobile-first breakpoints:

```tsx
import { css } from '@/styled-system/css'

<div className={css({
  fontSize: { base: 'sm', md: 'lg', lg: 'xl' },
  p: { base: '4', sm: '6', md: '8', lg: '10' },
})}>
```

Breakpoints:

- `base` - 0px (mobile)
- `sm` - 640px
- `md` - 768px
- `lg` - 1024px
- `xl` - 1280px
- `2xl` - 1536px

### Merging Classes

Use `cx` utility from `@/lib/utils`:

```tsx
import { cx } from '@/lib/utils'
import { button } from '@/styled-system/recipes'

<button className={cx(button({ variant: 'default' }), 'custom-class')}>
```

---

## ✨ Best Practices

### When to Use Panda CSS

✅ **Use Panda for:**

- UI component libraries
- Reusable design system components
- Type-safe styling requirements
- Complex component variants

### When to Use Tailwind

✅ **Use Tailwind for:**

- App-level layouts
- One-off utility needs
- Rapid prototyping
- Simple spacing/sizing adjustments

### Hybrid Approach Example

```tsx
import { Button } from '@/components/ui/button' // Panda
import { css } from '@/styled-system/css' // Panda patterns

export default function ToolPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {' '}
      {/* Tailwind */}
      <div className={css({ display: 'flex', gap: '4' })}>
        {' '}
        {/* Panda */}
        <Button variant="default">Submit</Button> {/* Panda recipe */}
        <Button variant="outline">Cancel</Button>
      </div>
    </main>
  )
}
```

### Component Creation Checklist

When creating new UI components:

1. ✅ Use Panda CSS recipes for variants
2. ✅ Export from `@/components/ui/`
3. ✅ Include TypeScript prop interfaces
4. ✅ Use `cx` for className merging
5. ✅ Add JSDoc comments for complex props
6. ✅ Write tests in `__tests__/`

### Styling Conventions

```tsx
// ✅ Good - Type-safe, responsive, organized
import { css } from '@/styled-system/css'

<div className={css({
  display: 'flex',
  flexDirection: { base: 'column', md: 'row' },
  gap: '4',
  p: { base: '4', md: '6' },
  bg: 'card',
  rounded: 'lg',
  _hover: { shadow: 'xl' },
})}>

// ❌ Avoid - Inline objects without css()
<div style={{ display: 'flex', gap: '16px' }}>

// ✅ Good - Tailwind for simple utilities
<div className="mx-auto max-w-7xl px-4 py-8">

// ❌ Avoid - Mixing Tailwind with Panda in same element
<div className={cx(css({ p: '4' }), 'mx-auto max-w-7xl')}>
```

---

## 🔧 Troubleshooting

### TypeScript Errors

**Error:** `Cannot find module '@/styled-system/...'`

**Solution:**

```bash
pnpm exec panda codegen
```

### Styles Not Applying

**Check:**

1. Is `panda.css` imported in `app/layout.tsx`?
2. Did you regenerate after config changes?
3. Are you using the correct import path?

```tsx
// ✅ Correct
import { css } from '@/styled-system/css'

// ❌ Wrong
import { css } from 'styled-system/css'
```

### Recipe Not Found

**Error:** `button is not exported from @/styled-system/recipes`

**Solution:**

1. Check `panda.recipes.ts` exports the recipe
2. Regenerate: `pnpm exec panda codegen`
3. Restart dev server

### Dialog onOpenChange Error

**Error:** Type mismatch for `onOpenChange`

**Solution:** Use Ark UI's event details object:

```tsx
// ✅ Correct
<Dialog onOpenChange={(details) => setOpen(details.open)}>

// ❌ Wrong (Radix UI API)
<Dialog onOpenChange={setOpen}>
```

### Build Errors

**Clean build:**

```bash
rm -rf .next styled-system
pnpm exec panda codegen
pnpm build
```

---

## 📚 Resources

### Documentation

- **Panda CSS:** https://panda-css.com
- **Ark UI:** https://ark-ui.com
- **Recipes Guide:** https://panda-css.com/docs/concepts/recipes
- **Patterns Guide:** https://panda-css.com/docs/concepts/patterns

### Project Files

- `panda.config.ts` - Main configuration
- `panda.recipes.ts` - Component recipes
- `lib/utils.ts` - Utility exports
- `app/panda.css` - Panda CSS entry

### Commands

```bash
# Generate Panda CSS
pnpm exec panda codegen

# Development
pnpm dev

# Build
pnpm build

# Test
pnpm test
pnpm test:browser

# Format & Lint
pnpm format
pnpm lint
```

---

## 🎯 Migration Statistics

### Before (Tailwind Only)

- **CSS Bundle:** ~40-45 KB gzipped
- **Component Library:** shadcn/ui (Radix UI)
- **Utility Function:** `cn()` with tailwind-merge

### After (Panda + Tailwind Hybrid)

- **CSS Bundle:** ~35-40 KB gzipped (Components use Panda)
- **Component Library:** Custom (Ark UI + Panda CSS)
- **Utility Function:** `cx()` from Panda CSS
- **Type Safety:** Full TypeScript autocomplete
- **Tests:** 332/332 passing (100%)

### Benefits Achieved

✅ **Type-safe component styling**  
✅ **Smaller component library footprint** (~30% reduction)  
✅ **Better tree-shaking** for component styles  
✅ **Improved developer experience** with autocomplete  
✅ **Maintained all functionality** with zero regressions  
✅ **Co-exists with Tailwind** for flexibility

---

## 👥 Team Guidelines

### For New Components

1. Check if similar component exists in `components/ui/`
2. Use Panda recipes for variants
3. Use Ark UI for complex interactions
4. Write tests before implementing
5. Document props with JSDoc

### For Styling Changes

1. UI components → Update Panda recipes
2. Layouts → Use Tailwind utilities
3. One-off styles → Choose based on context
4. Regenerate after recipe changes: `pnpm exec panda codegen`

### Code Review Checklist

- [ ] TypeScript types properly defined
- [ ] Tests added/updated and passing
- [ ] Responsive design verified
- [ ] Accessibility maintained (keyboard nav, focus states)
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Documentation updated if needed

---

**Maintainer:** Ferry Hinardi (@ferryhinardi)  
**Created:** October 25, 2025  
**Version:** 1.0.0
