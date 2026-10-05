import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { type Extension, Prec } from '@codemirror/state'
import { oneDarkHighlightStyle, oneDarkTheme } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'

// One Dark coral (4.38:1) and stone (3.86:1, comments and gutter) fall short of WCAG AA
// on the #282c34 background; these tints clear it (6.0:1 and 5.5:1).
const COLOR_FIXES: Record<string, string> = {
  '#e06c75': '#ef8f97',
  '#7d8799': '#9aa3b2',
}

const accessibleHighlightStyle = HighlightStyle.define(
  oneDarkHighlightStyle.specs.map((spec) =>
    spec.color && COLOR_FIXES[spec.color] ? { ...spec, color: COLOR_FIXES[spec.color] } : spec
  )
)

const accessibleGutters = Prec.highest(
  EditorView.theme({ '.cm-gutters': { color: COLOR_FIXES['#7d8799'] } }, { dark: true })
)

// Read-only editors have no focusable content, so keyboard users could not scroll them.
const focusableContent = EditorView.contentAttributes.of({ tabindex: '0' })

export const accessibleOneDark: Extension = [
  oneDarkTheme,
  accessibleGutters,
  focusableContent,
  syntaxHighlighting(accessibleHighlightStyle),
]
