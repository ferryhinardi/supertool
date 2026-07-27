import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ToolKeyboardShortcut } from '@/lib/data/tool-components-types'
import { ToolKeyboardShortcuts } from '../ToolKeyboardShortcuts'

const shortcuts: ToolKeyboardShortcut[] = [
  {
    key: 'Ctrl+S',
    description: 'Save document',
    category: 'File',
    platform: 'all',
  },
  {
    key: 'Alt+Shift+F',
    description: 'Format selection',
    category: 'Editing',
    platform: 'mac',
  },
  {
    key: 'Ctrl+/',
    description: 'Toggle comment',
    category: 'Editing',
    platform: 'windows',
  },
]

describe('ToolKeyboardShortcuts', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('opens with the default trigger and groups shortcuts by category', async () => {
    const user = userEvent.setup()

    render(<ToolKeyboardShortcuts shortcuts={shortcuts} />)

    await user.click(screen.getByRole('button', { name: 'Show keyboard shortcuts' }))

    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
    expect(screen.getByText('File')).toBeInTheDocument()
    expect(screen.getByText('Editing')).toBeInTheDocument()
    expect(screen.getByText('Save document')).toBeInTheDocument()
    expect(screen.getByText('Toggle comment')).toBeInTheDocument()
  })

  it('formats shortcuts for macOS when platform filtering is enabled', async () => {
    const user = userEvent.setup()
    vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('Macintosh')

    render(<ToolKeyboardShortcuts shortcuts={shortcuts} />)

    await user.click(screen.getByRole('button', { name: 'Show keyboard shortcuts' }))

    expect(screen.getByText('Cmd')).toBeInTheDocument()
    expect(screen.getByText('Opt')).toBeInTheDocument()
    expect(screen.queryByText('Toggle comment')).not.toBeInTheDocument()
  })

  it('supports a custom trigger and close button', async () => {
    const user = userEvent.setup()

    render(
      <ToolKeyboardShortcuts
        shortcuts={shortcuts}
        trigger={<span>Open shortcuts</span>}
      ></ToolKeyboardShortcuts>
    )

    await user.click(screen.getByRole('button', { name: 'Open shortcuts' }))
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument()
  })

  it('can render all platform shortcuts when filtering is disabled', async () => {
    const user = userEvent.setup()

    render(<ToolKeyboardShortcuts shortcuts={shortcuts} filterByPlatform={false} />)

    await user.click(screen.getByRole('button', { name: 'Show keyboard shortcuts' }))

    expect(screen.getByText('Format selection')).toBeInTheDocument()
    expect(screen.getByText('Toggle comment')).toBeInTheDocument()
  })
})
