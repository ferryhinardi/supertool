---
name: panda-css-styling
description: Guide for styling SuperTool with Panda CSS and the Website Revamp design system. Use when styling tool pages, layouts, or shared UI.
license: MIT
---

# Panda CSS Styling Guide

Style with Panda CSS and the revamp tokens. Source of truth: `docs/design-system.md`, `lib/design-system/tokens.ts`, and the living catalog at `/design-system`.

## Panda CSS everywhere

Tool pages, the app shell, and shared components use `css()` from `@/styled-system/css`. Do not use Tailwind utility strings.

```typescript
import { css } from '@/styled-system/css'
import { Button } from '@/components/ui/button'
import { Eyebrow, IconTile } from '@/components/design-system'
import { accentForCategory } from '@/lib/design-system'
```

## Design system

Tokens live in `lib/design-system/tokens.ts` and are exposed as Panda `brand.*` colors plus `fontFamily: 'display' | 'mono'`. Prefer those tokens over raw hex.

| Token | Use |
| --- | --- |
| `brand.canvas` | Page background (`#07090e`) |
| `brand.surface` | Cards and inputs |
| `brand.surfaceRaised` | Hovered cards |
| `brand.line` | Borders |
| `brand.ink` | Primary text |
| `brand.muted` | Secondary text |
| `brand.dim` | Meta text |
| `brand.violet` | Primary actions |
| `brand.violetBright` | Accent text |
| `brand.violetSoft` | Active nav / soft fills |
| `brand.mint` | Success and privacy |
| `brand.rose` | Errors |

`primary` maps to violet, so the default `<Button>` is already the brand action. Do not override it with a purple-to-pink gradient.

Category accents come from `accentForCategory(category)` and render through `IconTile`. The `gradient` string on a tool registry entry is legacy data. Do not paint it on new cards.

Type:

- `fontFamily: 'display'` (Manrope) for page titles and section headings
- Inter for UI copy (set on `html`)
- `fontFamily: 'mono'` (DM Mono) for code

Shared pieces in `components/design-system/`:

- `Eyebrow` — uppercase violet pill above a title
- `IconTile` — tinted tool icon (`accent` from `accentForCategory`)
- `BrandMark` — sidebar mark
- `HomeHero`, `HeroPreview`, `ProofStrip`, `PrivacySection` — homepage only. Reuse the pieces; do not copy their markup into tools

Surfaces are solid. The default `Card` recipe is `brand.surface` with a `brand.line` border. Do not add `backdropFilter` blur or the `.glass` class on new UI. The `glass` card variant is legacy.

Do not clip heading text with `bgGradient` / `gradientVia` / `bgClip: 'text'`. Inherited gradient stops make that text invisible.

## Standard page layout

```typescript
'use client'

import { Sparkles } from 'lucide-react'
import { Eyebrow } from '@/components/design-system'
import { css } from '@/styled-system/css'

export default function ToolPage() {
  return (
    <main className={css({
      mx: 'auto',
      maxW: '7xl',
      w: 'full',
      px: { base: '4', sm: '6', md: '8' },
      py: { base: '6', sm: '8', md: '10' },
      spaceY: { base: '6', sm: '8', md: '10' },
    })}>
      <div className={css({ textAlign: 'center', spaceY: '4' })}>
        <div className={css({ display: 'flex', justifyContent: 'center' })}>
          <Eyebrow icon={Sparkles}>Category</Eyebrow>
        </div>
        <h1 className={css({
          fontFamily: 'display',
          fontSize: { base: '3xl', sm: '4xl', md: '5xl' },
          fontWeight: 'bold',
          color: 'brand.ink',
          letterSpacing: '-0.03em',
        })}>
          Tool Title
        </h1>
        <p className={css({
          fontSize: { base: 'base', sm: 'lg' },
          color: 'brand.muted',
        })}>
          Tool description
        </p>
      </div>

      <div className={css({
        bg: 'brand.surface',
        borderRadius: 'xl',
        border: '1px solid',
        borderColor: 'brand.line',
        p: { base: '6', sm: '8' },
        spaceY: '6',
      })}>
        {/* content */}
      </div>
    </main>
  )
}
```

Copy `scripts/templates/TOOL_PAGE_TEMPLATE.tsx` for a full page. Prefer `<Card>` from `@/components/ui/card` over a hand-rolled surface.

## Responsive values

```typescript
className={css({
  fontSize: { base: 'sm', sm: 'base', md: 'lg' },
  padding: { base: '4', sm: '6', md: '8' },
  gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
  w: 'full',
})}
```

`fontSize: 'md'` is not a reliable token. Use `base`.

Grid columns must be CSS values, and the grid needs `w: 'full'`:

```typescript
gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }
```

## Common patterns

### Card

Use `<Card>` or:

```typescript
css({
  bg: 'brand.surface',
  borderRadius: 'xl',
  border: '1px solid',
  borderColor: 'brand.line',
  p: { base: '4', sm: '6' },
  transition: 'all 0.22s ease',
  _hover: {
    bg: 'brand.surfaceRaised',
    borderColor: '#6654a7',
    transform: 'translateY(-2px)',
  },
})
```

### Button

```typescript
import { Button } from '@/components/ui/button'

<Button className={css({ w: 'full', minH: '11' })}>Click Me</Button>
```

### Input

```typescript
css({
  w: 'full',
  minH: '11',
  px: '4',
  bg: 'brand.surface',
  border: '1px solid',
  borderColor: 'brand.line',
  borderRadius: 'lg',
  color: 'brand.ink',
  fontSize: { base: 'base', sm: 'sm' },
  _focus: { borderColor: 'brand.violet', outline: 'none' },
  _placeholder: { color: 'brand.dim' },
})
```

### Tool icon

```typescript
import { IconTile } from '@/components/design-system'
import { accentForCategory } from '@/lib/design-system'

<IconTile icon={Braces} accent={accentForCategory('data')} />
```

`IconTile` is decorative (`aria-hidden`). Put the tool name in visible text.

### Success and error

```typescript
// success
css({ bg: 'rgba(78, 224, 174, 0.1)', borderColor: 'brand.mint', color: 'brand.mint' })

// error
css({ bg: 'rgba(250, 113, 152, 0.1)', borderColor: 'brand.rose', color: 'brand.rose' })
```

### Divider

```typescript
css({ h: '1px', w: 'full', bg: 'brand.line', my: { base: '6', sm: '8' } })
```

## Touch targets and type

Interactive controls are at least 44px: `minH: '11'` (and `minW: '11'` for icon buttons).

```typescript
h1: { base: '3xl', sm: '4xl', md: '5xl' } // fontFamily: 'display'
h2: { base: '2xl', sm: '3xl', md: '4xl' }
body: { base: 'sm', sm: 'base' }
```

Stack on small screens: `flexDirection: { base: 'column', sm: 'row' }`.

## States

```typescript
css({
  bg: 'brand.violet',
  color: 'white',
  _hover: { opacity: 0.92 },
  _focus: { outline: '2px solid', outlineColor: 'brand.violet' },
  _disabled: { opacity: 0.5, cursor: 'not-allowed' },
})
```

## Checklist

- [ ] `css()` from `@/styled-system/css` (no Tailwind utilities)
- [ ] Surfaces use `brand.surface` / `brand.line` (no glass blur)
- [ ] Text uses `brand.ink` / `brand.muted`; titles use `fontFamily: 'display'`
- [ ] Primary actions use `<Button>`
- [ ] Tool icons use `IconTile` + `accentForCategory`
- [ ] Responsive values, mobile-first
- [ ] Touch targets `minH: '11'`
- [ ] Grids use valid templates and `w: 'full'`
- [ ] No second palette and no gradient-clipped headings
