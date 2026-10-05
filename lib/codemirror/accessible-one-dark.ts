import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { oneDarkHighlightStyle, oneDarkTheme } from '@codemirror/theme-one-dark'
import type { Extension } from '@uiw/react-codemirror'

const ONE_DARK_CORAL = '#e06c75'
// One Dark coral is 4.38:1 on its #282c34 background; this tint clears WCAG AA (6.0:1).
const ACCESSIBLE_CORAL = '#ef8f97'

const accessibleHighlightStyle = HighlightStyle.define(
  oneDarkHighlightStyle.specs.map((spec) =>
    spec.color === ONE_DARK_CORAL ? { ...spec, color: ACCESSIBLE_CORAL } : spec
  )
)

export const accessibleOneDark: Extension = [
  oneDarkTheme,
  syntaxHighlighting(accessibleHighlightStyle),
]
