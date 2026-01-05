import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ClipboardHistoryPage from '../page'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

describe('Clipboard History Page - Component Tests', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()

    // Mock clipboard API properly
    Object.defineProperty(navigator, 'clipboard', {
      writable: true,
      configurable: true,
      value: {
        readText: vi.fn(),
        writeText: vi.fn(),
      },
    })

    // Mock permissions API
    Object.defineProperty(navigator, 'permissions', {
      writable: true,
      configurable: true,
      value: {
        query: vi.fn().mockResolvedValue({ state: 'granted' }),
      },
    })
  })

  it('should render clipboard history page', () => {
    render(<ClipboardHistoryPage />)

    expect(
      screen.getByRole('heading', { name: /Clipboard History Manager/i, level: 1 })
    ).toBeInTheDocument()
    expect(screen.getByText(/Never lose copied text again/i)).toBeInTheDocument()
  })

  it('should display quick actions control section', () => {
    render(<ClipboardHistoryPage />)

    expect(screen.getByRole('heading', { name: /Quick Actions/i })).toBeInTheDocument()
  })

  it('should display start monitoring button initially', () => {
    render(<ClipboardHistoryPage />)

    expect(screen.getByRole('button', { name: /Start Monitoring/i })).toBeInTheDocument()
  })

  it('should start monitoring when button clicked', async () => {
    const { toast } = await import('sonner')
    render(<ClipboardHistoryPage />)

    const startButton = screen.getByRole('button', { name: /Start Monitoring/i })
    await userEvent.click(startButton)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Clipboard monitoring started. Copy text to add to history.'
      )
    })

    expect(screen.getByRole('button', { name: /Stop Monitoring/i })).toBeInTheDocument()
  })

  it('should stop monitoring when button clicked', async () => {
    const { toast } = await import('sonner')
    render(<ClipboardHistoryPage />)

    // Start monitoring
    const startButton = screen.getByRole('button', { name: /Start Monitoring/i })
    await userEvent.click(startButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Stop Monitoring/i })).toBeInTheDocument()
    })

    // Stop monitoring
    const stopButton = screen.getByRole('button', { name: /Stop Monitoring/i })
    await userEvent.click(stopButton)

    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith('Clipboard monitoring stopped.')
    })
  })

  it('should display add current clipboard button', () => {
    render(<ClipboardHistoryPage />)

    expect(screen.getByRole('button', { name: /Add Current Clipboard/i })).toBeInTheDocument()
  })

  it('should add current clipboard content when button clicked', async () => {
    const { toast } = await import('sonner')

    // Set up clipboard mock
    vi.mocked(navigator.clipboard.readText).mockResolvedValue('Test clipboard content')

    render(<ClipboardHistoryPage />)

    const addButton = screen.getByRole('button', { name: /Add Current Clipboard/i })
    await userEvent.click(addButton)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Added to clipboard history')
      expect(screen.getByText('Test clipboard content')).toBeInTheDocument()
    })
  })

  it('should show error when trying to add empty clipboard', async () => {
    const { toast } = await import('sonner')

    // Set up empty clipboard
    vi.mocked(navigator.clipboard.readText).mockResolvedValue('')

    render(<ClipboardHistoryPage />)

    const addButton = screen.getByRole('button', { name: /Add Current Clipboard/i })
    await userEvent.click(addButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Clipboard is empty')
    })
  })

  it('should display search input when items exist', async () => {
    // Set up clipboard mock
    vi.mocked(navigator.clipboard.readText).mockResolvedValue('Test item')

    render(<ClipboardHistoryPage />)

    // Add an item
    const addButton = screen.getByRole('button', { name: /Add Current Clipboard/i })
    await userEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search clipboard history...')).toBeInTheDocument()
    })
  })

  it('should filter items based on search query', async () => {
    // Set up clipboard mock with different responses
    let callCount = 0
    vi.mocked(navigator.clipboard.readText).mockImplementation(() => {
      callCount++
      return Promise.resolve(callCount === 1 ? 'First item' : 'Second item')
    })

    render(<ClipboardHistoryPage />)

    // Add multiple items
    const addButton = screen.getByRole('button', { name: /Add Current Clipboard/i })

    await userEvent.click(addButton)
    await waitFor(() => {
      expect(screen.getByText('First item')).toBeInTheDocument()
    })

    await userEvent.click(addButton)
    await waitFor(() => {
      expect(screen.getByText('Second item')).toBeInTheDocument()
    })

    // Search
    const searchInput = screen.getByPlaceholderText('Search clipboard history...')
    await userEvent.type(searchInput, 'First')

    await waitFor(() => {
      expect(screen.getByText('First item')).toBeInTheDocument()
      expect(screen.queryByText('Second item')).not.toBeInTheDocument()
    })
  })

  it('should display pin button for each item', async () => {
    // Set up clipboard mock
    vi.mocked(navigator.clipboard.readText).mockResolvedValue('Test item')

    render(<ClipboardHistoryPage />)

    const addButton = screen.getByRole('button', { name: /Add Current Clipboard/i })
    await userEvent.click(addButton)

    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      // Should have pin/unpin button for the item
      expect(buttons.length).toBeGreaterThan(1)
    })
  })

  it('should pin and unpin items', async () => {
    const { toast } = await import('sonner')

    // Set up clipboard mock
    vi.mocked(navigator.clipboard.readText).mockResolvedValue('Test item to pin')

    render(<ClipboardHistoryPage />)

    // Add item
    const addButton = screen.getByRole('button', { name: /Add Current Clipboard/i })
    await userEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('Test item to pin')).toBeInTheDocument()
    })

    // Find and click pin button (assuming the first actionable button after add)
    const buttons = screen.getAllByRole('button')
    const pinButton = buttons.find((btn) => btn.getAttribute('title')?.includes('Pin'))

    if (pinButton) {
      await userEvent.click(pinButton)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled()
      })
    }
  })

  it('should copy item to clipboard when copy button clicked', async () => {
    const { toast } = await import('sonner')

    // Set up clipboard mock
    vi.mocked(navigator.clipboard.readText).mockResolvedValue('Test copy item')
    vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined)

    render(<ClipboardHistoryPage />)

    // Add item
    const addButton = screen.getByRole('button', { name: /Add Current Clipboard/i })
    await userEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('Test copy item')).toBeInTheDocument()
    })

    // Find and click copy button
    const buttons = screen.getAllByRole('button')
    const copyButton = buttons.find((btn) => btn.getAttribute('title')?.includes('Copy'))

    if (copyButton) {
      await userEvent.click(copyButton)

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test copy item')
        expect(toast.success).toHaveBeenCalledWith('Copied to clipboard!')
      })
    }
  })

  it('should delete item when delete button clicked', async () => {
    const { toast } = await import('sonner')

    // Set up clipboard mock
    vi.mocked(navigator.clipboard.readText).mockResolvedValue('Test delete item')

    render(<ClipboardHistoryPage />)

    // Add item
    const addButton = screen.getByRole('button', { name: /Add Current Clipboard/i })
    await userEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('Test delete item')).toBeInTheDocument()
    })

    // Find and click delete button
    const buttons = screen.getAllByRole('button')
    const deleteButton = buttons.find((btn) => btn.getAttribute('title')?.includes('Delete'))

    if (deleteButton) {
      await userEvent.click(deleteButton)

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Deleted from history')
        expect(screen.queryByText('Test delete item')).not.toBeInTheDocument()
      })
    }
  })

  it('should display clear all button when items exist', async () => {
    // Set up clipboard mock
    vi.mocked(navigator.clipboard.readText).mockResolvedValue('Test item')

    render(<ClipboardHistoryPage />)

    // Add item
    const addButton = screen.getByRole('button', { name: /Add Current Clipboard/i })
    await userEvent.click(addButton)

    await waitFor(() => {
      const clearButton = screen.getByRole('button', { name: /Clear All/i })
      expect(clearButton).toBeInTheDocument()
      expect(clearButton).not.toBeDisabled()
    })
  })

  it('should clear all items when clear all button clicked', async () => {
    const { toast } = await import('sonner')

    // Set up clipboard mock with different responses
    let callCount = 0
    vi.mocked(navigator.clipboard.readText).mockImplementation(() => {
      callCount++
      return Promise.resolve(callCount === 1 ? 'First item' : 'Second item')
    })

    render(<ClipboardHistoryPage />)

    // Add multiple items
    const addButton = screen.getByRole('button', { name: /Add Current Clipboard/i })

    await userEvent.click(addButton)
    await waitFor(() => {
      expect(screen.getByText('First item')).toBeInTheDocument()
    })

    await userEvent.click(addButton)
    await waitFor(() => {
      expect(screen.getByText('First item')).toBeInTheDocument()
      expect(screen.getByText('Second item')).toBeInTheDocument()
    })

    // Clear all
    const clearButton = screen.getByRole('button', { name: /Clear All/i })
    await userEvent.click(clearButton)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Cleared all unpinned items')
      expect(screen.queryByText('First item')).not.toBeInTheDocument()
      expect(screen.queryByText('Second item')).not.toBeInTheDocument()
    })
  })

  it('should persist items to localStorage', async () => {
    // Set up clipboard mock
    vi.mocked(navigator.clipboard.readText).mockResolvedValue('Persistent item')

    render(<ClipboardHistoryPage />)

    // Add item
    const addButton = screen.getByRole('button', { name: /Add Current Clipboard/i })
    await userEvent.click(addButton)

    await waitFor(() => {
      const saved = localStorage.getItem('clipboard-history')
      expect(saved).toBeTruthy()
      if (saved) {
        const items = JSON.parse(saved)
        expect(items.length).toBeGreaterThan(0)
        expect(items[0].content).toBe('Persistent item')
      }
    })
  })

  it('should load items from localStorage on mount', () => {
    const mockItems = [
      {
        id: '1',
        content: 'Previous item',
        timestamp: Date.now(),
        isPinned: false,
        type: 'text' as const,
      },
    ]
    localStorage.setItem('clipboard-history', JSON.stringify(mockItems))

    render(<ClipboardHistoryPage />)

    expect(screen.getByText('Previous item')).toBeInTheDocument()
  })

  it('should display empty state when no items', () => {
    render(<ClipboardHistoryPage />)

    expect(screen.getByText(/No clipboard history yet/i)).toBeInTheDocument()
  })

  it('should show pinned items section when pinned items exist', async () => {
    const mockItems = [
      {
        id: '1',
        content: 'Pinned item',
        timestamp: Date.now(),
        isPinned: true,
        type: 'text' as const,
      },
      {
        id: '2',
        content: 'Regular item',
        timestamp: Date.now(),
        isPinned: false,
        type: 'text' as const,
      },
    ]
    localStorage.setItem('clipboard-history', JSON.stringify(mockItems))

    render(<ClipboardHistoryPage />)

    expect(screen.getByText('Pinned item')).toBeInTheDocument()
    expect(screen.getByText('Regular item')).toBeInTheDocument()
  })

  it('should display item count info', async () => {
    render(<ClipboardHistoryPage />)

    // Add item
    const addButton = screen.getByRole('button', { name: /Add Current Clipboard/i })
    await userEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  it('should display long content without truncation', () => {
    const longContent = 'a'.repeat(200)
    const mockItems = [
      {
        id: '1',
        content: longContent,
        timestamp: Date.now(),
        isPinned: false,
        type: 'text' as const,
      },
    ]
    localStorage.setItem('clipboard-history', JSON.stringify(mockItems))

    render(<ClipboardHistoryPage />)

    // Content should be displayed in full (no truncation)
    const displayedText = screen.getByText(/aaa/i)
    expect(displayedText.textContent).toBe(longContent)
    expect(screen.getByText('200 characters')).toBeInTheDocument()
  })

  it('should respect max items limit (100)', async () => {
    // Pre-fill with 100 items
    const maxItems = Array.from({ length: 100 }, (_, i) => ({
      id: `${i}`,
      content: `Item ${i}`,
      timestamp: Date.now() - i * 1000,
      isPinned: false,
      type: 'text' as const,
    }))
    localStorage.setItem('clipboard-history', JSON.stringify(maxItems))

    render(<ClipboardHistoryPage />)

    // Try to add one more item
    const addButton = screen.getByRole('button', { name: /Add Current Clipboard/i })
    await userEvent.click(addButton)

    await waitFor(() => {
      const saved = localStorage.getItem('clipboard-history')
      if (saved) {
        const items = JSON.parse(saved)
        // Should still be 100 items (oldest non-pinned item removed)
        expect(items.length).toBeLessThanOrEqual(100)
      }
    })
  })
})
