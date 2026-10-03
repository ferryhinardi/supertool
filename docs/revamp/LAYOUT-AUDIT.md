# Layout audit alignment contract

Source: Figma Make `Website Revamp` version 15, "Audit margin alignment issues".

The family chrome and the tool workspace share one content box. A page H1 stays on that box's left edge. It is not centered on its own, and the header icon does not indent it.

## Container

- Standard tool pages use `maxW: '7xl'` on the category layout and on the page `main`.
- `1400px` is reserved for a dense editor or media workspace, and only when the header uses that same width.
- Page shells do not use `1200px` or another one-off width.
- Do not add a third horizontal gutter. The app shell padding and the page padding (`px: { base: '4', sm: '6', md: '8' }`) are the two levels. Workspace chrome uses that same page padding.

## Header

- One family nav per category layout.
- One content H1 per tool page.
- The tool icon sits on the eyebrow row. The H1, description, and workspace body start at the same left edge.
- Category identity colors stay on the family chrome. Status colors stay semantic.

## Measured defect

On a wide desktop, Email Signature's H1 sat about 390px to the right of the workspace heading because the sticky chrome broke out to the full content column while the page `main` was a centered `7xl`. On mobile the same mismatch was about 70px. The icon row added a second, smaller indent (workspace content near x=58, hero title near x=140).
