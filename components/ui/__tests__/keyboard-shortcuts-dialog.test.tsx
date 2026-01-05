import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { KeyboardShortcutsDialog } from '../keyboard-shortcuts-dialog'

const mockShortcuts = [
  { key: 'Ctrl+C', label: 'Copy', description: 'Copy selected text' },
  { key: 'Ctrl+V', label: 'Paste', description: 'Paste from clipboard' },
  { key: 'Ctrl+S', label: 'Save', description: 'Save current work' },
]

describe('KeyboardShortcutsDialog', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <KeyboardShortcutsDialog open={false} onOpenChange={vi.fn()} shortcuts={mockShortcuts} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders dialog with shortcuts when open', () => {
    render(
      <KeyboardShortcutsDialog
        open={true}
        onOpenChange={vi.fn()}
        shortcuts={mockShortcuts}
        toolName="Test Tool"
      />
    )

    expect(screen.getByText('Test Tool Shortcuts')).toBeInTheDocument()
    expect(screen.getByText('Use these shortcuts to navigate faster')).toBeInTheDocument()
    expect(screen.getByText('Copy')).toBeInTheDocument()
    expect(screen.getByText('Paste')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('displays all shortcut keys', () => {
    render(<KeyboardShortcutsDialog open={true} onOpenChange={vi.fn()} shortcuts={mockShortcuts} />)

    expect(screen.getByText('Ctrl+C')).toBeInTheDocument()
    expect(screen.getByText('Ctrl+V')).toBeInTheDocument()
    expect(screen.getByText('Ctrl+S')).toBeInTheDocument()
  })

  it('calls onOpenChange when close button clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    render(
      <KeyboardShortcutsDialog open={true} onOpenChange={onOpenChange} shortcuts={mockShortcuts} />
    )

    // Get all buttons and find the X close button (should be the last button)
    const buttons = screen.getAllByRole('button')
    const closeButton = buttons[buttons.length - 1]
    await user.click(closeButton)

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('renders all shortcut information', () => {
    render(<KeyboardShortcutsDialog open={true} onOpenChange={vi.fn()} shortcuts={mockShortcuts} />)

    // Check that all shortcuts and their descriptions are rendered
    expect(screen.getByText('Copy selected text')).toBeInTheDocument()
    expect(screen.getByText('Paste from clipboard')).toBeInTheDocument()
    expect(screen.getByText('Save current work')).toBeInTheDocument()
  })

  it('uses default toolName when not provided', () => {
    render(<KeyboardShortcutsDialog open={true} onOpenChange={vi.fn()} shortcuts={mockShortcuts} />)

    expect(screen.getByText('Tool Shortcuts')).toBeInTheDocument()
  })

  it('displays escape key hint', () => {
    render(<KeyboardShortcutsDialog open={true} onOpenChange={vi.fn()} shortcuts={mockShortcuts} />)

    expect(screen.getByText('Esc')).toBeInTheDocument()
    expect(screen.getByText(/to close this dialog/)).toBeInTheDocument()
  })
})
