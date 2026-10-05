# SuperTool design system

Visual foundations adapted from the Website Revamp Figma Make. The palette is a near-black canvas with a violet primary, mint for privacy states, and a small set of tool accents.

## Source of truth

| Layer | Path |
| --- | --- |
| Token values | `lib/design-system/tokens.ts` |
| Panda theme | `panda.config.ts` (`brand.*`, semantic colors, `display` / `mono` fonts) |
| Recipes | `panda.recipes.ts` (button, card, input, badge) |
| Components | `components/design-system/` |
| Living catalog | `/design-system` |

Import tokens from `@/lib/design-system`. Prefer Panda semantic colors (`bg: 'brand.surface'`, `color: 'brand.muted'`, `fontFamily: 'display'`) over raw hex in feature code.

## Color

| Token | Value | Use |
| --- | --- | --- |
| `brand.canvas` | `#07090e` | Page background |
| `brand.sidebar` | `#0b0d13` | Sidebar |
| `brand.surface` | `#11141d` | Cards, inputs |
| `brand.surfaceRaised` | `#161a25` | Hovered cards |
| `brand.line` | `#222735` | Borders |
| `brand.ink` | `#f7f8fb` | Primary text |
| `brand.muted` | `#9ea6b7` | Secondary text |
| `brand.dim` | `#70798d` | Meta text |
| `brand.violet` | `#8b6cff` | Primary accents, rings, icons |
| `brand.violetDeep` | `#6652ef` | Filled primary buttons and badges with white text |
| `brand.violetBright` | `#a894ff` | Accent text |
| `brand.mint` | `#4ee0ae` | Privacy / success |

White text on `brand.violet` is 3.7:1, below WCAG AA for body-size text. Filled surfaces with white labels use `brand.violetDeep` (5.2:1). `primary` maps to violet for rings and fills without text. `background`, `card`, `border`, and `muted-foreground` map to the canvas scale.

Tool categories use `accentForCategory()`:

| Category | Accent |
| --- | --- |
| Data | violet |
| Developer | blue |
| Media | mint |
| Productivity | cyan |
| Security | amber |
| Finance | lime |
| Design | pink |

## Type

- **Manrope** (`fontFamily: 'display'`) for the wordmark, hero, and section titles.
- **Inter** for UI copy (loaded on `html`).
- **DM Mono** (`fontFamily: 'mono'`) for code samples.

## Components

- `BrandMark` — gradient mark used in the sidebar.
- `Eyebrow` — pill label above headlines.
- `IconTile` — tinted tool icon. Pass `accent` from `accentForCategory`.
- `HomeHero`, `HeroPreview`, `ProofStrip`, `PrivacySection` — homepage compositions. Reuse the pieces; do not copy their markup into new tools.

## Rules

- Tool pages keep Panda `css()` from `@/styled-system/css`.
- Interactive controls stay at least 44px (`minH: '11'`).
- Do not introduce a second palette. Extend `palette` and the Panda `brand` scale together.

## Agent guidance

New tool and UI work follows this document, not the older glass theme:

- `.github/skills/panda-css-styling/SKILL.md`
- `.github/skills/ui-components-creation/SKILL.md`
- `.github/skills/new-tool-development/SKILL.md`
- `.agents/skills/new-tool-scaffolder/SKILL.md`
- `scripts/templates/TOOL_PAGE_TEMPLATE.tsx`
