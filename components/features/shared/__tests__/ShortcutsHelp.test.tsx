import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ShortcutsHelp } from '../ShortcutsHelp'

vi.mock('@/lib/tools/split-bill/split-bill-shortcuts', () => ({
  getKeyboardShortcuts: () => [
    { key: 'P or +', description: 'Add person', category: 'Actions' },
    { key: 'Alt+1', description: 'Equal split', category: 'Split Type' },
    { key: '?', description: 'Show shortcuts', category: 'Help' },
  ],
}))

describe('ShortcutsHelp', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const openModal = async () => {
    await act(async () => {
      window.dispatchEvent(new CustomEvent('show-shortcuts-help'))
    })
  }

  it('opens when the shortcuts help event is dispatched', async () => {
    render(<ShortcutsHelp />)

    await openModal()

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
    expect(screen.getByText('Add person')).toBeInTheDocument()
    expect(screen.getByText('Split Type')).toBeInTheDocument()
    expect(screen.getByText('Help')).toBeInTheDocument()
  })

  it('closes when the backdrop is clicked', async () => {
    render(<ShortcutsHelp />)

    await openModal()

    const dialog = await screen.findByRole('dialog')
    fireEvent.click(dialog)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('closes when the close button is clicked', async () => {
    const user = userEvent.setup()
    render(<ShortcutsHelp />)

    await openModal()

    await user.click(await screen.findByRole('button'))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('shows footer help text and closes when Escape is pressed', async () => {
    render(<ShortcutsHelp />)

    await openModal()

    const dialog = await screen.findByRole('dialog')

    expect(
      screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'p' && content.includes('this dialog, or')
      })
    ).toBeInTheDocument()

    fireEvent.keyDown(dialog, { key: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
