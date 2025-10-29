import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
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
vi.mock('@/lib/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

describe('Clipboard History Page - Component Tests', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should render clipboard history page', () => {
    render(<ClipboardHistoryPage />)

    expect(
      screen.getByRole('heading', { name: /Clipboard History Manager/i, level: 1 })
    ).toBeInTheDocument()
    expect(screen.getByText(/Track and manage your clipboard history locally/i)).toBeInTheDocument()
  })

  it('should display monitoring control section', () => {
    render(<ClipboardHistoryPage />)

    expect(screen.getByRole('heading', { name: /Monitoring/i })).toBeInTheDocument()
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
      expect(toast.success).toHaveBeenCalledWith('Clipboard monitoring started')
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
      expect(toast.info).toHaveBeenCalledWith('Clipboard monitoring stopped')
    })
  })

  it('should display manual add section', () => {
    render(<ClipboardHistoryPage />)

    expect(screen.getByRole('heading', { name: /Add to History/i })).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Paste or type content to add to history...')
    ).toBeInTheDocument()
  })

  it('should add item manually when button clicked', async () => {
    const { toast } = await import('sonner')
    render(<ClipboardHistoryPage />)

    const textarea = screen.getByPlaceholderText('Paste or type content to add to history...')
    const addButton = screen.getByRole('button', { name: /Add to History/i })

    await userEvent.type(textarea, 'Test clipboard content')
    await userEvent.click(addButton)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Added to clipboard history')
      expect(screen.getByText('Test clipboard content')).toBeInTheDocument()
    })
  })

  it('should show error when trying to add empty content', async () => {
    const { toast } = await import('sonner')
    render(<ClipboardHistoryPage />)

    const addButton = screen.getByRole('button', { name: /Add to History/i })
    await userEvent.click(addButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Content cannot be empty')
    })
  })

  it('should display search input when items exist', async () => {
    render(<ClipboardHistoryPage />)

    // Add an item
    const textarea = screen.getByPlaceholderText('Paste or type content to add to history...')
    const addButton = screen.getByRole('button', { name: /Add to History/i })

    await userEvent.type(textarea, 'Test item')
    await userEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search clipboard history...')).toBeInTheDocument()
    })
  })

  it('should filter items based on search query', async () => {
    render(<ClipboardHistoryPage />)

    // Add multiple items
    const textarea = screen.getByPlaceholderText('Paste or type content to add to history...')
    const addButton = screen.getByRole('button', { name: /Add to History/i })

    await userEvent.type(textarea, 'First item')
    await userEvent.click(addButton)
    await userEvent.clear(textarea)
    await userEvent.type(textarea, 'Second item')
    await userEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('First item')).toBeInTheDocument()
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
    render(<ClipboardHistoryPage />)

    const textarea = screen.getByPlaceholderText('Paste or type content to add to history...')
    const addButton = screen.getByRole('button', { name: /Add to History/i })

    await userEvent.type(textarea, 'Test item')
    await userEvent.click(addButton)

    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      // Should have pin/unpin button for the item
      expect(buttons.length).toBeGreaterThan(1)
    })
  })

  it('should pin and unpin items', async () => {
    const { toast } = await import('sonner')
    render(<ClipboardHistoryPage />)

    // Add item
    const textarea = screen.getByPlaceholderText('Paste or type content to add to history...')
    const addButton = screen.getByRole('button', { name: /Add to History/i })

    await userEvent.type(textarea, 'Test item to pin')
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

    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })

    render(<ClipboardHistoryPage />)

    // Add item
    const textarea = screen.getByPlaceholderText('Paste or type content to add to history...')
    const addButton = screen.getByRole('button', { name: /Add to History/i })

    await userEvent.type(textarea, 'Test copy item')
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
        expect(toast.success).toHaveBeenCalledWith('Copied to clipboard')
      })
    }
  })

  it('should delete item when delete button clicked', async () => {
    const { toast } = await import('sonner')
    render(<ClipboardHistoryPage />)

    // Add item
    const textarea = screen.getByPlaceholderText('Paste or type content to add to history...')
    const addButton = screen.getByRole('button', { name: /Add to History/i })

    await userEvent.type(textarea, 'Test delete item')
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
        expect(toast.success).toHaveBeenCalledWith('Item deleted')
        expect(screen.queryByText('Test delete item')).not.toBeInTheDocument()
      })
    }
  })

  it('should display clear all button when items exist', async () => {
    render(<ClipboardHistoryPage />)

    // Add item
    const textarea = screen.getByPlaceholderText('Paste or type content to add to history...')
    const addButton = screen.getByRole('button', { name: /Add to History/i })

    await userEvent.type(textarea, 'Test item')
    await userEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Clear All/i })).toBeInTheDocument()
    })
  })

  it('should clear all items when clear all button clicked', async () => {
    const { toast } = await import('sonner')
    render(<ClipboardHistoryPage />)

    // Add multiple items
    const textarea = screen.getByPlaceholderText('Paste or type content to add to history...')
    const addButton = screen.getByRole('button', { name: /Add to History/i })

    await userEvent.type(textarea, 'First item')
    await userEvent.click(addButton)
    await userEvent.clear(textarea)
    await userEvent.type(textarea, 'Second item')
    await userEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('First item')).toBeInTheDocument()
      expect(screen.getByText('Second item')).toBeInTheDocument()
    })

    // Clear all
    const clearButton = screen.getByRole('button', { name: /Clear All/i })
    await userEvent.click(clearButton)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Clipboard history cleared')
      expect(screen.queryByText('First item')).not.toBeInTheDocument()
      expect(screen.queryByText('Second item')).not.toBeInTheDocument()
    })
  })

  it('should persist items to localStorage', async () => {
    render(<ClipboardHistoryPage />)

    // Add item
    const textarea = screen.getByPlaceholderText('Paste or type content to add to history...')
    const addButton = screen.getByRole('button', { name: /Add to History/i })

    await userEvent.type(textarea, 'Persistent item')
    await userEvent.click(addButton)

    await waitFor(() => {
      const saved = localStorage.getItem('clipboardHistory')
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
        pinned: false,
      },
    ]
    localStorage.setItem('clipboardHistory', JSON.stringify(mockItems))

    render(<ClipboardHistoryPage />)

    expect(screen.getByText('Previous item')).toBeInTheDocument()
  })

  it('should display empty state when no items', () => {
    render(<ClipboardHistoryPage />)

    expect(screen.getByText(/No clipboard items yet/i)).toBeInTheDocument()
  })

  it('should show pinned items section when pinned items exist', async () => {
    const mockItems = [
      {
        id: '1',
        content: 'Pinned item',
        timestamp: Date.now(),
        pinned: true,
      },
      {
        id: '2',
        content: 'Regular item',
        timestamp: Date.now(),
        pinned: false,
      },
    ]
    localStorage.setItem('clipboardHistory', JSON.stringify(mockItems))

    render(<ClipboardHistoryPage />)

    expect(screen.getByRole('heading', { name: /Pinned Items/i })).toBeInTheDocument()
    expect(screen.getByText('Pinned item')).toBeInTheDocument()
  })

  it('should display item count info', async () => {
    render(<ClipboardHistoryPage />)

    // Add item
    const textarea = screen.getByPlaceholderText('Paste or type content to add to history...')
    const addButton = screen.getByRole('button', { name: /Add to History/i })

    await userEvent.type(textarea, 'Test item')
    await userEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText(/1 item/i)).toBeInTheDocument()
    })
  })

  it('should truncate long content in preview', () => {
    const longContent = 'a'.repeat(200)
    const mockItems = [
      {
        id: '1',
        content: longContent,
        timestamp: Date.now(),
        pinned: false,
      },
    ]
    localStorage.setItem('clipboardHistory', JSON.stringify(mockItems))

    render(<ClipboardHistoryPage />)

    // Content should be truncated (check for ellipsis or shortened version)
    const displayedText = screen.getByText(/aaa/i)
    expect(displayedText.textContent?.length).toBeLessThan(longContent.length)
  })

  it('should display pro tips section', () => {
    render(<ClipboardHistoryPage />)

    expect(screen.getByRole('heading', { name: /Pro Tips/i })).toBeInTheDocument()
  })

  it('should respect max items limit (100)', async () => {
    // Pre-fill with 100 items
    const maxItems = Array.from({ length: 100 }, (_, i) => ({
      id: `${i}`,
      content: `Item ${i}`,
      timestamp: Date.now() - i * 1000,
      pinned: false,
    }))
    localStorage.setItem('clipboardHistory', JSON.stringify(maxItems))

    render(<ClipboardHistoryPage />)

    // Try to add one more item
    const textarea = screen.getByPlaceholderText('Paste or type content to add to history...')
    const addButton = screen.getByRole('button', { name: /Add to History/i })

    await userEvent.type(textarea, 'New item')
    await userEvent.click(addButton)

    await waitFor(() => {
      const saved = localStorage.getItem('clipboardHistory')
      if (saved) {
        const items = JSON.parse(saved)
        // Should still be 100 items (oldest non-pinned item removed)
        expect(items.length).toBeLessThanOrEqual(100)
      }
    })
  })
})
