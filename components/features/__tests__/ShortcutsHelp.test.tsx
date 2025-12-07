import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ShortcutsHelp } from '../ShortcutsHelp'

vi.mock('@/lib/split-bill-shortcuts', () => ({
  getKeyboardShortcuts: vi.fn(() => [
    { key: 'Ctrl+S', description: 'Save', category: 'General' },
    { key: 'Ctrl+C', description: 'Copy', category: 'General' },
  ]),
}))

describe('ShortcutsHelp', () => {
  it('renders component', () => {
    const { container } = render(<ShortcutsHelp />)
    expect(container).toBeTruthy()
  })

  it('does not show dialog by default', () => {
    render(<ShortcutsHelp />)
    const dialogs = screen.queryAllByRole('dialog')
    expect(dialogs.length).toBe(0)
  })
})
